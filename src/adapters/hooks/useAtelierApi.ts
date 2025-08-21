"use client";
import { useState, useCallback } from 'react';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

export interface Atelier {
  id?: string | number;
  _id?: string;
  nom: string;
  localisation: string;
  superficie: number;
  capaciteEmployes: number;
  ouvrierActuelle: number;
  status: 'actif' | 'ferme' | 'maintenance';
  usage: string;
  machinesAssociees?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AtelierStatistics {
  total: number;
  actifs: number;
  fermes: number;
  maintenance: number;
  capaciteTotaleEmployes: number;
  tauxActivite: number;
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

// Hook spécialisé pour les ateliers
export const useAtelierApi = () => {
  const { makeApiCall, loading, error, clearError } = useApiCall();

  // Routes CRUD de base
  const getAteliers = useCallback(async (): Promise<Atelier[]> => {
    const response = await makeApiCall<Atelier[]>('/ateliers');
    return Array.isArray(response) ? response : (response as any).data || [];
  }, [makeApiCall]);

  const getAtelier = useCallback(async (id: string | number): Promise<Atelier> => {
    return await makeApiCall<Atelier>(`/ateliers/${id}`);
  }, [makeApiCall]);

  const createAtelier = useCallback(async (atelierData: Partial<Atelier>): Promise<Atelier> => {
    return await makeApiCall<Atelier>('/ateliers', {
      method: 'POST',
      body: JSON.stringify(atelierData),
    });
  }, [makeApiCall]);

  const updateAtelier = useCallback(async (id: string | number, atelierData: Partial<Atelier>): Promise<Atelier> => {
    return await makeApiCall<Atelier>(`/ateliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(atelierData),
    });
  }, [makeApiCall]);

  const deleteAtelier = useCallback(async (id: string | number): Promise<void> => {
    await makeApiCall<void>(`/ateliers/${id}`, {
      method: 'DELETE',
    });
  }, [makeApiCall]);

  // Routes de filtrage
  const filterByStatus = useCallback(async (status: string): Promise<Atelier[]> => {
    const response = await makeApiCall<Atelier[]>(`/ateliers/status/${status}`);
    return Array.isArray(response) ? response : (response as any).data || [];
  }, [makeApiCall]);

  const filterByLocalisation = useCallback(async (localisation: string): Promise<Atelier[]> => {
    const response = await makeApiCall<Atelier[]>(`/ateliers/localisation/${localisation}`);
    return Array.isArray(response) ? response : (response as any).data || [];
  }, [makeApiCall]);

  // Routes meta
  const listLocalisations = useCallback(async (): Promise<string[]> => {
    const response = await makeApiCall<string[]>('/ateliers/meta/localisations');
    return Array.isArray(response) ? response : (response as any).data || [];
  }, [makeApiCall]);

  // Gestion des statuts
  const updateAtelierStatus = useCallback(async (id: string | number, status: string): Promise<any> => {
    return await makeApiCall<any>(`/ateliers/${id}/${status}`, {
      method: 'PATCH',
    });
  }, [makeApiCall]);

  const cycleAtelierStatus = useCallback(async (id: string | number): Promise<Atelier> => {
    return await makeApiCall<Atelier>(`/ateliers/${id}/cycle-status`, {
      method: 'PATCH',
    });
  }, [makeApiCall]);

  // Statistiques
  const getAtelierStatistics = useCallback(async (): Promise<AtelierStatistics> => {
    return await makeApiCall<AtelierStatistics>('/ateliers/statistiques');
  }, [makeApiCall]);

  return {
    // CRUD
    getAteliers,
    getAtelier,
    createAtelier,
    updateAtelier,
    deleteAtelier,
    
    // Filtrage
    filterByStatus,
    filterByLocalisation,
    
    // Meta
    listLocalisations,
    
    // Statuts
    updateAtelierStatus,
    cycleAtelierStatus,
    
    // Statistiques
    getAtelierStatistics,
    
    // État
    loading,
    error,
    clearError,
  };
};