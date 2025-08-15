"use client";
import AtelierComponent from "../AtelierComponents";
import { Atelier } from "../../../adapters/hooks/useApi";

interface AteliersListProps {
  ateliers: Atelier[];
  isLoading: boolean;
  hasError: boolean;
  workshopApi: any;
  modalStates: any;
  selectedItems: any;
  onLoadData: () => void;
}

export default function AteliersList({
  ateliers,
  isLoading,
  hasError,
  workshopApi,
  modalStates,
  selectedItems,
  onLoadData
}: AteliersListProps) {
  
  if (isLoading || hasError || ateliers.length === 0) return null;

  const handleEditAtelier = (atelier: any) => {
    const atelierForApi: Atelier = {
      id: atelier._id,
      _id: atelier._id,
      nom: atelier.nom,
      localisation: atelier.localisation,
      superficie: atelier.superficie,
      capaciteEmployes: atelier.capaciteEmployes,
      status: atelier.status,
      createdAt: atelier.createdAt,
      updatedAt: atelier.updatedAt
    };
    selectedItems.setSelectedAtelier(atelierForApi);
    modalStates.setIsAtelierModalOpen(true);
  };

  const handleDeleteAtelier = async (id: string | number) => {
    const atelier = ateliers.find(a => (a.id || a._id) == id);
    if (!atelier) return;

    const confirmMessage = `Êtes-vous sûr de vouloir supprimer l'atelier "${atelier.nom}" ?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await workshopApi.ateliers.deleteAtelier(id);
        await onLoadData();
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'atelier:', error);
        alert(`Erreur lors de la suppression: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }
  };

  const handleToggleAtelierStatus = async (id: string | number) => {
    const atelier = ateliers.find(a => (a.id || a._id) == id);
    if (!atelier) return;

    try {
      let newStatus: 'actif' | 'fermé' | 'maintenance';
      
      switch (atelier.status) {
        case 'actif': newStatus = 'maintenance'; break;
        case 'fermé': newStatus = 'actif'; break;
        case 'maintenance': newStatus = 'actif'; break;
        default: newStatus = 'actif';
      }

      await workshopApi.ateliers.updateAtelier(id, { ...atelier, status: newStatus });
      await onLoadData();
    } catch (error) {
      console.error('Erreur lors du changement de statut de l\'atelier:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Impossible de changer le statut'}`);
    }
  };

  return (
    <>
      {ateliers.map(atelier => (
        <AtelierComponent 
          key={atelier.id || atelier._id} 
          atelier={{
            _id: String(atelier.id || atelier._id),
            nom: atelier.nom,
            localisation: atelier.localisation,
            superficie: atelier.superficie,
            capaciteEmployes: atelier.capaciteEmployes,
            status: atelier.status,
            createdAt: atelier.createdAt,
            updatedAt: atelier.updatedAt
          }}
          onEdit={handleEditAtelier}
          onDelete={handleDeleteAtelier}
          onToggleStatus={handleToggleAtelierStatus}
        />
      ))}
    </>
  );
}