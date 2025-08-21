"use client";
import { useState, useCallback } from 'react';

const API_BASE_URL = process.env.API_BASE_URL;

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

export type TacheStatus = "en_attente" | "en_cours" | "terminee" | "annulee";
export type TachePriorite = "basse" | "normale" | "haute" | "critique";
export type TacheType = "affectation" | "liberation" | "maintenance" | "production";

export interface Tache {
  id?: string | number;
  _id?: string;
  nom: string;
  usage: string;
  type: TacheType;
  dureeEstimee: number;
  priorite: TachePriorite;
  prerequis: string[];
  ressourcesRequises: {
    ateliers: string[];
    machines: string[];
    ouvriers: number;
  };
  status: TacheStatus;
  dateCreation: Date;
  dateDebut?: Date;
  dateFin?: Date;
}

export interface TacheStatistics {
  total: number;
  repartitionStatus: {
    enAttente: number;
    enCours: number;
    terminees: number;
    annulees: number;
  };
  repartitionPriorite: {
    basse: number;
    normale: number;
    haute: number;
    critique: number;
  };
  repartitionType: {
    affectation: number;
    liberation: number;
    maintenance: number;
    production: number;
  };
  tauxCompletion: number;
  tauxEnCours: number;
}

export interface TacheEnumValues {
  status: TacheStatus[];
  priorites: TachePriorite[];
  types: TacheType[];
}

// Hook de base pour les appels API
const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeApiCall = useCallback(async <T>(
    endpoint: string, 
    options?: RequestInit
  ): Promise<T> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { makeApiCall, loading, error, clearError };
};

// Hook spécialisé pour les tâches
export const useTacheApi = () => {
  const { makeApiCall, loading, error, clearError } = useApiCall();

  // Routes CRUD de base
  const getTaches = useCallback(async (): Promise<Tache[]> => {
    const response = await makeApiCall<Tache[]>('/taches');
    return Array.isArray(response) ? response : (response as any).data || [];
  }, [makeApiCall]);

  const getTache = useCallback(async (id: string | number): Promise<Tache> => {
    return await makeApiCall<Tache>(`/taches/${id}`);
  }, [makeApiCall]);

  const createTache = useCallback(async (tacheData: Partial<Tache>): Promise<Tache> => {
    return await makeApiCall<Tache>('/taches', {
      method: 'POST',
      body: JSON.stringify(tacheData),
    });
  }, [makeApiCall]);

  const updateTache = useCallback(async (id: string | number, tacheData: Partial<Tache>): Promise<Tache> => {
    return await makeApiCall<Tache>(`/taches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tacheData),
    });
  }, [makeApiCall]);

  const deleteTache = useCallback(async (id: string | number): Promise<void> => {
    await makeApiCall<void>(`/taches/${id}`, {
      method: 'DELETE',
    });
  }, [makeApiCall]);

  // Routes de filtrage
  const getTachesByStatus = useCallback(async (status: TacheStatus): Promise<Tache[]> => {
    const response = await makeApiCall<Tache[]>(`/taches/status/${status}`);
    return Array.isArray(response) ? response : (response as any).data || [];
  }, [makeApiCall]);

  const getTachesByPriorite = useCallback(async (priorite: TachePriorite): Promise<Tache[]> => {
    const response = await makeApiCall<Tache[]>(`/taches/priorite/${priorite}`);
    return Array.isArray(response) ? response : (response as any).data || [];
  }, [makeApiCall]);

  const getTachesByType = useCallback(async (type: TacheType): Promise<Tache[]> => {
    const response = await makeApiCall<Tache[]>(`/taches/type/${type}`);
    return Array.isArray(response) ? response : (response as any).data || [];
  }, [makeApiCall]);

  // Gestion des statuts
  const updateTacheStatus = useCallback(async (id: string | number, status: string): Promise<any> => {
    return await makeApiCall<any>(`/taches/${id}/status/${status}`, {
      method: 'PATCH',
    });
  }, [makeApiCall]);

  const cycleTacheStatus = useCallback(async (id: string | number): Promise<any> => {
    return await makeApiCall<any>(`/taches/${id}/status/cycle`, {
      method: 'PATCH',
    });
  }, [makeApiCall]);

  // Gestion des priorités
  const updateTachePriorite = useCallback(async (id: string | number, priorite: string): Promise<any> => {
    return await makeApiCall<any>(`/taches/${id}/priorite/${priorite}`, {
      method: 'PATCH',
    });
  }, [makeApiCall]);

  const cycleTachePriorite = useCallback(async (id: string | number): Promise<any> => {
    return await makeApiCall<any>(`/taches/${id}/priorite/cycle`, {
      method: 'PATCH',
    });
  }, [makeApiCall]);

  // Routes meta
  const getEnumValues = useCallback(async (): Promise<TacheEnumValues> => {
    return await makeApiCall<TacheEnumValues>('/taches/meta/enums');
  }, [makeApiCall]);

  // Statistiques
  const getTacheStatistics = useCallback(async (): Promise<TacheStatistics> => {
    return await makeApiCall<TacheStatistics>('/taches/statistiques');
  }, [makeApiCall]);

  // Méthodes utilitaires
  const startTache = useCallback(async (id: string | number): Promise<any> => {
    return await updateTacheStatus(id, 'en_cours');
  }, [updateTacheStatus]);

  const completeTache = useCallback(async (id: string | number): Promise<any> => {
    return await updateTacheStatus(id, 'terminee');
  }, [updateTacheStatus]);

  const cancelTache = useCallback(async (id: string | number): Promise<any> => {
    return await updateTacheStatus(id, 'annulee');
  }, [updateTacheStatus]);

  const resetTache = useCallback(async (id: string | number): Promise<any> => {
    return await updateTacheStatus(id, 'en_attente');
  }, [updateTacheStatus]);

  return {
    // CRUD
    getTaches,
    getTache,
    createTache,
    updateTache,
    deleteTache,
    
    // Filtrage
    getTachesByStatus,
    getTachesByPriorite,
    getTachesByType,
    
    // Gestion des statuts
    updateTacheStatus,
    cycleTacheStatus,
    startTache,
    completeTache,
    cancelTache,
    resetTache,
    
    // Gestion des priorités
    updateTachePriorite,
    cycleTachePriorite,
    
    // Meta
    getEnumValues,
    
    // Statistiques
    getTacheStatistics,
    
    // État
    loading,
    error,
    clearError,
  };
};