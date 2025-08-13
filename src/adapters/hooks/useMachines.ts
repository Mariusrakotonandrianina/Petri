// src/adapters/hooks/useMachines.ts - Version corrigée
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Machine } from '../../core/entities/Machines';
import { MachineController, MachineControllerResponse } from '../controllers/MachineController';
import { LocalMachineRepository } from '../../infrastructure/repositories/LocalMachineRepository';
import { InMemoryStorageService } from '../../infrastructure/services/InMemoryStorageService';
import { MachineFilters, MachineStats } from '../../core/usecases/machines/GetMachines';

export interface UseMachinesReturn {
  // Data
  machines: Machine[];
  loading: boolean;
  error: string | null;
  stats: MachineStats;
  
  // Basic CRUD operations
  createMachine: (data: Omit<Machine, 'id'>) => Promise<Machine>;
  updateMachine: (id: number, data: Partial<Machine>) => Promise<Machine>;
  deleteMachine: (id: number) => Promise<void>;
  
  // Additional operations
  toggleMachineStatus: (id: number) => Promise<Machine>;
  updateUtilisation: (id: number, utilisation: number) => Promise<Machine>;
  scheduleMaintenance: (id: number, date: string) => Promise<Machine>;
  
  // Query operations
  getMachineById: (id: number) => Promise<Machine | null>;
  getMachinesByStatus: (status: "active" | "panne" | "maintenance") => Promise<Machine[]>;
  getMachinesByType: (type: string) => Promise<Machine[]>;
  searchMachines: (searchTerm: string) => Promise<Machine[]>;
  filterMachines: (filters: MachineFilters) => Promise<Machine[]>;
  
  // Maintenance operations
  getMachinesNeedingMaintenance: () => Promise<Machine[]>;
  getMachinesNearMaintenance: (days?: number) => Promise<Machine[]>;
  getMaintenanceAlerts: () => Promise<{ urgent: Machine[]; upcoming: Machine[] }>;
  
  // Utility operations
  refreshMachines: () => Promise<void>;
  clearError: () => void;
  canDelete: (id: number) => Promise<{ canDelete: boolean; reason?: string }>;
  forceDelete: (id: number) => Promise<void>;
  machineExists: (id: number) => Promise<boolean>;
  
  // Available options
  availableTypes: string[];
  getAvailableTypes: () => Promise<string[]>;
}

// Singleton instance pour éviter la re-création
let controllerInstance: MachineController | null = null;

const getController = (): MachineController => {
  if (!controllerInstance) {
    const storageService = new InMemoryStorageService();
    const machineRepository = new LocalMachineRepository(storageService);
    controllerInstance = new MachineController(machineRepository);
  }
  return controllerInstance;
};

