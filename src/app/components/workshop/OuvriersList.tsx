"use client";
import OuvrierComponent from "../ouvrierComponents";
import { Ouvrier, StatutOuvrier } from "../../../adapters/hooks/useApi";

interface OuvriersListProps {
  ouvriers: Ouvrier[];
  isLoading: boolean;
  hasError: boolean;
  workshopApi: any;
  modalStates: any;
  selectedItems: any;
  onLoadData: () => void;
}

export default function OuvriersList({
  ouvriers,
  isLoading,
  hasError,
  workshopApi,
  modalStates,
  selectedItems,
  onLoadData
}: OuvriersListProps) {
  
  if (isLoading || hasError || ouvriers.length === 0) return null;

  // CORRECTION: Conversion avec types compatibles pour OuvrierComponent
  const convertOuvrierForDisplay = (ouvrier: Ouvrier) => {
    // Normalisation du niveau selon les types attendus par OuvrierComponent
    const niveauNormalise = (): 'Débutant' | 'Intermédiaire' | 'Expert' => {
      switch (ouvrier.niveau) {
        case 'Expert': return 'Expert';
        case 'Confirmé': return 'Intermédiaire'; // Confirmé -> Intermédiaire
        case 'Débutant': return 'Débutant';
        default: return 'Débutant';
      }
    };

    // CORRECTION: Pas de normalisation nécessaire pour le statut - utiliser directement
    const statutNormalise = (): 'disponible' | 'occupé' | 'absent' => {
      // Le backend utilise déjà les bons types : 'disponible' | 'occupé' | 'absent'
      return ouvrier.statut || 'disponible';
    };

    return {
      _id: String(ouvrier.id || ouvrier._id),
      nom: ouvrier.nom,
      specialite: ouvrier.specialite,
      niveau: niveauNormalise(),
      statut: statutNormalise(), // Utilisation directe du statut de l'API
      tacheActuelle: ouvrier.tacheActuelle || undefined,
      heuresJour: ouvrier.heuresJour || 0,
      heuresMax: ouvrier.heuresMax || 8,
      competences: ouvrier.competences || [],
      disponible: ouvrier.statut === 'disponible', // Propriété de compatibilité
      createdAt: ouvrier.createdAt,
      updatedAt: ouvrier.updatedAt
    };
  };

  const handleEditOuvrier = (ouvrierDisplay: any) => {
    // Conversion inverse pour l'API avec gestion des niveaux
    const niveauPourApi = (): 'Expert' | 'Confirmé' | 'Débutant' => {
      switch (ouvrierDisplay.niveau) {
        case 'Expert': return 'Expert';
        case 'Intermédiaire': return 'Confirmé'; // Intermédiaire -> Confirmé pour l'API
        case 'Débutant': return 'Débutant';
        default: 'Débutant';
      }
    };

    const ouvrierForApi: Ouvrier = {
      id: ouvrierDisplay._id,
      _id: ouvrierDisplay._id,
      nom: ouvrierDisplay.nom,
      specialite: ouvrierDisplay.specialite,
      niveau: niveauPourApi(),
      statut: ouvrierDisplay.statut || 'disponible',
      tacheActuelle: ouvrierDisplay.tacheActuelle || null,
      heuresJour: Number(ouvrierDisplay.heuresJour) || 0,
      heuresMax: Number(ouvrierDisplay.heuresMax) || 8,
      competences: Array.isArray(ouvrierDisplay.competences) ? ouvrierDisplay.competences : [],
      createdAt: ouvrierDisplay.createdAt,
      updatedAt: ouvrierDisplay.updatedAt
    };
    
    selectedItems.setSelectedOuvrier(ouvrierForApi);
    modalStates.setIsOuvrierModalOpen(true);
  };

  const handleDeleteOuvrier = async (id: string | number) => {
    const ouvrier = ouvriers.find(o => (o.id || o._id) == id);
    if (!ouvrier) return;
    
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer l'ouvrier "${ouvrier.nom}" ?`;
    if (window.confirm(confirmMessage)) {
      try {
        await workshopApi.ouvriers.deleteOuvrier(id);
        await onLoadData();
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'ouvrier:', error);
        alert(`Erreur lors de la suppression: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }
  };

  // CORRECTION MAJEURE: Utilisation directe de l'API updateOuvrierStatut
  const handleToggleOuvrierDisponibilite = async (id: string | number) => {
    const ouvrier = ouvriers.find(o => (o.id || o._id) == id);
    if (!ouvrier) return;
    
    try {
      // CORRECTION: Cycle d'états cohérent avec le backend
      let newStatut: StatutOuvrier;
      
      switch (ouvrier.statut) {
        case 'disponible':
          newStatut = 'occupé';
          break;
        case 'occupé':
          newStatut = 'disponible';
          break;
        case 'absent':
          newStatut = 'disponible';
          break;
        default:
          newStatut = 'disponible';
      }

      console.log(`Changement de statut pour ${ouvrier.nom}: ${ouvrier.statut} -> ${newStatut}`);
      
      // CORRECTION: Utilisation directe de updateOuvrierStatut avec le bon type
      await workshopApi.ouvriers.updateOuvrierStatut(id, newStatut);
      await onLoadData();
      
      // Message de confirmation optionnel
      console.log(`Statut de ${ouvrier.nom} changé avec succès: ${newStatut}`);
      
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      
      // Gestion d'erreur améliorée
      let errorMessage = 'Impossible de changer le statut';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = (error as any).message;
      }
      
      alert(`Erreur: ${errorMessage}`);
      
      // Optionnel: recharger les données pour s'assurer de la cohérence
      await onLoadData();
    }
  };

  // CORRECTION: Fonction pour changer le statut vers un état spécifique
  const handleChangeStatutSpecifique = async (id: string | number, nouveauStatut: StatutOuvrier) => {
    const ouvrier = ouvriers.find(o => (o.id || o._id) == id);
    if (!ouvrier) return;
    
    // Éviter les changements inutiles
    if (ouvrier.statut === nouveauStatut) {
      console.log(`L'ouvrier ${ouvrier.nom} a déjà le statut: ${nouveauStatut}`);
      return;
    }
    
    try {
      console.log(`Changement de statut pour ${ouvrier.nom}: ${ouvrier.statut} -> ${nouveauStatut}`);
      
      await workshopApi.ouvriers.updateOuvrierStatut(id, nouveauStatut);
      await onLoadData();
      
      console.log(`Statut de ${ouvrier.nom} changé avec succès: ${nouveauStatut}`);
      
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Impossible de changer le statut'}`);
      await onLoadData(); // Recharger pour maintenir la cohérence
    }
  };

  return (
    <>
      {ouvriers.map(ouvrier => (
        <OuvrierComponent
          key={ouvrier.id || ouvrier._id}
          ouvrier={convertOuvrierForDisplay(ouvrier)}
          onEdit={handleEditOuvrier}
          onDelete={handleDeleteOuvrier}
          onToggleStatus={handleToggleOuvrierDisponibilite} // Fonction de basculement
          onChangeStatus={handleChangeStatutSpecifique} // Nouvelle fonction pour changement spécifique
        />
      ))}
    </>
  );
}