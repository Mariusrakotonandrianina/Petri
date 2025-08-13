// src/adapters/hooks/useApi.ts - Hooks personnalisés pour l'API
import { useState, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:5000';

// Types génériques
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Hook générique pour les appels API
export const useApiCall = () => {
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
export const useMachinesApi = () => {
  const { makeApiCall, loading, error, clearError } = useApiCall();

  const getMachines = useCallback(async () => {
    const response = await makeApiCall<any>('/machines');
    return Array.isArray(response) ? response : response.data || [];
  }, [makeApiCall]);

  const getMachine = useCallback(async (id: string | number) => {
    return await makeApiCall<any>(`/machines/${id}`);
  }, [makeApiCall]);

  const createMachine = useCallback(async (machineData: any) => {
    return await makeApiCall<any>('/machines', {
      method: 'POST',
      body: JSON.stringify(machineData),
    });
  }, [makeApiCall]);

  const updateMachine = useCallback(async (id: string | number, machineData: any) => {
    return await makeApiCall<any>(`/machines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(machineData),
    });
  }, [makeApiCall]);

  const deleteMachine = useCallback(async (id: string | number) => {
    return await makeApiCall<any>(`/machines/${id}`, {
      method: 'DELETE',
    });
  }, [makeApiCall]);

  const toggleMachineStatus = useCallback(async (id: string | number, newStatus: string) => {
    return await makeApiCall<any>(`/machines/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
  }, [makeApiCall]);

  return {
    getMachines,
    getMachine,
    createMachine,
    updateMachine,
    deleteMachine,
    toggleMachineStatus,
    loading,
    error,
    clearError,
  };
};

// Hook spécialisé pour les outils
export const useOutilsApi = () => {
  const { makeApiCall, loading, error, clearError } = useApiCall();

  const getOutils = useCallback(async () => {
    const response = await makeApiCall<any>('/outils');
    return Array.isArray(response) ? response : response.data || [];
  }, [makeApiCall]);

  const getOutil = useCallback(async (id: string | number) => {
    return await makeApiCall<any>(`/outils/${id}`);
  }, [makeApiCall]);

  const createOutil = useCallback(async (outilData: any) => {
    return await makeApiCall<any>('/outils', {
      method: 'POST',
      body: JSON.stringify(outilData),
    });
  }, [makeApiCall]);

  const updateOutil = useCallback(async (id: string | number, outilData: any) => {
    return await makeApiCall<any>(`/outils/${id}`, {
      method: 'PUT',
      body: JSON.stringify(outilData),
    });
  }, [makeApiCall]);

  const deleteOutil = useCallback(async (id: string | number) => {
    return await makeApiCall<any>(`/outils/${id}`, {
      method: 'DELETE',
    });
  }, [makeApiCall]);

  const toggleOutilDisponibilite = useCallback(async (id: string | number) => {
    return await makeApiCall<any>(`/outils/${id}/toggle-disponibilite`, {
      method: 'PATCH',
    });
  }, [makeApiCall]);

  return {
    getOutils,
    getOutil,
    createOutil,
    updateOutil,
    deleteOutil,
    toggleOutilDisponibilite,
    loading,
    error,
    clearError,
  };
};

// Hook spécialisé pour les ouvriers
export const useOuvriersApi = () => {
  const { makeApiCall, loading, error, clearError } = useApiCall();

  const getOuvriers = useCallback(async () => {
    const response = await makeApiCall<any>('/ouvriers');
    return Array.isArray(response) ? response : response.data || [];
  }, [makeApiCall]);

  const getOuvrier = useCallback(async (id: string | number) => {
    return await makeApiCall<any>(`/ouvriers/${id}`);
  }, [makeApiCall]);

  const createOuvrier = useCallback(async (ouvrierData: any) => {
    return await makeApiCall<any>('/ouvriers', {
      method: 'POST',
      body: JSON.stringify(ouvrierData),
    });
  }, [makeApiCall]);

  const updateOuvrier = useCallback(async (id: string | number, ouvrierData: any) => {
    return await makeApiCall<any>(`/ouvriers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ouvrierData),
    });
  }, [makeApiCall]);

  const deleteOuvrier = useCallback(async (id: string | number) => {
    return await makeApiCall<any>(`/ouvriers/${id}`, {
      method: 'DELETE',
    });
  }, [makeApiCall]);

  const toggleOuvrierDisponibilite = useCallback(async (id: string | number) => {
    return await makeApiCall<any>(`/ouvriers/${id}/toggle-disponibilite`, {
      method: 'PATCH',
    });
  }, [makeApiCall]);

  return {
    getOuvriers,
    getOuvrier,
    createOuvrier,
    updateOuvrier,
    deleteOuvrier,
    toggleOuvrierDisponibilite,
    loading,
    error,
    clearError,
  };
};

// Hook combiné pour toutes les ressources
export const useWorkshopApi = () => {
  const machinesApi = useMachinesApi();
  const outilsApi = useOutilsApi();
  const ouvriersApi = useOuvriersApi();

  const isLoading = machinesApi.loading || outilsApi.loading || ouvriersApi.loading;
  const hasError = machinesApi.error || outilsApi.error || ouvriersApi.error;

  const clearAllErrors = useCallback(() => {
    machinesApi.clearError();
    outilsApi.clearError();
    ouvriersApi.clearError();
  }, [machinesApi.clearError, outilsApi.clearError, ouvriersApi.clearError]);

  return {
    machines: machinesApi,
    outils: outilsApi,
    ouvriers: ouvriersApi,
    isLoading,
    hasError,
    clearAllErrors,
  };
};

// Utilitaires pour la gestion des erreurs
export const handleApiError = (error: any): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  return 'Une erreur inattendue s\'est produite';
};

// Utilitaire pour vérifier la connexion à l'API
export const checkApiConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      timeout: 5000,
    } as any);
    return response.ok;
  } catch {
    return false;
  }
};

// Types d'exportation
export interface Machine {
  id?: string | number;
  _id?: string;
  nom: string;
  type: string;
  capacite: number;
  status: 'active' | 'panne' | 'maintenance';
  utilisation: number;
  derniereRevision: string;
  prochaineMaintenance: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Outil {
  id?: string | number;
  _id?: string;
  nom: string;
  type: string;
  disponible: boolean;
  derniereUtilisation?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Ouvrier {
  id?: string | number;
  _id?: string;
  nom: string;
  prenom: string;
  specialite: string;
  disponible: boolean;
  heuresTravail?: number;
  createdAt?: string;
  updatedAt?: string;
}