import { useState, useEffect, useCallback } from 'react';
import { Machine } from '@/core/entities/Machines';
import { MachineController } from '../controllers/MachineController';
import { LocalMachineRepository } from '../../infrastructure/repositories/LocalMachineRepository';
import { LocalStorageService } from '../../infrastructure/services/LocalStorageService';

const storageService = new LocalStorageService();
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
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
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

  useEffect(() => {
    loadMachines();
  }, [loadMachines]);

  return {
    machines,
    loading,
    error,
    createMachine,
    updateMachine,
    toggleMachineStatus,
    deleteMachine,
    refreshMachines: loadMachines
  };
};