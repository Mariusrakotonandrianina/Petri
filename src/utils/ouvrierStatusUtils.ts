// src/utils/ouvrierStatusUtils.ts - Utilitaires pour la gestion des statuts d'ouvriers
import { StatutOuvrier } from "../adapters/hooks/useApi";

export interface StatusChangeResult {
  success: boolean;
  message: string;
  previousStatus?: StatutOuvrier;
  newStatus?: StatutOuvrier;
}

/**
 * Valide si un changement de statut est autorisé
 */
export const validateStatusChange = (
  currentStatus: StatutOuvrier,
  newStatus: StatutOuvrier
): { valid: boolean; reason?: string } => {
  // Éviter les changements inutiles
  if (currentStatus === newStatus) {
    return {
      valid: false,
      reason: `L'ouvrier a déjà le statut: ${newStatus}`
    };
  }

  // Toutes les transitions sont autorisées pour le moment
  // Ici on pourrait ajouter des règles métier spécifiques
  return { valid: true };
};

/**
 * Détermine le prochain statut dans un cycle logique
 */
export const getNextStatusInCycle = (currentStatus: StatutOuvrier): StatutOuvrier => {
  switch (currentStatus) {
    case 'disponible':
      return 'occupé';
    case 'occupé':
      return 'disponible'; // Libérer l'ouvrier
    case 'absent':
      return 'disponible'; // Marquer comme disponible
    default:
      return 'disponible';
  }
};

/**
 * Obtient la configuration d'affichage pour un statut donné
 */
export const getStatusDisplayConfig = (status: StatutOuvrier) => {
  const configs = {
    disponible: {
      label: 'Disponible',
      emoji: '🟢',
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200',
      priority: 1 // Priorité pour le tri
    },
    occupé: {
      label: 'Occupé',
      emoji: '🟡',
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200',
      priority: 2
    },
    absent: {
      label: 'Absent',
      emoji: '🔴',
      color: 'gray',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-200',
      priority: 3
    }
  };

  return configs[status] || configs.disponible;
};

/**
 * Obtient les actions possibles pour un statut donné
 */
export const getAvailableActions = (currentStatus: StatutOuvrier) => {
  const allStatuses: StatutOuvrier[] = ['disponible', 'occupé', 'absent'];
  
  return allStatuses
    .filter(status => status !== currentStatus)
    .map(status => ({
      status,
      ...getStatusDisplayConfig(status),
      isRecommended: status === getNextStatusInCycle(currentStatus)
    }));
};

/**
 * Vérifie si un ouvrier peut être assigné à une tâche
 */
export const canBeAssignedToTask = (
  status: StatutOuvrier,
  heuresJour?: number,
  heuresMax?: number
): { canAssign: boolean; reason?: string } => {
  if (status !== 'disponible') {
    return {
      canAssign: false,
      reason: `L'ouvrier n'est pas disponible (statut: ${status})`
    };
  }

  if (heuresJour && heuresMax && heuresJour >= heuresMax) {
    return {
      canAssign: false,
      reason: `L'ouvrier a atteint sa limite d'heures journalières (${heuresJour}/${heuresMax}h)`
    };
  }

  return { canAssign: true };
};

/**
 * Calcule les statistiques de charge de travail
 */
export const calculateWorkload = (
  heuresJour?: number,
  heuresMax?: number
): {
  percentage: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  color: string;
  message: string;
} => {
  if (!heuresJour || !heuresMax) {
    return {
      percentage: 0,
      level: 'low',
      color: 'gray',
      message: 'Charge non définie'
    };
  }

  const percentage = Math.round((heuresJour / heuresMax) * 100);

  if (percentage >= 100) {
    return {
      percentage,
      level: 'critical',
      color: 'red',
      message: 'Dépassement horaire'
    };
  }

  if (percentage >= 90) {
    return {
      percentage,
      level: 'high',
      color: 'orange',
      message: 'Surcharge de travail'
    };
  }

  if (percentage >= 75) {
    return {
      percentage,
      level: 'medium',
      color: 'yellow',
      message: 'Charge élevée'
    };
  }

  return {
    percentage,
    level: 'low',
    color: 'green',
    message: 'Charge normale'
  };
};

/**
 * Formate un message de changement de statut
 */
export const formatStatusChangeMessage = (
  ouvrierNom: string,
  oldStatus: StatutOuvrier,
  newStatus: StatutOuvrier
): string => {
  const oldConfig = getStatusDisplayConfig(oldStatus);
  const newConfig = getStatusDisplayConfig(newStatus);
  
  return `${ouvrierNom}: ${oldConfig.emoji} ${oldConfig.label} → ${newConfig.emoji} ${newConfig.label}`;
};

/**
 * Détermine si une alerte doit être affichée
 */
