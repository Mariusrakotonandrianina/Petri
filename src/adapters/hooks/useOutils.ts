import { useState, useEffect, useCallback } from 'react';
import { Outil } from '../../core/entities/Outil';
import { OutilController } from '../controllers/OutilController';
import { LocalOutilRepository } from '../../infrastructure/repositories/LocalOutilRepository';
import { LocalStorageService } from '../../infrastructure/services/LocalStorageService';

const storageService = new LocalStorageService();
const outilRepository = new LocalOutilRepository(storageService);
const outilController = new OutilController(outilRepository);

export const useOutils = () => {
  const [outils, setOutils] = useState<Outil[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOutils = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await outilController.getAllOutils();
      setOutils(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  const createOutil = useCallback(async (data: Omit<Outil, 'id'>) => {
    try {
      setError(null);
      const newOutil = await outilController.createNewOutil(data);
      setOutils(prev => [...prev, newOutil]);
      return newOutil;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateOutil = useCallback(async (id: number, data: Partial<Outil>) => {
    try {
      setError(null);
      const updatedOutil = await outilController.updateExistingOutil(id, data);
      if (updatedOutil) {
        setOutils(prev => prev.map(o => o.id === id ? updatedOutil : o));
      }
      return updatedOutil;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const reserveOutil = useCallback(async (id: number) => {
    try {
      setError(null);
      const success = await outilController.reserveOutil(id);
      if (success) {
        await loadOutils(); // Recharger pour avoir les données mises à jour
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la réservation';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadOutils]);

  const releaseOutil = useCallback(async (id: number) => {
    try {
      setError(null);
      const success = await outilController.releaseOutil(id);
      if (success) {
        await loadOutils(); // Recharger pour avoir les données mises à jour
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la libération';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadOutils]);

  const deleteOutil = useCallback(async (id: number) => {
    try {
      setError(null);
      const success = await outilController.deleteOutilById(id);
      if (success) {
        setOutils(prev => prev.filter(o => o.id !== id));
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getAvailableOutils = useCallback(async () => {
    try {
      setError(null);
      return await outilController.getAvailableOutils();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des outils disponibles';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getOutilsByType = useCallback(async (type: string) => {
    try {
      setError(null);
      return await outilController.getOutilsByType(type);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la recherche par type';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  useEffect(() => {
    loadOutils();
  }, [loadOutils]);

  return {
    outils,
    loading,
    error,
    createOutil,
    updateOutil,
    reserveOutil,
    releaseOutil,
    deleteOutil,
    getAvailableOutils,
    getOutilsByType,
    refreshOutils: loadOutils
  };
};