export const useMachines = (): UseMachinesReturn => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);

  const controller = useMemo(() => getController(), []);

  // Helper pour gérer les réponses du controller
  const handleControllerResponse = useCallback(<T,>(
    response: MachineControllerResponse<T>, 
    onSuccess?: (data: T) => void
  ): T => {
    if (!response.success) {
      const errorMessage = response.error || 'Une erreur est survenue';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
    setError(null);
    if (onSuccess && response.data !== undefined) {
      onSuccess(response.data);
    }
    return response.data as T;
  }, []);

  // Chargement initial des machines
  const loadMachines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await controller.getAllMachines();
      const machinesData = handleControllerResponse(response);
      setMachines(machinesData);
      
      // Charger aussi les types disponibles
      const typesResponse = await controller.getAvailableTypes();
      const typesData = handleControllerResponse(typesResponse);
      setAvailableTypes(typesData);
      
    } catch (err) {
      console.error('Erreur lors du chargement des machines:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [controller, handleControllerResponse]);

  // CRUD Operations
  const createMachine = useCallback(async (data: Omit<Machine, 'id'>): Promise<Machine> => {
    try {
      setError(null);
      const response = await controller.createNewMachine(data);
      const newMachine = handleControllerResponse(response);
      
      // Recharger toutes les machines pour maintenir la cohérence
      await loadMachines();
      
      return newMachine;
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      throw error;
    }
  }, [controller, handleControllerResponse, loadMachines]);

  const updateMachine = useCallback(async (id: number, data: Partial<Machine>): Promise<Machine> => {
    try {
      setError(null);
      const response = await controller.updateExistingMachine(id, data);
      const updatedMachine = handleControllerResponse(response);
      
      // Mettre à jour la liste locale
      setMachines(prev => prev.map(m => m.id === id ? updatedMachine : m));
      
      return updatedMachine;
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      throw error;
    }
  }, [controller, handleControllerResponse]);

  const deleteMachine = useCallback(async (id: number): Promise<void> => {
    try {
      setError(null);
      const response = await controller.deleteMachineById(id);
      handleControllerResponse(response);
      
      // Mettre à jour la liste locale
      setMachines(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
    }
  }, [controller, handleControllerResponse]);

  // Additional operations
  const toggleMachineStatus = useCallback(async (id: number): Promise<Machine> => {
    try {
      setError(null);
      const response = await controller.toggleMachineStatus(id);
      const updatedMachine = handleControllerResponse(response);
      
      setMachines(prev => prev.map(m => m.id === id ? updatedMachine : m));
      return updatedMachine;
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      throw error;
    }
  }, [controller, handleControllerResponse]);

  const updateUtilisation = useCallback(async (id: number, utilisation: number): Promise<Machine> => {
    try {
      setError(null);
      const response = await controller.updateMachineUtilisation(id, utilisation);
      const updatedMachine = handleControllerResponse(response);
      
      setMachines(prev => prev.map(m => m.id === id ? updatedMachine : m));
      return updatedMachine;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisation:', error);
      throw error;
    }
  }, [controller, handleControllerResponse]);

  const scheduleMaintenance = useCallback(async (id: number, date: string): Promise<Machine> => {
    try {
      setError(null);
      const response = await controller.scheduleMaintenance(id, date);
      const updatedMachine = handleControllerResponse(response);
      
      setMachines(prev => prev.map(m => m.id === id ? updatedMachine : m));
      return updatedMachine;
    } catch (error) {
      console.error('Erreur lors de la planification de maintenance:', error);
      throw error;
    }
  }, [controller, handleControllerResponse]);

  // Query operations
  const getMachineById = useCallback(async (id: number): Promise<Machine | null> => {
    try {
      setError(null);
      const response = await controller.getMachineById(id);
      return handleControllerResponse(response);
    } catch (error) {
      console.error('Erreur lors de la recherche par ID:', error);
      throw error;
    }
  }, [controller, handleControllerResponse]);

  const getMachinesByStatus = useCallback(async (status: "active" | "panne" | "maintenance"): Promise<Machine[]> => {
    try {
      setError(null);
      const response = await controller.getMachinesByStatus(status);
      return handleControllerResponse(response);
    } catch (error) {
      console.error('Erreur lors de la recherche par statut:', error);
      throw error;
    }
  }, [controller, handleControllerResponse]);

  const getMachinesByType = useCallback(async (type: string): Promise<Machine[]> => {
    try {
      setError(null);
      const response = await controller.getMachinesByType(type);
      return handleControllerResponse(response);
    } catch (error) {
      console.error('Erreur lors de la recherche par type:', error);
      throw error;
    }
  }, [controller, handleControllerResponse]);

  const searchMachines = useCallback(async (searchTerm: string): Promise<Machine[]> => {
    try {
      setError(null);
      const response = await controller.searchMachines(searchTerm);
      return handleControllerResponse(response);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      throw error;
    }
  }, [controller, handleControllerResponse]);

  const filterMachines = useCallback(async (filters: MachineFilters): Promise<Machine[]> => {
    try {
      setError(null);
      const response = await controller.getMachinesWithFilters(filters);
      return handleControllerResponse(response);
    } catch (error) {
      console.error('Erreur lors du filtrage:', error);
      throw error;
    }
  }, [controller, handleControllerResponse]);

  // Maintenance operations
  const getMachinesNeedingMaintenance = useCallback(async (): Promise<Machine[]> => {
    try {
      setError(null);
      const response = await controller.getMachinesNeedingMaintenance();
      return handleControllerResponse(response);
    } catch (error) {
      console.error('Erreur lors de la recherche de machines nécessitant une maintenance:', error);
      throw error;
    }
  }, [controller, handleControllerResponse]);

  const getMachinesNearMaintenance = useCallback(async (days: number = 7): Promise<Machine[]> => {
    try {
      setError(null);
      const response = await controller.getMachinesNearMaintenance(days);
      return handleControllerResponse(response);
    } catch (error) {
      console.error('Erreur lors de la recherche de machines proches de la maintenance:', error);
      throw error;
    }
  }, [controller, handleControllerResponse]);

  const getMaintenanceAlerts = useCallback(async (): Promise<{ urgent: Machine[]; upcoming: Machine[] }> => {
    try {
      setError(null);
      const response = await controller.getMaintenanceAlerts();
      return handleControllerResponse(response);
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes de maintenance:', error);
      throw error;
    }
  }, [controller, handleControllerResponse]);

  // Utility operations
  const refreshMachines = useCallback(async (): Promise<void> => {
    await loadMachines();
  }, [loadMachines]);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  const canDelete = useCallback(async (id: number): Promise<{ canDelete: boolean; reason?: string }> => {
    try {
      setError(null);
      const response = await controller.canDeleteMachine(id);
      return handleControllerResponse(response);
    } catch (error) {
      console.error('Erreur lors de la vérification de suppression:', error);
      throw error;
    }
  }, [controller, handleControllerResponse]);

  const forceDelete = useCallback(async (id: number): Promise<void> => {
    try {
      setError(null);
      const response = await controller.forceDeleteMachine(id);
      handleControllerResponse(response);
      
      setMachines(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression forcée:', error);
      throw error;
    }
  }, [controller, handleControllerResponse]);

  const machineExists = useCallback(async (id: number): Promise<boolean> => {
    try {
      setError(null);
      const response = await controller.machineExists(id);
      return handleControllerResponse(response);
    } catch (error) {
      console.error('Erreur lors de la vérification d\'existence:', error);
      throw error;
    }
  }, [controller, handleControllerResponse]);

  const getAvailableTypes = useCallback(async (): Promise<string[]> => {
    try {
      setError(null);
      const response = await controller.getAvailableTypes();
      const types = handleControllerResponse(response);
      setAvailableTypes(types);
      return types;
    } catch (error) {
      console.error('Erreur lors de la récupération des types:', error);
      throw error;
    }
  }, [controller, handleControllerResponse]);

  // Calcul des statistiques en temps réel
  const stats = useMemo((): MachineStats => {
    const total = machines.length;
    const active = machines.filter(m => m.status === 'active').length;
    const maintenance = machines.filter(m => m.status === 'maintenance').length;
    const panne = machines.filter(m => m.status === 'panne').length;
    const maintenanceNeeded = machines.filter(m => m.needsMaintenance()).length;

    const averageUtilisation = total > 0 
      ? machines.reduce((acc, m) => acc + m.utilisation, 0) / total 
      : 0;

    const totalCapacity = machines.reduce((acc, m) => acc + m.capacite, 0);
    const effectiveCapacity = machines.reduce((acc, m) => acc + m.getEffectiveCapacity(), 0);

    return {
      total,
      active,
      maintenance,
      panne,
      averageUtilisation,
      totalCapacity,
      effectiveCapacity,
      maintenanceNeeded
    };
  }, [machines]);

  // Chargement initial
  useEffect(() => {
    loadMachines();
  }, [loadMachines]);

  return {
    // Data
    machines,
    loading,
    error,
    stats,
    
    // Basic CRUD operations
    createMachine,
    updateMachine,
    deleteMachine,
    
    // Additional operations
    toggleMachineStatus,
    updateUtilisation,
    scheduleMaintenance,
    
    // Query operations
    getMachineById,
    getMachinesByStatus,
    getMachinesByType,
    searchMachines,
    filterMachines,
    
    // Maintenance operations
    getMachinesNeedingMaintenance,
    getMachinesNearMaintenance,
    getMaintenanceAlerts,
    
    // Utility operations
    refreshMachines,
    clearError,
    canDelete,
    forceDelete,
    machineExists,
    
    // Available options
    availableTypes,
    getAvailableTypes
  };
};