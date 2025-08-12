"use client";
import { Plus, Settings, Users, Wrench } from "lucide-react";
import { useState } from "react";
import MachineComponents from "./machineComponents";
import OutilsComponents from "./outilsComponents";
import OuvrierComponents from "./ouvrierComponents";
import { useMachines } from "../../adapters/hooks/useMachines";
import { useOutils } from "../../adapters/hooks/useOutils";
import { useOuvriers } from "../../adapters/hooks/useOuvriers";

export default function WorkshopComponents() {
  const [activeTab, setActiveTab] = useState('machines');

  // Utilisation des hooks avec Clean Architecture
  const { 
    machines, 
    loading: machinesLoading, 
    error: machinesError,
    updateMachine,
    deleteMachine,
    toggleMachineStatus 
  } = useMachines();

  const { 
    outils, 
    loading: outilsLoading, 
    error: outilsError,
    updateOutil,
    deleteOutil,
    reserveOutil 
  } = useOutils();

  const { 
    ouvriers, 
    loading: ouvriersLoading, 
    error: ouvriersError,
    updateOuvrier,
    deleteOuvrier,
    assignTask 
  } = useOuvriers();

  const handleEditMachine = async (machine: any) => {
    try {
      // Ici vous pouvez ouvrir un modal d'édition
      console.log('Edit machine:', machine);
      // Exemple: await updateMachine(machine.id, updatedData);
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
    }
  };

  const handleDeleteMachine = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette machine ?')) {
      try {
        await deleteMachine(id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleToggleMachineStatus = async (id: number) => {
    try {
      await toggleMachineStatus(id);
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  const handleEditOutil = async (outil: any) => {
    try {
      console.log('Edit outil:', outil);
      // Exemple: await updateOutil(outil.id, updatedData);
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
    }
  };

  const handleDeleteOutil = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet outil ?')) {
      try {
        await deleteOutil(id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleReserveOutil = async (id: number) => {
    try {
      await reserveOutil(id);
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
    }
  };

  const handleEditOuvrier = async (ouvrier: any) => {
    try {
      console.log('Edit ouvrier:', ouvrier);
      // Exemple: await updateOuvrier(ouvrier.id, updatedData);
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
    }
  };

  const handleDeleteOuvrier = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet ouvrier ?')) {
      try {
        await deleteOuvrier(id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleAssignTask = async (id: number) => {
    const task = prompt('Entrez la tâche à assigner:');
    if (task) {
      try {
        await assignTask(id, task);
      } catch (error) {
        console.error('Erreur lors de l\'assignation:', error);
      }
    }
  };

  const renderLoadingState = (loading: boolean, error: string | null) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interface Atelier Automobile - Clean Architecture
          </h1>
          <p className="text-gray-600">
            Gestion des ressources avec CRUD complet - Machines, Outils et Main d'œuvre
          </p>
        </div>

        <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 border border-gray-200">
          <button
            onClick={() => setActiveTab('machines')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'machines' 
                  ? 'bg-green-100 text-green-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <Settings className="w-4 h-4 inline-block mr-2" />
            Machines ({machines.length})
          </button>
          <button
            onClick={() => setActiveTab('outils')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'outils' 
                  ? 'bg-green-100 text-green-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <Wrench className="w-4 h-4 inline-block mr-2" />
            Outils ({outils.length})
          </button>
          <button
            onClick={() => setActiveTab('operateurs')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'operateurs' 
                ? 'bg-green-100 text-green-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4 inline-block mr-2" />
            Main d'œuvre ({ouvriers.length})
          </button>
        </div>

        {/* Contenu selon l'onglet actif */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'machines' && (
            <>
              {renderLoadingState(machinesLoading, machinesError)}
              {!machinesLoading && !machinesError && machines.map(machine => (
                <MachineComponents 
                  key={machine.id} 
                  machine={machine}
                  onEdit={handleEditMachine}
                  onDelete={handleDeleteMachine}
                  onToggleStatus={handleToggleMachineStatus}
                />
              ))}
            </>
          )}

          {activeTab === 'outils' && (
            <>
              {renderLoadingState(outilsLoading, outilsError)}
              {!outilsLoading && !outilsError && outils.map(outil => (
                <OutilsComponents 
                  key={outil.id} 
                  outil={outil}
                  onEdit={handleEditOutil}
                  onDelete={handleDeleteOutil}
                  onReserver={handleReserveOutil}
                />
              ))}
            </>
          )}

          {activeTab === 'operateurs' && (
            <>
              {renderLoadingState(ouvriersLoading, ouvriersError)}
              {!ouvriersLoading && !ouvriersError && ouvriers.map(ouvrier => (
                <OuvrierComponents 
                  key={ouvrier.id} 
                  operateur={ouvrier}
                  onEdit={handleEditOuvrier}
                  onDelete={handleDeleteOuvrier}
                  onAssigner={handleAssignTask}
                />
              ))}
            </>
          )}
        </div>

        {/* Bouton d'ajout flottant */}
        <div className="fixed bottom-6 right-6">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors"
            onClick={() => {
              // Ouvrir un modal de création selon l'onglet actif
              console.log(`Créer nouveau ${activeTab}`);
            }}
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}