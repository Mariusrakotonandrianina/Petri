// src/adapters/hooks/useMachines.ts - Version corrigée
import { useState, useEffect, useCallback } from 'react';
import { Machine } from '@/core/entities/Machines';
import { MachineController } from '../controllers/MachineController';
import { LocalMachineRepository } from '../../infrastructure/repositories/LocalMachineRepository';
import { InMemoryStorageService } from '../../infrastructure/services/InMemoryStorageService';

// Utilisation d'un service en mémoire au lieu de localStorage pour éviter les erreurs
const storageService = new InMemoryStorageService();
const machineRepository = new LocalMachineRepository(storageService);
const machineController = new MachineController(machineRepository);

export const useMachines = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMachines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await machineController.getAllMachines();
      setMachines(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(errorMessage);
      console.error('Erreur lors du chargement des machines:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMachine = useCallback(async (data: Omit<Machine, 'id'>) => {
    try {
      setError(null);
      const newMachine = await machineController.createNewMachine(data);
      setMachines(prev => [...prev, newMachine]);
      return newMachine;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateMachine = useCallback(async (id: number, data: Partial<Machine>) => {
    try {
      setError(null);
      const updatedMachine = await machineController.updateExistingMachine(id, data);
      setMachines(prev => prev.map(m => m.id === id ? updatedMachine : m));
      return updatedMachine;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const toggleMachineStatus = useCallback(async (id: number) => {
    try {
      setError(null);
      const updatedMachine = await machineController.toggleMachineStatus(id);
      setMachines(prev => prev.map(m => m.id === id ? updatedMachine : m));
      return updatedMachine;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du changement de statut';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteMachine = useCallback(async (id: number) => {
    try {
      setError(null);
      await machineController.deleteMachineById(id);
      setMachines(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getMachineById = useCallback(async (id: number) => {
    try {
      return await machineController.getMachineById(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération';
      setError(errorMessage);
      return null;
    }
  }, []);

  const getMachinesByStatus = useCallback(async (status: "active" | "panne" | "maintenance") => {
    try {
      return await machineController.getMachinesByStatus(status);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du filtrage';
      setError(errorMessage);
      return [];
    }
  }, []);

  useEffect(() => {
    loadMachines();
  }, [loadMachines]);

  // Statistiques utiles
  const stats = {
    total: machines.length,
    active: machines.filter(m => m.status === 'active').length,
    maintenance: machines.filter(m => m.status === 'maintenance').length,
    panne: machines.filter(m => m.status === 'panne').length,
    averageUtilisation: machines.length > 0 
      ? machines.reduce((acc, m) => acc + m.utilisation, 0) / machines.length 
      : 0
  };

  return {
    machines,
    loading,
    error,
    stats,
    // CRUD operations
    createMachine,
    updateMachine,
    deleteMachine,
    // Additional operations
    toggleMachineStatus,
    getMachineById,
    getMachinesByStatus,
    // Utility
    refreshMachines: loadMachines,
    clearError: () => setError(null)
  };
};