export const SUCCESS_MESSAGES = {
    MACHINE_CREATED: 'Machine créée avec succès',
    MACHINE_UPDATED: 'Machine mise à jour avec succès',
    MACHINE_DELETED: 'Machine supprimée avec succès',
    OUTIL_CREATED: 'Outil créé avec succès',
    OUTIL_UPDATED: 'Outil mis à jour avec succès',
    OUTIL_DELETED: 'Outil supprimé avec succès',
    OUTIL_RESERVED: 'Outil réservé avec succès',
    OUTIL_RELEASED: 'Outil libéré avec succès',
    OUVRIER_CREATED: 'Ouvrier créé avec succès',
    OUVRIER_UPDATED: 'Ouvrier mis à jour avec succès',
    OUVRIER_DELETED: 'Ouvrier supprimé avec succès',
    TASK_ASSIGNED: 'Tâche assignée avec succès',
    TASK_COMPLETED: 'Tâche terminée avec succès'
  } as const;
  
  export const ERROR_MESSAGES = {
    GENERIC_ERROR: 'Une erreur s\'est produite',
    NETWORK_ERROR: 'Erreur de connexion',
    VALIDATION_ERROR: 'Erreur de validation',
    NOT_FOUND: 'Élément non trouvé',
    UNAUTHORIZED: 'Accès non autorisé',
    MACHINE_NOT_AVAILABLE: 'Machine non disponible',
    OUTIL_NOT_AVAILABLE: 'Outil non disponible',
    OUVRIER_NOT_AVAILABLE: 'Ouvrier non disponible',
    INSUFFICIENT_PERMISSIONS: 'Permissions insuffisantes'
  } as const;