import { useState, useEffect, useCallback } from 'react';
import { Ouvrier } from '../../core/entities/Ouvrier';
import { OuvrierController } from '../controllers/OuvrierController';
import { LocalOuvrierRepository } from '../../infrastructure/repositories/LocalOuvrierRepository';
import { LocalStorageService } from '../../infrastructure/services/LocalStorageService';

const storageService = new LocalStorageService();
const ouvrierRepository = new LocalOuvrierRepository(storageService);
const ouvrierController = new OuvrierController(ouvrierRepository);

export const useOuvriers = () => {
  const [ouvriers, setOuvriers] = useState<Ouvrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOuvriers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ouvrierController.getAllOuvriers();
      setOuvriers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  const createOuvrier = useCallback(async (data: Omit<Ouvrier, 'id'>) => {
    try {
      setError(null);
      const newOuvrier = await ouvrierController.createNewOuvrier(data);
      setOuvriers(prev => [...prev, newOuvrier]);
      return newOuvrier;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateOuvrier = useCallback(async (id: number, data: Partial<Ouvrier>) => {
    try {
      setError(null);
      const updatedOuvrier = await ouvrierController.updateExistingOuvrier(id, data);
      if (updatedOuvrier) {
        setOuvriers(prev => prev.map(o => o.id === id ? updatedOuvrier : o));
      }
      return updatedOuvrier;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const assignTask = useCallback(async (id: number, task: string) => {
    try {
      setError(null);
      const success = await ouvrierController.assignTaskToOuvrier(id, task);
      if (success) {
        await loadOuvriers(); // Recharger pour avoir les données mises à jour
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'assignation de tâche';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadOuvriers]);

  const completeTask = useCallback(async (id: number) => {
    try {
      setError(null);
      const success = await ouvrierController.completeOuvrierTask(id);
      if (success) {
        await loadOuvriers(); // Recharger pour avoir les données mises à jour
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la finalisation de la tâche';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadOuvriers]);

  const deleteOuvrier = useCallback(async (id: number) => {
    try {
      setError(null);
      const success = await ouvrierController.deleteOuvrierById(id);
      if (success) {
        setOuvriers(prev => prev.filter(o => o.id !== id));
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getAvailableOuvriers = useCallback(async () => {
    try {
      setError(null);
      return await ouvrierController.getAvailableOuvriers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des ouvriers disponibles';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getOuvriersBySpecialite = useCallback(async (specialite: string) => {
    try {
      setError(null);
      return await ouvrierController.getOuvriersBySpecialite(specialite);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la recherche par spécialité';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getOuvriersByCompetence = useCallback(async (competence: string) => {
    try {
      setError(null);
      return await ouvrierController.getOuvriersByCompetence(competence);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la recherche par compétence';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  useEffect(() => {
    loadOuvriers();
  }, [loadOuvriers]);

  return {
    ouvriers,
    loading,
    error,
    createOuvrier,
    updateOuvrier,
    assignTask,
    completeTask,
    deleteOuvrier,
    getAvailableOuvriers,
    getOuvriersBySpecialite,
    getOuvriersByCompetence,
    refreshOuvriers: loadOuvriers
  };
};