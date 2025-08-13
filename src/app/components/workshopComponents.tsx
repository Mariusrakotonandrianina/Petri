// src/app/components/workshopComponents.tsx - Version avec intégration API
"use client";
import { Plus, Settings, Users, Wrench, AlertCircle, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import MachineComponents from "./machineComponents";
import MachineFormModal from "./MachineFormModal";

// Configuration API
const API_BASE_URL = 'http://localhost:5000';

// Types pour l'API
interface ApiMachine {
  id?: string | number;
  _id?: string;
  nom: string;
  type: string;
  capacite: number;
  status: 'active' | 'panne' | 'maintenance';
  utilisation: number;
  derniereRevision: string;
  prochaineMaintenance: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiOutil {
  id?: string | number;
  _id?: string;
  nom: string;
  type: string;
  disponible: boolean;
  derniereUtilisation?: string;
}

interface ApiOuvrier {
  id?: string | number;
  _id?: string;
  nom: string;
  prenom: string;
  specialite: string;
  disponible: boolean;
  heuresTravail?: number;
}

// Hook personnalisé pour les appels API
const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeApiCall = async (url: string, options?: RequestInit) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { makeApiCall, loading, error, setError };
};

export default function WorkshopComponents() {
  const [activeTab, setActiveTab] = useState<'machines' | 'outils' | 'ouvriers'>('machines');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // États pour les données
  const [machines, setMachines] = useState<ApiMachine[]>([]);
  const [outils, setOutils] = useState<ApiOutil[]>([]);
  const [ouvriers, setOuvriers] = useState<ApiOuvrier[]>([]);

  // Hook API
  const { makeApiCall, loading, error, setError } = useApiCall();

  // Chargement initial des données
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      switch (activeTab) {
        case 'machines':
          const machinesData = await makeApiCall('/machines');
          setMachines(Array.isArray(machinesData) ? machinesData : machinesData.data || []);
          break;
        case 'outils':
          const outilsData = await makeApiCall('/outils');
          setOutils(Array.isArray(outilsData) ? outilsData : outilsData.data || []);
          break;
        case 'ouvriers':
          const ouvriersData = await makeApiCall('/ouvriers');
          setOuvriers(Array.isArray(ouvriersData) ? ouvriersData : ouvriersData.data || []);
          break;
      }
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
    }
  };

  // Handlers pour les machines
  const handleCreateMachine = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEditMachine = (machine: ApiMachine) => {
    setSelectedItem(machine);
    setIsModalOpen(true);
  };

  const handleSubmitMachine = async (data: any) => {
    try {
      if (selectedItem) {
        // Modification
        const id = selectedItem.id || selectedItem._id;
        await makeApiCall(`/machines/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      } else {
        // Création
        await makeApiCall('/machines', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
      
      setIsModalOpen(false);
      setSelectedItem(null);
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
        await makeApiCall(`/machines/${id}`, {
          method: 'DELETE',
        });
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

      await makeApiCall(`/machines/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...machine,
          status: newStatus,
          utilisation: newStatus !== 'active' ? 0 : machine.utilisation
        }),
      });
      
      await loadData(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Impossible de changer le statut'}`);
    }
  };

  // Handlers pour les outils
  const handleToggleOutilDisponibilite = async (id: string | number) => {
    const outil = outils.find(o => (o.id || o._id) == id);
    if (!outil) return;

    try {
      await makeApiCall(`/outils/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...outil,
          disponible: !outil.disponible,
          derniereUtilisation: !outil.disponible ? new Date().toISOString() : outil.derniereUtilisation
        }),
      });
      await loadData();
    } catch (error) {
      console.error('Erreur lors du changement de disponibilité:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Impossible de changer la disponibilité'}`);
    }
  };

  // Handlers pour les ouvriers
  const handleToggleOuvrierDisponibilite = async (id: string | number) => {
    const ouvrier = ouvriers.find(o => (o.id || o._id) == id);
    if (!ouvrier) return;

    try {
      await makeApiCall(`/ouvriers/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...ouvrier,
          disponible: !ouvrier.disponible
        }),
      });
      await loadData();
    } catch (error) {
      console.error('Erreur lors du changement de disponibilité:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Impossible de changer la disponibilité'}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleClearError = () => {
    setError(null);
  };

  const handleRefresh = () => {
    loadData();
  };

  // Fonctions de rendu
  const renderLoadingState = () => {
    if (loading) {
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
    if (error) {
      return (
        <div className="col-span-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Erreur de connexion</h3>
            <p className="text-red-600 mb-4">{error}</p>
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

    if (!loading && !error && currentData.length === 0) {
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
  const OutilCard = ({ outil }: { outil: ApiOutil }) => (
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
        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          outil.disponible
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        }`}
      >
        {outil.disponible ? 'Marquer indisponible' : 'Marquer disponible'}
      </button>
    </div>
  );

  // Composant pour afficher un ouvrier
  const OuvrierCard = ({ ouvrier }: { ouvrier: ApiOuvrier }) => (
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
        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          ouvrier.disponible
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        }`}
      >
        {ouvrier.disponible ? 'Marquer occupé' : 'Marquer disponible'}
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
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
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
              {!loading && !error && machines.length > 0 && 
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
              {!loading && !error && outils.length > 0 &&
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
              {!loading && !error && ouvriers.length > 0 &&
                ouvriers.map(ouvrier => (
                  <OuvrierCard key={ouvrier.id || ouvrier._id} ouvrier={ouvrier} />
                ))
              }
            </>
          )}
        </div>

        {/* Bouton d'ajout flottant - uniquement pour les machines */}
        {activeTab === 'machines' && !error && (
          <div className="fixed bottom-6 right-6">
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCreateMachine}
              disabled={loading}
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
            machine={selectedItem}
            title={selectedItem ? 'Modifier la machine' : 'Ajouter une machine'}
          />
        )}

        {/* Indicateur de connexion API */}
        <div className="fixed bottom-6 left-6">
          <div className={`flex items-center px-3 py-2 rounded-lg text-sm ${
            error 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              error ? 'bg-red-600' : 'bg-green-600'
            }`}></div>
            API {error ? 'Déconnectée' : 'Connectée'}
          </div>
        </div>

        {/* Statistiques rapides */}
        {!loading && !error && (
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