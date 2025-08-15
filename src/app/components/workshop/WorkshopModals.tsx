// src/app/components/workshop/WorkshopModals.tsx
"use client";
import MachineFormModal from "../MachineFormModal";
import AtelierFormModal from "../AtelierFormModal";
import OuvrierFormModal from "../OuvrierFormModal";

interface WorkshopModalsProps {
  activeTab: 'machines' | 'ouvriers' | 'ateliers';
  modalStates: {
    isModalOpen: boolean;
    isAtelierModalOpen: boolean;
    isOuvrierModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    setIsAtelierModalOpen: (open: boolean) => void;
    setIsOuvrierModalOpen: (open: boolean) => void;
  };
  selectedItems: {
    selectedMachine: any;
    selectedAtelier: any;
    selectedOuvrier: any;
    setSelectedMachine: (item: any) => void;
    setSelectedAtelier: (item: any) => void;
    setSelectedOuvrier: (item: any) => void;
  };
  workshopApi: any;
  onLoadData: () => void;
}

export default function WorkshopModals({
  activeTab,
  modalStates,
  selectedItems,
  workshopApi,
  onLoadData
}: WorkshopModalsProps) {
  
  // Handlers pour machines
  const handleCloseModal = () => {
    modalStates.setIsModalOpen(false);
    selectedItems.setSelectedMachine(null);
  };

  const handleSubmitMachine = async (data: any) => {
    try {
      if (selectedItems.selectedMachine) {
        const id = selectedItems.selectedMachine.id || selectedItems.selectedMachine._id;
        await workshopApi.machines.updateMachine(id!, data);
      } else {
        await workshopApi.machines.createMachine(data);
      }
      
      modalStates.setIsModalOpen(false);
      selectedItems.setSelectedMachine(null);
      await onLoadData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }
  };

  // Handlers pour ateliers
  const handleCloseAtelierModal = () => {
    modalStates.setIsAtelierModalOpen(false);
    selectedItems.setSelectedAtelier(null);
  };

  const handleSubmitAtelier = async (data: any) => {
    try {
      if (selectedItems.selectedAtelier) {
        const id = selectedItems.selectedAtelier.id || selectedItems.selectedAtelier._id;
        await workshopApi.ateliers.updateAtelier(id!, data);
      } else {
        await workshopApi.ateliers.createAtelier(data);
      }
      
      modalStates.setIsAtelierModalOpen(false);
      selectedItems.setSelectedAtelier(null);
      await onLoadData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'atelier:', error);
      throw error;
    }
  };

  // Handlers pour ouvriers
  const handleCloseOuvrierModal = () => {
    modalStates.setIsOuvrierModalOpen(false);
    selectedItems.setSelectedOuvrier(null);
  };

  const handleSubmitOuvrier = async (data: any) => {
    try {
      if (selectedItems.selectedOuvrier) {
        const id = selectedItems.selectedOuvrier.id || selectedItems.selectedOuvrier._id;
        await workshopApi.ouvriers.updateOuvrier(id!, data);
      } else {
        await workshopApi.ouvriers.createOuvrier(data);
      }
      
      modalStates.setIsOuvrierModalOpen(false);
      selectedItems.setSelectedOuvrier(null);
      await onLoadData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'ouvrier:', error);
      throw error;
    }
  };

  return (
    <>
      {/* Modal de création/modification de machine */}
      {activeTab === 'machines' && (
        <MachineFormModal
          isOpen={modalStates.isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitMachine}
          machine={selectedItems.selectedMachine}
          title={selectedItems.selectedMachine ? 'Modifier la machine' : 'Ajouter une machine'}
        />
      )}

      {/* Modal de création/modification d'atelier */}
      {activeTab === 'ateliers' && (
        <AtelierFormModal
          isOpen={modalStates.isAtelierModalOpen}
          onClose={handleCloseAtelierModal}
          onSubmit={handleSubmitAtelier}
          atelier={selectedItems.selectedAtelier}
        />
      )}

      {/* Modal de création/modification d'ouvrier */}
      {activeTab === 'ouvriers' && (
        <OuvrierFormModal
          isOpen={modalStates.isOuvrierModalOpen}
          onClose={handleCloseOuvrierModal}
          onSubmit={handleSubmitOuvrier}
          ouvrier={selectedItems.selectedOuvrier}
        />
      )}
    </>
  );
}