// src/app/components/workshopComponents.tsx - Version corrigée avec hooks API
"use client";
import { Plus, Settings, Users, Wrench, AlertCircle, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import MachineComponents from "./machineComponents";
import MachineFormModal from "./MachineFormModal";
import { useWorkshopApi, Machine, Outil, Ouvrier } from "../../adapters/hooks/useApi";

export default function WorkshopComponents() {
  const [activeTab, setActiveTab] = useState<'machines' | 'outils' | 'ouvriers'>('machines');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  
  // États pour les données
  const [machines, setMachines] = useState<Machine[]>([]);
  const [outils, setOutils] = useState<Outil[]>([]);
  const [ouvriers, setOuvriers] = useState<Ouvrier[]>([]);

  // Utilisation du hook API combiné
  const workshopApi = useWorkshopApi();

  // Chargement initial des données
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      switch (activeTab) {
        case 'machines':
          const machinesData = await workshopApi.machines.getMachines();
          setMachines(machinesData);
          break;
        case 'outils':
          const outilsData = await workshopApi.outils.getOutils();
          setOutils(outilsData);
          break;
        case 'ouvriers':
          const ouvriersData = await workshopApi.ouvriers.getOuvriers();
          setOuvriers(ouvriersData);
          break;
      }
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
    }
  };

  // Handlers pour les machines
  const handleCreateMachine = () => {
    setSelectedMachine(null);
    setIsModalOpen(true);
  };

  const handleEditMachine = (machine: Machine) => {
    setSelectedMachine(machine);
    setIsModalOpen(true);
  };

  const handleSubmitMachine = async (data: any) => {
    try {
      if (selectedMachine) {
        // Modification
        const id = selectedMachine.id || selectedMachine._id;
        await workshopApi.machines.updateMachine(id!, data);
      } else {
        // Création
        await workshopApi.machines.createMachine(data);
      }
      
      setIsModalOpen(false);
      setSelectedMachine(null);
      await loadData(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }
  };

  const handleDeleteMachine = async (id: string | number) => {
    const machine = machines.find(m => (m.id || m._id) == id);
    if (!machine) return;

    const confirmMessage = machine.status === 'active' 
      ? `⚠️ ATTENTION: La machine "${machine.nom}" est actuellement active.\n\nÊtes-vous sûr de vouloir la supprimer ?`
      : `Êtes-vous sûr de vouloir supprimer la machine "${machine.nom}" ?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await workshopApi.machines.deleteMachine(id);
        await loadData(); // Recharger les données
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert(`Erreur lors de la suppression: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }
  };

  const handleToggleMachineStatus = async (id: string | number) => {
    const machine = machines.find(m => (m.id || m._id) == id);
    if (!machine) return;

    try {
      let newStatus: 'active' | 'panne' | 'maintenance';
      
      switch (machine.status) {
        case 'active':
          newStatus = 'maintenance';
          break;
        case 'panne':
          newStatus = 'active';
          break;
        case 'maintenance':
          newStatus = 'active';
          break;
        default:
          newStatus = 'active';
      }

      // Utilisation de la méthode dédiée pour changer le statut
      await workshopApi.machines.toggleMachineStatus(id, newStatus);
      await loadData(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Impossible de changer le statut'}`);
    }
  };

  // Handlers pour les outils
  const handleToggleOutilDisponibilite = async (id: string | number) => {
    try {
      await workshopApi.outils.toggleOutilDisponibilite(id);
      await loadData();
    } catch (error) {
      console.error('Erreur lors du changement de disponibilité:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Impossible de changer la disponibilité'}`);
    }
  };

  // Handlers pour les ouvriers
  const handleToggleOuvrierDisponibilite = async (id: string | number) => {
    try {
      await workshopApi.ouvriers.toggleOuvrierDisponibilite(id);
      await loadData();
    } catch (error) {
      console.error('Erreur lors du changement de disponibilité:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Impossible de changer la disponibilité'}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMachine(null);
  };

  const handleClearError = () => {
    workshopApi.clearAllErrors();
  };

  const handleRefresh = () => {
    loadData();
  };

  // Fonctions de rendu
  const renderLoadingState = () => {
    if (workshopApi.isLoading) {
      return (
        <div className="col-span-full flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des données...</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderErrorState = () => {
    if (workshopApi.hasError) {
      const errorMessage = workshopApi.machines.error || workshopApi.outils.error || workshopApi.ouvriers.error;
      return (
        <div className="col-span-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Erreur de connexion</h3>
            <p className="text-red-600 mb-4">{errorMessage}</p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={handleClearError}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={handleRefresh}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderEmptyState = (type: string) => {
    const currentData = type === 'machines' ? machines : type === 'outils' ? outils : ouvriers;
    const icon = type === 'machines' ? Settings : type === 'outils' ? Wrench : Users;
    const IconComponent = icon;

    if (!workshopApi.isLoading && !workshopApi.hasError && currentData.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <IconComponent className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun {type.slice(0, -1)} trouvé</h3>
          <p className="text-gray-600 mb-6">
            {type === 'machines' 
              ? "Commencez par ajouter votre première machine à l'atelier."
              : `La gestion des ${type} sera disponible prochainement.`
            }
          </p>
          {type === 'machines' && (
            <button
              onClick={handleCreateMachine}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter une machine
            </button>
          )}
        </div>
      );
    }
    return null;
  };

  // Composant pour afficher un outil
  const OutilCard = ({ outil }: { outil: Outil }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Wrench className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{outil.nom}</h3>
            <p className="text-sm text-gray-600">{outil.type}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          outil.disponible 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {outil.disponible ? '✓ Disponible' : '✗ Indisponible'}
        </span>
      </div>

      {outil.derniereUtilisation && (
        <div className="text-sm text-gray-600 mb-4">
          Dernière utilisation: {new Date(outil.derniereUtilisation).toLocaleDateString('fr-FR')}
        </div>
      )}

      <button
        onClick={() => handleToggleOutilDisponibilite(outil.id || outil._id!)}
        disabled={workshopApi.outils.loading}
        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          outil.disponible
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        }`}
      >
        {workshopApi.outils.loading ? 'Changement...' : 
         outil.disponible ? 'Marquer indisponible' : 'Marquer disponible'}
      </button>
    </div>
  );

  // Composant pour afficher un ouvrier
  const OuvrierCard = ({ ouvrier }: { ouvrier: Ouvrier }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              {ouvrier.prenom} {ouvrier.nom}
            </h3>
            <p className="text-sm text-gray-600">{ouvrier.specialite}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          ouvrier.disponible 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {ouvrier.disponible ? '✓ Disponible' : '✗ Occupé'}
        </span>
      </div>

      {ouvrier.heuresTravail && (
        <div className="text-sm text-gray-600 mb-4">
          Heures travaillées: {ouvrier.heuresTravail}h
        </div>
      )}

      <button
        onClick={() => handleToggleOuvrierDisponibilite(ouvrier.id || ouvrier._id!)}
        disabled={workshopApi.ouvriers.loading}
        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          ouvrier.disponible
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        }`}
      >
        {workshopApi.ouvriers.loading ? 'Changement...' : 
         ouvrier.disponible ? 'Marquer occupé' : 'Marquer disponible'}
      </button>
    </div>
  );

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'machines':
        return `Machines (${machines.length})`;
      case 'outils':
        return `Outils (${outils.length})`;
      case 'ouvriers':
        return `Main d'œuvre (${ouvriers.length})`;
      default:
        return tab;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Interface Atelier Automobile
              </h1>
              <p className="text-gray-600">
                Gestion complète avec API - Machines, Outils et Main d'œuvre
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={workshopApi.isLoading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${workshopApi.isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
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
          >
            <Wrench className="w-4 h-4 inline-block mr-2" />
            {getTabTitle('outils')}
          </button>
          <button
            onClick={() => setActiveTab('ouvriers')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'ouvriers' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4 inline-block mr-2" />
            {getTabTitle('ouvriers')}
          </button>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderLoadingState()}
          {renderErrorState()}
          
          {/* Contenu des machines */}
          {activeTab === 'machines' && (
            <>
              {renderEmptyState('machines')}
              {!workshopApi.isLoading && !workshopApi.hasError && machines.length > 0 && 
                machines.map(machine => (
                  <MachineComponents 
                    key={machine.id || machine._id} 
                    machine={machine}
                    onEdit={handleEditMachine}
                    onDelete={handleDeleteMachine}
                    onToggleStatus={handleToggleMachineStatus}
                  />
                ))
              }
            </>
          )}

          {/* Contenu des outils */}
          {activeTab === 'outils' && (
            <>
              {renderEmptyState('outils')}
              {!workshopApi.isLoading && !workshopApi.hasError && outils.length > 0 &&
                outils.map(outil => (
                  <OutilCard key={outil.id || outil._id} outil={outil} />
                ))
              }
            </>
          )}

          {/* Contenu des ouvriers */}
          {activeTab === 'ouvriers' && (
            <>
              {renderEmptyState('ouvriers')}
              {!workshopApi.isLoading && !workshopApi.hasError && ouvriers.length > 0 &&
                ouvriers.map(ouvrier => (
                  <OuvrierCard key={ouvrier.id || ouvrier._id} ouvrier={ouvrier} />
                ))
              }
            </>
          )}
        </div>

        {/* Bouton d'ajout flottant - uniquement pour les machines */}
        {activeTab === 'machines' && !workshopApi.hasError && (
          <div className="fixed bottom-6 right-6">
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCreateMachine}
              disabled={workshopApi.isLoading}
              title="Ajouter une nouvelle machine"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Modal de création/modification de machine */}
        {activeTab === 'machines' && (
          <MachineFormModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmitMachine}
            machine={selectedMachine}
            title={selectedMachine ? 'Modifier la machine' : 'Ajouter une machine'}
          />
        )}

        {/* Indicateur de connexion API */}
        <div className="fixed bottom-6 left-6">
          <div className={`flex items-center px-3 py-2 rounded-lg text-sm ${
            workshopApi.hasError 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              workshopApi.hasError ? 'bg-red-600' : 'bg-green-600'
            }`}></div>
            API {workshopApi.hasError ? 'Déconnectée' : 'Connectée'}
          </div>
        </div>

        {/* Statistiques rapides */}
        {!workshopApi.isLoading && !workshopApi.hasError && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Settings className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Machines</p>
                  <p className="text-2xl font-bold text-gray-900">{machines.length}</p>
                  <p className="text-xs text-gray-500">
                    {machines.filter(m => m.status === 'active').length} actives
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Wrench className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Outils</p>
                  <p className="text-2xl font-bold text-gray-900">{outils.length}</p>
                  <p className="text-xs text-gray-500">
                    {outils.filter(o => o.disponible).length} disponibles
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Main d'œuvre</p>
                  <p className="text-2xl font-bold text-gray-900">{ouvriers.length}</p>
                  <p className="text-xs text-gray-500">
                    {ouvriers.filter(o => o.disponible).length} disponibles
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}