export const shouldShowAlert = (
  status: StatutOuvrier,
  tacheActuelle?: string,
  heuresJour?: number,
  heuresMax?: number
): { show: boolean; alerts: Array<{ type: 'warning' | 'error'; message: string }> } => {
  const alerts: Array<{ type: 'warning' | 'error'; message: string }> = [];

  // Alerte pour dépassement horaire
  if (heuresJour && heuresMax && heuresJour >= heuresMax) {
    alerts.push({
      type: heuresJour > heuresMax ? 'error' : 'warning',
      message: heuresJour > heuresMax ? 'Dépassement horaire' : 'Limite horaire atteinte'
    });
  }

  // Alerte pour surcharge de travail
  const workload = calculateWorkload(heuresJour, heuresMax);
  if (workload.level === 'high') {
    alerts.push({
      type: 'warning',
      message: 'Surcharge de travail'
    });
  }

  // Alerte pour ouvrier occupé sans tâche
  if (status === 'occupé' && !tacheActuelle?.trim()) {
    alerts.push({
      type: 'warning',
      message: 'Aucune tâche spécifiée'
    });
  }

  return {
    show: alerts.length > 0,
    alerts
  };
};

/**
 * Trie les ouvriers par priorité de statut et autres critères
 */
export const sortOuvriersByPriority = <T extends { statut?: StatutOuvrier; nom: string; heuresJour?: number; heuresMax?: number }>(
  ouvriers: T[]
): T[] => {
  return [...ouvriers].sort((a, b) => {
    // D'abord par statut (disponible en premier)
    const statusA = getStatusDisplayConfig(a.statut || 'disponible');
    const statusB = getStatusDisplayConfig(b.statut || 'disponible');
    
    if (statusA.priority !== statusB.priority) {
      return statusA.priority - statusB.priority;
    }

    // Puis par charge de travail (moins chargé en premier pour les disponibles)
    if (a.statut === 'disponible' && b.statut === 'disponible') {
      const workloadA = calculateWorkload(a.heuresJour, a.heuresMax);
      const workloadB = calculateWorkload(b.heuresJour, b.heuresMax);
      
      if (workloadA.percentage !== workloadB.percentage) {
        return workloadA.percentage - workloadB.percentage;
      }
    }

    // Finalement par nom alphabétique
    return a.nom.localeCompare(b.nom, 'fr');
  });
};

/**
 * Filtre les ouvriers par statut avec options avancées
 */
export const filterOuvriersByStatus = <T extends { statut?: StatutOuvrier; heuresJour?: number; heuresMax?: number }>(
  ouvriers: T[],
  filters: {
    statuts?: StatutOuvrier[];
    includeOverworked?: boolean;
    excludeOverworked?: boolean;
    maxWorkloadPercentage?: number;
  }
): T[] => {
  return ouvriers.filter(ouvrier => {
    // Filtre par statut
    if (filters.statuts && filters.statuts.length > 0) {
      const ouvrierStatus = ouvrier.statut || 'disponible';
      if (!filters.statuts.includes(ouvrierStatus)) {
        return false;
      }
    }

    // Filtre par charge de travail
    const workload = calculateWorkload(ouvrier.heuresJour, ouvrier.heuresMax);
    
    if (filters.excludeOverworked && workload.level === 'critical') {
      return false;
    }

    if (filters.includeOverworked && workload.level !== 'critical') {
      return false;
    }

    if (filters.maxWorkloadPercentage && workload.percentage > filters.maxWorkloadPercentage) {
      return false;
    }

    return true;
  });
};

/**
 * Obtient des suggestions d'amélioration pour la gestion des ouvriers
 */
export const getManagementSuggestions = <T extends { statut?: StatutOuvrier; nom: string; tacheActuelle?: string; heuresJour?: number; heuresMax?: number }>(
  ouvriers: T[]
): Array<{ type: 'info' | 'warning' | 'suggestion'; message: string }> => {
  const suggestions: Array<{ type: 'info' | 'warning' | 'suggestion'; message: string }> = [];

  const disponibles = ouvriers.filter(o => (o.statut || 'disponible') === 'disponible');
  const occupes = ouvriers.filter(o => (o.statut || 'disponible') === 'occupé');
  const absents = ouvriers.filter(o => (o.statut || 'disponible') === 'absent');

  // Statistiques de base
  suggestions.push({
    type: 'info',
    message: `Répartition: ${disponibles.length} disponibles, ${occupes.length} occupés, ${absents.length} absents`
  });

  // Ouvriers occupés sans tâche
  const occupesSansTache = occupes.filter(o => !o.tacheActuelle?.trim());
  if (occupesSansTache.length > 0) {
    suggestions.push({
      type: 'warning',
      message: `${occupesSansTache.length} ouvrier(s) occupé(s) sans tâche assignée`
    });
  }

  // Ouvriers en surcharge
  const surcharges = ouvriers.filter(o => {
    const workload = calculateWorkload(o.heuresJour, o.heuresMax);
    return workload.level === 'high' || workload.level === 'critical';
  });

  if (surcharges.length > 0) {
    suggestions.push({
      type: 'warning',
      message: `${surcharges.length} ouvrier(s) en surcharge de travail`
    });
  }

  // Suggestions d'optimisation
  if (disponibles.length > occupes.length * 2) {
    suggestions.push({
      type: 'suggestion',
      message: 'Beaucoup d\'ouvriers disponibles - opportunité d\'augmenter la productivité'
    });
  }

  if (occupes.length > disponibles.length * 3) {
    suggestions.push({
      type: 'suggestion',
      message: 'Peu d\'ouvriers disponibles - considérer la redistribution des tâches'
    });
  }

  return suggestions;
};