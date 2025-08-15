"use client";
import OuvrierComponent from "../ouvrierComponents";
import { Ouvrier, StatutOuvrier, NiveauOuvrier } from "../../../adapters/hooks/useApi";

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

  // CORRECTION: Conversion avec types compatibles
  const convertOuvrierForDisplay = (ouvrier: Ouvrier) => {
    const niveauPourAffichage = (): 'Débutant' | 'Confirmé' | 'Expert' => {
      switch (ouvrier.niveau) {
        case 'Expert': return 'Expert';
        case 'Confirmé': return 'Confirmé';
        case 'Débutant': return 'Débutant';
        default: return 'Débutant';
      }
    };

    return {
      _id: String(ouvrier.id || ouvrier._id),
      nom: ouvrier.nom,
      specialite: ouvrier.specialite,
      niveau: niveauPourAffichage(),
      statut: ouvrier.statut || 'disponible',
      tacheActuelle: ouvrier.tacheActuelle || undefined,
      heuresJour: ouvrier.heuresJour || 0,
      heuresMax: ouvrier.heuresMax || 8,
      competences: ouvrier.competences || [],
      createdAt: ouvrier.createdAt,
      updatedAt: ouvrier.updatedAt
    };
  };

  const handleEditOuvrier = (ouvrierDisplay: any) => {
    const ouvrierForApi: Ouvrier = {
      id: ouvrierDisplay._id,
      _id: ouvrierDisplay._id,
      nom: ouvrierDisplay.nom,
      specialite: ouvrierDisplay.specialite,
      niveau: ouvrierDisplay.niveau as NiveauOuvrier,
      statut: ouvrierDisplay.statut as StatutOuvrier,
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

  // CORRECTION MAJEURE: Utilisation de toggleOuvrierStatut pour le basculement automatique
  const handleToggleOuvrierDisponibilite = async (id: string | number) => {
    const ouvrier = ouvriers.find(o => (o.id || o._id) == id);
    if (!ouvrier) return;
    
    try {
      console.log(`Toggle statut pour ${ouvrier.nom}: ${ouvrier.statut}`);
      
      // CORRECTION: Utilisation de la nouvelle fonction toggleOuvrierStatut
      await workshopApi.ouvriers.toggleOuvrierStatut(id);
      await onLoadData();
      
      console.log(`Statut de ${ouvrier.nom} changé avec succès`);
      
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Impossible de changer le statut'}`);
      await onLoadData();
    }
  };

  // CORRECTION: Fonction pour changer vers un statut spécifique
  const handleChangeStatutSpecifique = async (id: string | number, nouveauStatut: StatutOuvrier) => {
    const ouvrier = ouvriers.find(o => (o.id || o._id) == id);
    if (!ouvrier) return;
    
    if (ouvrier.statut === nouveauStatut) {
      console.log(`L'ouvrier ${ouvrier.nom} a déjà le statut: ${nouveauStatut}`);
      return;
    }
    
    try {
      console.log(`Changement de statut pour ${ouvrier.nom}: ${ouvrier.statut} -> ${nouveauStatut}`);
      
      // CORRECTION: Utilisation de updateOuvrierStatut pour changement spécifique
      await workshopApi.ouvriers.updateOuvrierStatut(id, nouveauStatut);
      await onLoadData();
      
      console.log(`Statut de ${ouvrier.nom} changé avec succès: ${nouveauStatut}`);
      
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Impossible de changer le statut'}`);
      await onLoadData();
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
          onToggleStatus={handleToggleOuvrierDisponibilite}  // Toggle automatique
          onChangeStatus={handleChangeStatutSpecifique}      // Changement spécifique
        />
      ))}
    </>
  );
}