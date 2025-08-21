"use client";
import { useState, useCallback } from 'react';

const API_BASE_URL = process.env.API_BASE_URL;

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

export type NiveauOuvrier = 'Expert' | 'Confirmé' | 'Débutant';
export type StatutOuvrier = 'disponible' | 'occupe' | 'absent';

export interface Ouvrier {
  id?: string | number;
  _id?: string;
  nom: string;
  niveau: NiveauOuvrier;
  statut: StatutOuvrier;
  tacheActuelle?: string | null;
  tacheSuivante?: string | null;
  heuresJour: number;
  heuresMax: number;
  competences: string[];
  ateliersAutorises?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OuvrierStatistics {
  total: number;
  repartitionStatut: {
    disponibles: number;
    occupes: number;
    absents: number;
  };
  repartitionNiveau: {
    experts: number;
    confirmes: number;
    debutants: number;
  };
  heures: {
    totalHeuresJour: number;
    totalHeuresMax: number;
    moyenneHeuresJour: number;
    moyenneHeuresMax: number;
    tauxUtilisation: number;
  };
  competences: Array<{ _id: string; count: number }>;
  tauxDisponibilite: number;
  tauxOccupation: number;
}

export interface SearchOuvriersParams {
  competences?: string;
  niveau?: NiveauOuvrier;
  statut?: StatutOuvrier;
  heuresDisponibles?: number;
  atelierId?: string;
}

export interface SearchOuvriersResult {
  criteres: SearchOuvriersParams;
  resultats: number;
  ouvriers: Ouvrier[];
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

// Hook spécialisé pour les ouvriers
export const useOuvrierApi = () => {
  const { makeApiCall, loading, error, clearError } = useApiCall();

  // Routes CRUD de base
  const getOuvriers = useCallback(async (): Promise<Ouvrier[]> => {
    const response = await makeApiCall<ApiResponse<Ouvrier[]>>('/ouvriers');
    return Array.isArray(response)
      ? (response as Ouvrier[])
      : response.data || [];
  }, [makeApiCall]);

  const getOuvrier = useCallback(async (id: string | number): Promise<Ouvrier> => {
    const response = await makeApiCall<ApiResponse<Ouvrier>>(`/ouvriers/${id}`);
    return (response as ApiResponse<Ouvrier>).data || (response as Ouvrier);
  }, [makeApiCall]);

  const createOuvrier = useCallback(async (ouvrierData: Partial<Ouvrier>): Promise<Ouvrier> => {
    const response = await makeApiCall<ApiResponse<Ouvrier>>('/ouvriers', {
      method: 'POST',
      body: JSON.stringify(ouvrierData),
    });
    return (response as ApiResponse<Ouvrier>).data || (response as Ouvrier);
  }, [makeApiCall]);

  const updateOuvrier = useCallback(async (id: string | number, ouvrierData: Partial<Ouvrier>): Promise<Ouvrier> => {
    const response = await makeApiCall<ApiResponse<Ouvrier>>(`/ouvriers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ouvrierData),
    });
    return (response as ApiResponse<Ouvrier>).data || (response as Ouvrier);
  }, [makeApiCall]);

  const deleteOuvrier = useCallback(async (id: string | number): Promise<void> => {
    await makeApiCall<void>(`/ouvriers/${id}`, { method: 'DELETE' });
  }, [makeApiCall]);

  // Routes de filtrage
  const getOuvriersByStatut = useCallback(async (statut: StatutOuvrier): Promise<Ouvrier[]> => {
    const response = await makeApiCall<Ouvrier[]>(`/ouvriers/statut/${statut}`);
    return Array.isArray(response) ? response : (response as any).data || [];
  }, [makeApiCall]);

  const getOuvriersByNiveau = useCallback(async (niveau: NiveauOuvrier): Promise<Ouvrier[]> => {
    const response = await makeApiCall<Ouvrier[]>(`/ouvriers/niveau/${niveau}`);
    return Array.isArray(response) ? response : (response as any).data || [];
  }, [makeApiCall]);

  const getOuvriersByCompetence = useCallback(async (competence: string): Promise<Ouvrier[]> => {
    const response = await makeApiCall<Ouvrier[]>(`/ouvriers/competence/${competence}`);
    return Array.isArray(response) ? response : (response as any).data || [];
  }, [makeApiCall]);

  // Recherche avancée
  const searchOuvriers = useCallback(async (params: SearchOuvriersParams): Promise<SearchOuvriersResult> => {
    const queryParams = new URLSearchParams();
    
    if (params.competences) queryParams.append('competences', params.competences);
    if (params.niveau) queryParams.append('niveau', params.niveau);
    if (params.statut) queryParams.append('statut', params.statut);
    if (params.heuresDisponibles) queryParams.append('heuresDisponibles', params.heuresDisponibles.toString());
    if (params.atelierId) queryParams.append('atelierId', params.atelierId);

    return await makeApiCall<SearchOuvriersResult>(`/ouvriers/search?${queryParams.toString()}`);
  }, [makeApiCall]);

  // Routes meta
  const listCompetences = useCallback(async (): Promise<string[]> => {
    const response = await makeApiCall<string[]>('/ouvriers/meta/competences');
    return Array.isArray(response) ? response : (response as any).data || [];
  }, [makeApiCall]);

  // Gestion des statuts
  const updateOuvrierStatus = useCallback(async (id: string | number, status: string): Promise<any> => {
    return await makeApiCall<any>(`/ouvriers/status/${id}/${status}`, {
      method: 'PATCH',
    });
  }, [makeApiCall]);

  const cycleOuvrierStatus = useCallback(async (id: string | number): Promise<any> => {
    return await makeApiCall<any>(`/ouvriers/${id}/status/cycle`, {
      method: 'PATCH',
    });
  }, [makeApiCall]);

  const toggleOuvrierStatut = useCallback(async (id: string | number): Promise<Ouvrier> => {
    const response = await makeApiCall<ApiResponse<Ouvrier>>(`/ouvriers/${id}/toggle-statut`, {
      method: 'PATCH',
    });
    return (response as ApiResponse<Ouvrier>).data || (response as Ouvrier);
  }, [makeApiCall]);

  // Gestion des tâches
  const affecterTache = useCallback(async (
    id: string | number, 
    tacheData: { tacheActuelle?: string; tacheSuivante?: string }
  ): Promise<Ouvrier> => {
    const response = await makeApiCall<ApiResponse<Ouvrier>>(`/ouvriers/${id}/affecter-tache`, {
      method: 'PATCH',
      body: JSON.stringify(tacheData),
    });
    return (response as ApiResponse<Ouvrier>).data || (response as Ouvrier);
  }, [makeApiCall]);

  const libererOuvrier = useCallback(async (id: string | number): Promise<any> => {
    return await makeApiCall<any>(`/ouvriers/${id}/liberer`, {
      method: 'PATCH',
    });
  }, [makeApiCall]);

  // Gestion des heures de travail
  const updateHeuresTravail = useCallback(async (id: string | number, heuresJour: number): Promise<any> => {
    return await makeApiCall<any>(`/ouvriers/${id}/heures`, {
      method: 'PATCH',
      body: JSON.stringify({ heuresJour }),
    });
  }, [makeApiCall]);

  // Statistiques
  const getOuvrierStatistics = useCallback(async (): Promise<OuvrierStatistics> => {
    return await makeApiCall<OuvrierStatistics>('/ouvriers/statistiques');
  }, [makeApiCall]);

  // Méthodes utilitaires pour les statuts
  const markAsDisponible = useCallback(async (id: string | number): Promise<any> => {
    return await updateOuvrierStatus(id, 'disponible');
  }, [updateOuvrierStatus]);

  const markAsOccupe = useCallback(async (id: string | number): Promise<any> => {
    return await updateOuvrierStatus(id, 'occupe');
  }, [updateOuvrierStatus]);

  const markAsAbsent = useCallback(async (id: string | number): Promise<any> => {
    return await updateOuvrierStatus(id, 'absent');
  }, [updateOuvrierStatus]);

  // Méthodes utilitaires pour la gestion des tâches
  const assignCurrentTask = useCallback(async (id: string | number, tacheActuelle: string): Promise<Ouvrier> => {
    return await affecterTache(id, { tacheActuelle });
  }, [affecterTache]);

  const assignNextTask = useCallback(async (id: string | number, tacheSuivante: string): Promise<Ouvrier> => {
    return await affecterTache(id, { tacheSuivante });
  }, [affecterTache]);

  const assignBothTasks = useCallback(async (
    id: string | number, 
    tacheActuelle: string, 
    tacheSuivante: string
  ): Promise<Ouvrier> => {
    return await affecterTache(id, { tacheActuelle, tacheSuivante });
  }, [affecterTache]);

  return {
    // CRUD
    getOuvriers,
    getOuvrier,
    createOuvrier,
    updateOuvrier,
    deleteOuvrier,
    
    // Filtrage
    getOuvriersByStatut,
    getOuvriersByNiveau,
    getOuvriersByCompetence,
    
    // Recherche
    searchOuvriers,
    
    // Meta
    listCompetences,
    
    // Gestion des statuts
    updateOuvrierStatus,
    cycleOuvrierStatus,
    toggleOuvrierStatut,
    markAsDisponible,
    markAsOccupe,
    markAsAbsent,
    
    // Gestion des tâches
    affecterTache,
    libererOuvrier,
    assignCurrentTask,
    assignNextTask,
    assignBothTasks,
    
    // Gestion des heures
    updateHeuresTravail,
    
    // Statistiques
    getOuvrierStatistics,
    
    // État
    loading,
    error,
    clearError,
  };
};