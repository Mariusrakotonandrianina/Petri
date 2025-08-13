// src/app/components/workshopComponents.tsx - Version corrigée avec modals
"use client";
import { Plus, Settings, Users, Wrench, AlertCircle } from "lucide-react";
import { useState } from "react";
import MachineComponents from "./machineComponents";
import MachineFormModal from "./MachineFormModal";
import { useMachines } from "../../adapters/hooks/useMachines";
import { Machine } from "../../core/entities/Machines";

export default function WorkshopComponents() {
  const [activeTab, setActiveTab] = useState('machines');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Utilisation du hook useMachines avec Clean Architecture
  const { 
    machines, 
    loading: machinesLoading, 
    error: machinesError,
    createMachine,
    updateMachine,
    deleteMachine,
    toggleMachineStatus,
    clearError
  } = useMachines();

  // Handlers pour les machines
  const handleCreateMachine = () => {
    setSelectedMachine(null);
    setIsModalOpen(true);
  };

  const handleEditMachine = (machine: Machine) => {
    setSelectedMachine(machine);
    setIsModalOpen(true);
  };

  const handleSubmitMachine = async (data: Omit<Machine, 'id'> | Machine) => {
    try {
      if (selectedMachine) {
        // Modification
        await updateMachine(selectedMachine.id, data as Partial<Machine>);
      } else {
        // Création
        await createMachine(data as Omit<Machine, 'id'>);
      }
      setIsModalOpen(false);
      setSelectedMachine(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error; // Le modal gérera l'affichage de l'erreur
    }
  };

  const handleDeleteMachine = async (id: number) => {
    const machine = machines.find(m => m.id === id);
    if (!machine) return;

    const confirmMessage = machine.status === 'active' 
      ? `⚠️ ATTENTION: La machine "${machine.nom}" est actuellement active.\n\nÊtes-vous sûr de vouloir la supprimer ?`
      : `Êtes-vous sûr de vouloir supprimer la machine "${machine.nom}" ?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        setIsDeleting(true);
        await deleteMachine(id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert(`Erreur lors de la suppression: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleToggleMachineStatus = async (id: number) => {
    try {
      await toggleMachineStatus(id);
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Impossible de changer le statut'}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMachine(null);
  };

  const handleClearError = () => {
    clearError();
  };

  const renderLoadingState = () => {
    if (machinesLoading) {
      return (
        <div className="col-span-full flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des machines...</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderErrorState = () => {
    if (machinesError) {
      return (
        <div className="col-span-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Erreur de chargement</h3>
            <p className="text-red-600 mb-4">{machinesError}</p>
            <button
              onClick={handleClearError}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderEmptyState = () => {
    if (!machinesLoading && !machinesError && machines.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune machine trouvée</h3>
          <p className="text-gray-600 mb-6">Commencez par ajouter votre première machine à l'atelier.</p>
          <button
            onClick={handleCreateMachine}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter une machine
          </button>
        </div>
      );
    }
    return null;
  };

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'machines':
        return `Machines (${machines.length})`;
      case 'outils':
        return 'Outils (0)'; // À implémenter
      case 'operateurs':
        return 'Main d\'œuvre (0)'; // À implémenter
      default:
        return tab;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interface Atelier Automobile - Clean Architecture
          </h1>
          <p className="text-gray-600">
            Gestion des ressources avec CRUD complet - Machines, Outils et Main d'œuvre
          </p>
        </div>

        {/* Onglets de navigation */}
        <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 border border-gray-200">
          <button
            onClick={() => setActiveTab('machines')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'machines' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="w-4 h-4 inline-block mr-2" />
            {getTabTitle('machines')}
          </button>
          <button
            onClick={() => setActiveTab('outils')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'outils' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            disabled
          >
            <Wrench className="w-4 h-4 inline-block mr-2" />
            {getTabTitle('outils')} (Bientôt)
          </button>
          <button
            onClick={() => setActiveTab('operateurs')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'operateurs' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            disabled
          >
            <Users className="w-4 h-4 inline-block mr-2" />
            {getTabTitle('operateurs')} (Bientôt)
          </button>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'machines' && (
            <>
              {renderLoadingState()}
              {renderErrorState()}
              {renderEmptyState()}
              
              {!machinesLoading && !machinesError && machines.length > 0 && 
                machines.map(machine => (
                  <MachineComponents 
                    key={machine.id} 
                    machine={machine}
                    onEdit={handleEditMachine}
                    onDelete={handleDeleteMachine}
                    onToggleStatus={handleToggleMachineStatus}
                  />
                ))
              }
            </>
          )}

          {activeTab === 'outils' && (
            <div className="col-span-full text-center py-12">
              <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Module Outils</h3>
              <p className="text-gray-600">Ce module sera disponible prochainement.</p>
            </div>
          )}

          {activeTab === 'operateurs' && (
            <div className="col-span-full text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Module Main d'œuvre</h3>
              <p className="text-gray-600">Ce module sera disponible prochainement.</p>
            </div>
          )}
        </div>

        {/* Bouton d'ajout flottant - uniquement pour les machines */}
        {activeTab === 'machines' && (
          <div className="fixed bottom-6 right-6">
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCreateMachine}
              disabled={machinesLoading || isDeleting}
              title="Ajouter une nouvelle machine"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Modal de création/modification de machine */}
        <MachineFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitMachine}
          machine={selectedMachine}
          title={selectedMachine ? 'Modifier la machine' : 'Ajouter une machine'}
        />

        {/* Overlay de chargement global */}
        {isDeleting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                <span className="text-lg font-medium">Suppression en cours...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}