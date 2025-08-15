"use client";
import { Plus } from "lucide-react";

interface WorkshopFloatingButtonProps {
  activeTab: 'machines' | 'ouvriers' | 'ateliers';
  hasError: boolean;
  isLoading: boolean;
  modalStates: {
    setIsModalOpen: (open: boolean) => void;
    setIsAtelierModalOpen: (open: boolean) => void;
    setIsOuvrierModalOpen: (open: boolean) => void;
  };
  selectedItems: {
    setSelectedMachine: (item: any) => void;
    setSelectedAtelier: (item: any) => void;
    setSelectedOuvrier: (item: any) => void;
  };
}

export default function WorkshopFloatingButton({
  activeTab,
  hasError,
  isLoading,
  modalStates,
  selectedItems
}: WorkshopFloatingButtonProps) {
  
  // Seuls les onglets avec formulaires de création affichent le bouton
  const showButton = ['machines', 'ateliers', 'ouvriers'].includes(activeTab) && !hasError;
  
  if (!showButton) return null;

  const handleCreate = () => {
    // Réinitialiser tous les éléments sélectionnés
    selectedItems.setSelectedMachine(null);
    selectedItems.setSelectedAtelier(null);
    selectedItems.setSelectedOuvrier(null);
    
    // Ouvrir la modal appropriée selon l'onglet actif
    switch (activeTab) {
      case 'machines':
        modalStates.setIsModalOpen(true);
        break;
      case 'ateliers':
        modalStates.setIsAtelierModalOpen(true);
        break;
      case 'ouvriers':
        modalStates.setIsOuvrierModalOpen(true);
        break;
    }
  };

  const getButtonText = () => {
    switch (activeTab) {
      case 'machines':
        return 'Ajouter une nouvelle machine';
      case 'ateliers':
        return 'Ajouter un nouvel atelier';
      case 'ouvriers':
        return 'Ajouter un nouvel ouvrier';
      default:
        return 'Ajouter un élément';
    }
  };

  return (
    <div className="fixed bottom-6 right-6">
      <button 
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleCreate}
        disabled={isLoading}
        title={getButtonText()}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}