// src/adapters/hooks/useApi.ts - Hooks personnalisés pour l'API
import { useState, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:5000';

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

export const useAteliersApi = () => {
  const { makeApiCall, loading, error, clearError } = useApiCall();

  const getAteliers = useCallback(async () => {
    const response = await makeApiCall<any>('/ateliers');
    return Array.isArray(response) ? response : response.data || [];
  }, [makeApiCall]);

  const getAtelier = useCallback(async (id: string | number) => {
    return await makeApiCall<any>(`/ateliers/${id}`);
  }, [makeApiCall]);

  const createAtelier = useCallback(async (atelierData: any) => {
    return await makeApiCall<any>('/ateliers', {
      method: 'POST',
      body: JSON.stringify(atelierData),
    });
  }, [makeApiCall]);

  const updateAtelier = useCallback(async (id: string | number, atelierData: any) => {
    return await makeApiCall<any>(`/ateliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(atelierData),
    });
  }, [makeApiCall]);

  const deleteAtelier = useCallback(async (id: string | number) => {
    return await makeApiCall<any>(`/ateliers/${id}`, {
      method: 'DELETE',
    });
  }, [makeApiCall]);

  const filterByStatus = useCallback(async (status: string) => {
    return await makeApiCall<any>(`/ateliers/status/${status}`);
  }, [makeApiCall]);

  const filterByLocalisation = useCallback(async (localisation: string) => {
    return await makeApiCall<any>(`/ateliers/localisation/${localisation}`);
  }, [makeApiCall]);

  const listLocalisations = useCallback(async () => {
    return await makeApiCall<any>(`/ateliers/meta/localisations`);
  }, [makeApiCall]);

  return {
    getAteliers,
    getAtelier,
    createAtelier,
    updateAtelier,
    deleteAtelier,
    filterByStatus,
    filterByLocalisation,
    listLocalisations,
    loading,
    error,
    clearError,
  };
};

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

export const useWorkshopApi = () => {
  const machinesApi = useMachinesApi();
  const outilsApi = useOutilsApi();
  const ouvriersApi = useOuvriersApi();
  const ateliersApis = useAteliersApi();

  const isLoading = machinesApi.loading || outilsApi.loading || ouvriersApi.loading || ateliersApis.loading;
  const hasError = machinesApi.error || outilsApi.error || ouvriersApi.error || ateliersApis.error;

  const clearAllErrors = useCallback(() => {
    machinesApi.clearError();
    outilsApi.clearError();
    ouvriersApi.clearError();
    ateliersApis.clearError();
  }, [machinesApi.clearError, outilsApi.clearError, ouvriersApi.clearError, ateliersApis.clearError]);

  return {
    machines: machinesApi,
    outils: outilsApi,
    ouvriers: ouvriersApi,
    ateliers: ateliersApis,
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

export interface Machine {
  id?: string | number;
  _id?: string;
  nom: string;
  type: string;
  capacite: number;
  status: 'active' | 'panne' | 'maintenance';
  utilisation: number;
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
  disponible: boolean;
  id?: string | number;
  _id?: string;
  nom: string;
  prenom: string;
  niveau: 'Débutant' | 'Intermédiaire' | 'Expert';
  specialite: string;
  tacheActuelle: string;
  status: 'disponible' | 'occupé' | 'absent';
  competences: string[];
  heuresJour: number;
  heuresMax: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Atelier {
  id?: string | number;
  _id?: string;
  nom: string;
  localisation: string;
  superficie: number;
  capaciteEmployes: number;
  status: 'actif' | 'fermé' | 'maintenance';
  createdAt?: string;
  updatedAt?: string;
}
