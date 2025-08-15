"use client";
import OuvrierComponent from "../ouvrierComponents";
import { Ouvrier } from "../../../adapters/hooks/useApi";

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

  const convertOuvrierForDisplay = (ouvrier: Ouvrier) => ({
    _id: String(ouvrier.id || ouvrier._id),
    nom: ouvrier.nom,
    specialite: ouvrier.specialite,
    niveau: ouvrier.niveau,
    statut: ouvrier.statut,
    tacheActuelle: ouvrier.tacheActuelle,
    heuresJour: ouvrier.heuresJour,
    heuresMax: ouvrier.heuresMax,
    competences: ouvrier.competences,
    disponible: ouvrier.statut === 'disponible',
    createdAt: ouvrier.createdAt,
    updatedAt: ouvrier.updatedAt
  });

  const handleEditOuvrier = (ouvrierDisplay: any) => {
    const ouvrierForApi: Ouvrier = {
      id: ouvrierDisplay._id,
      _id: ouvrierDisplay._id,
      nom: ouvrierDisplay.nom,
      specialite: ouvrierDisplay.specialite,
      niveau: ouvrierDisplay.niveau || 'Débutant',
      statut: ouvrierDisplay.statut || (ouvrierDisplay.disponible ? 'disponible' : 'occupé'),
      tacheActuelle: ouvrierDisplay.tacheActuelle || '',
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

  const handleToggleOuvrierDisponibilite = async (id: string | number) => {
    const ouvrier = ouvriers.find(o => (o.id || o._id) == id);
    if (!ouvrier) return;
    
    try {
      const newStatut = ouvrier.statut === 'disponible' ? 'occupé' : 'disponible';
      await workshopApi.ouvriers.updateOuvrierStatut(id, newStatut);
      await onLoadData();
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Impossible de changer le statut'}`);
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
          onToggleStatus={handleToggleOuvrierDisponibilite}
        />
      ))}
    </>
  );
}