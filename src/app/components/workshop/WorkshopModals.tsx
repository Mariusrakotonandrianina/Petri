"use client";
import AtelierFormModal from "../AtelierFormModal";

interface WorkshopModalsAteliersProps {
  activeTab: 'ateliers';
  modalStates: any;
  selectedItems: any;
  workshopApi: any;
  onLoadData: () => void;
}

export function WorkshopModalsAteliers({
  modalStates,
  selectedItems,
  workshopApi,
  onLoadData
}: WorkshopModalsAteliersProps) {
  
  const handleAtelierSubmit = async (data: any) => {
    try {
      if (selectedItems.selectedAtelier) {
        // Mise à jour
        await workshopApi.ateliers.updateAtelier(data.id, data);
      } else {
        // Création
        await workshopApi.ateliers.createAtelier(data);
      }
      await onLoadData();
      modalStates.setIsAtelierModalOpen(false);
      selectedItems.setSelectedAtelier(null);
    } catch (error) {
      console.error('Erreur lors de la soumission de l\'atelier:', error);
      throw error;
    }
  };

  return (
    <AtelierFormModal
      isOpen={modalStates.isAtelierModalOpen}
      onClose={() => {
        modalStates.setIsAtelierModalOpen(false);
        selectedItems.setSelectedAtelier(null);
      }}
      onSubmit={handleAtelierSubmit}
      atelier={selectedItems.selectedAtelier}
    />
  );
}