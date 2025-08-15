"use client";
import { Plus, Settings, Users, Wrench, Building2 } from "lucide-react";

interface WorkshopEmptyStateProps {
  activeTab: string;
  currentData: any[];
  isLoading: boolean;
  hasError: boolean;
  modalStates: any;
  selectedItems: any;
}

export default function WorkshopEmptyState({
  activeTab,
  currentData,
  isLoading,
  hasError,
  modalStates,
  selectedItems
}: WorkshopEmptyStateProps) {
  
  if (isLoading || hasError || currentData.length > 0) return null;

  const getIcon = () => {
    switch (activeTab) {
      case 'machines': return Settings;
      case 'outils': return Wrench;
      case 'ouvriers': return Users;
      case 'ateliers': return Building2;
      default: return Settings;
    }
  };

  const IconComponent = getIcon();

  const handleCreate = () => {
    selectedItems.setSelectedMachine(null);
    selectedItems.setSelectedAtelier(null);
    selectedItems.setSelectedOuvrier(null);
    
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

  const getMessages = () => {
    switch (activeTab) {
      case 'machines':
        return {
          title: "Aucune machine trouvée",
          description: "Commencez par ajouter votre première machine à l'atelier.",
          buttonText: "Ajouter une machine"
        };
      case 'ateliers':
        return {
          title: "Aucun atelier trouvé",
          description: "Commencez par ajouter votre premier atelier.",
          buttonText: "Ajouter un atelier"
        };
      case 'ouvriers':
        return {
          title: "Aucun ouvrier trouvé",
          description: "Commencez par ajouter votre premier ouvrier à l'équipe.",
          buttonText: "Ajouter un ouvrier"
        };
      case 'outils':
        return {
          title: "Aucun outil trouvé",
          description: "La gestion des outils sera disponible prochainement.",
          buttonText: ""
        };
      default:
        return {
          title: "Aucun élément trouvé",
          description: "Commencez par ajouter des éléments.",
          buttonText: ""
        };
    }
  };

  const { title, description, buttonText } = getMessages();

  return (
    <div className="col-span-full text-center py-12">
      <IconComponent className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      {buttonText && ['machines', 'ateliers', 'ouvriers'].includes(activeTab) && (
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
        >
          <Plus className="w-5 h-5 mr-2" />
          {buttonText}
        </button>
      )}
    </div>
  );
}