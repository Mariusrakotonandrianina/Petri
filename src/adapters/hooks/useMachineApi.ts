"use client";
import { useState, useCallback } from 'react';

const API_BASE_URL = process.env.API_BASE_URL;

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

export interface Machine {
  id?: string | number;
  _id?: string;
  nom: string;
  type: string;
  capacite: number;
  status: 'active' | 'panne' | 'maintenance';
  utilisation: number;
  usage: string;
  atelierId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MachineStatistics {
  total: number;
  actives: number;
  enPanne: number;
  maintenance: number;
  utilisationMoyenne: number;
  tauxDisponibilite: number;
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

// Hook spécialisé pour les machines
export const useMachineApi = () => {
  const { makeApiCall, loading, error, clearError } = useApiCall();

  // Routes CRUD de base
  const getMachines = useCallback(async (): Promise<Machine[]> => {
    const response = await makeApiCall<Machine[]>('/machines');
    return Array.isArray(response) ? response : (response as any).data || [];
  }, [makeApiCall]);

  const getMachine = useCallback(async (id: string | number): Promise<Machine> => {
    return await makeApiCall<Machine>(`/machines/${id}`);
  }, [makeApiCall]);

  const createMachine = useCallback(async (machineData: Partial<Machine>): Promise<Machine> => {
    return await makeApiCall<Machine>('/machines', {
      method: 'POST',
      body: JSON.stringify(machineData),
    });
  }, [makeApiCall]);

  const updateMachine = useCallback(async (id: string | number, machineData: Partial<Machine>): Promise<Machine> => {
    return await makeApiCall<Machine>(`/machines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(machineData),
    });
  }, [makeApiCall]);

  const deleteMachine = useCallback(async (id: string | number): Promise<void> => {
    await makeApiCall<void>(`/machines/${id}`, {
      method: 'DELETE',
    });
  }, [makeApiCall]);

  // Routes de filtrage
  const filterByStatus = useCallback(async (status: string): Promise<Machine[]> => {
    const response = await makeApiCall<Machine[]>(`/machines/status/${status}`);
    return Array.isArray(response) ? response : (response as any).data || [];
  }, [makeApiCall]);

  const filterByType = useCallback(async (type: string): Promise<Machine[]> => {
    const response = await makeApiCall<Machine[]>(`/machines/type/${type}`);
    return Array.isArray(response) ? response : (response as any).data || [];
  }, [makeApiCall]);

  const filterByUsage = useCallback(async (usage: string): Promise<Machine[]> => {
    const response = await makeApiCall<Machine[]>(`/machines/usage/${usage}`);
    return Array.isArray(response) ? response : (response as any).data || [];
  }, [makeApiCall]);

  // Routes meta
  const listTypes = useCallback(async (): Promise<string[]> => {
    const response = await makeApiCall<string[]>('/machines/meta/types');
    return Array.isArray(response) ? response : (response as any).data || [];
  }, [makeApiCall]);

  const listUsages = useCallback(async (): Promise<string[]> => {
    const response = await makeApiCall<string[]>('/machines/meta/usages');
    return Array.isArray(response) ? response : (response as any).data || [];
  }, [makeApiCall]);

  // Gestion des statuts
  const updateMachineStatus = useCallback(async (id: string | number, status: string): Promise<any> => {
    return await makeApiCall<any>(`/machines/${id}/${status}`, {
      method: 'PATCH',
    });
  }, [makeApiCall]);

  const cycleMachineStatus = useCallback(async (id: string | number): Promise<Machine> => {
    return await makeApiCall<Machine>(`/machines/${id}/status/cycle-status`, {
      method: 'PATCH',
    });
  }, [makeApiCall]);

  // Statistiques
  const getMachineStatistics = useCallback(async (): Promise<MachineStatistics> => {
    return await makeApiCall<MachineStatistics>('/machines/statistiques');
  }, [makeApiCall]);

  return {
    // CRUD
    getMachines,
    getMachine,
    createMachine,
    updateMachine,
    deleteMachine,
    
    // Filtrage
    filterByStatus,
    filterByType,
    filterByUsage,
    
    // Meta
    listTypes,
    listUsages,
    
    // Statuts
    updateMachineStatus,
    cycleMachineStatus,
    
    // Statistiques
    getMachineStatistics,
    
    // État
    loading,
    error,
    clearError,
  };
};