// src/app/components/workshopComponents.tsx - Version corrigée avec logique ouvriers cohérente
"use client";
import { Plus, Settings, Users, Wrench, Building2, AlertCircle, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import MachineComponents from "./machineComponents";
import MachineFormModal from "./MachineFormModal";
import AtelierComponent from "./AtelierComponents";
import AtelierFormModal from "./AtelierFormModal";
import OuvrierComponent from "./ouvrierComponents";
import OuvrierFormModal from "./OuvrierFormModal";
import { useWorkshopApi, Machine, Outil, Ouvrier, Atelier } from "../../adapters/hooks/useApi";

export default function WorkshopComponents() {
  const [activeTab, setActiveTab] = useState<'machines' | 'outils' | 'ouvriers' | 'ateliers'>('machines');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [selectedAtelier, setSelectedAtelier] = useState<Atelier | null>(null);
  const [selectedOuvrier, setSelectedOuvrier] = useState<Ouvrier | null>(null);
  const [isAtelierModalOpen, setIsAtelierModalOpen] = useState(false);
  const [isOuvrierModalOpen, setIsOuvrierModalOpen] = useState(false);

  
  // États pour les données
  const [machines, setMachines] = useState<Machine[]>([]);
  const [outils, setOutils] = useState<Outil[]>([]);
  const [ouvriers, setOuvriers] = useState<Ouvrier[]>([]);
  const [ateliers, setAteliers] = useState<Atelier[]>([]);

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
        case 'ateliers':
          const ateliersData = await workshopApi.ateliers.getAteliers();
          setAteliers(ateliersData);
          break;
      }
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
    }
  };

  // Handlers pour les machines (inchangés)
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
        const id = selectedMachine.id || selectedMachine._id;
        await workshopApi.machines.updateMachine(id!, data);
      } else {
        await workshopApi.machines.createMachine(data);
      }
      
      setIsModalOpen(false);
      setSelectedMachine(null);
      await loadData();
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
        await loadData();
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

      await workshopApi.machines.toggleMachineStatus(id, newStatus);
      await loadData();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Impossible de changer le statut'}`);
    }
  };

  // Handlers pour les outils (inchangés)
  const handleToggleOutilDisponibilite = async (id: string | number) => {
    try {
      await workshopApi.outils.toggleOutilDisponibilite(id);
      await loadData();
    } catch (error) {
      console.error('Erreur lors du changement de disponibilité:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Impossible de changer la disponibilité'}`);
    }
  };

  // Handlers pour les ouvriers - CORRIGÉS avec logique cohérente
  const handleCreateOuvrier = () => {
    setSelectedOuvrier(null);
    setIsOuvrierModalOpen(true);
  };

  const handleEditOuvrier = (ouvrierDisplay: any) => {
    // Conversion des données d'affichage vers le format API
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
    
    setSelectedOuvrier(ouvrierForApi);
    setIsOuvrierModalOpen(true);
  };

  const handleSubmitOuvrier = async (data: Partial<Ouvrier>) => {
    try {
      if (selectedOuvrier) {
        const id = selectedOuvrier.id || selectedOuvrier._id;
        await workshopApi.ouvriers.updateOuvrier(id!, data);
      } else {
        await workshopApi.ouvriers.createOuvrier(data);
      }
      
      setIsOuvrierModalOpen(false);
      setSelectedOuvrier(null);
      await loadData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'ouvrier:', error);
      throw error;
    }
  };

  const handleDeleteOuvrier = async (id: string | number) => {
    const ouvrier = ouvriers.find(o => (o.id || o._id) == id);
    if (!ouvrier) return;
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer l'ouvrier "${ouvrier.nom}" ?`;
    if (window.confirm(confirmMessage)) {
      try {
        await workshopApi.ouvriers.deleteOuvrier(id);
        await loadData();
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
      await loadData();
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Impossible de changer le statut'}`);
    }
  };

  // Handlers pour les ateliers (inchangés)
  const handleCreateAtelier = () => {
    setSelectedAtelier(null);
    setIsAtelierModalOpen(true);
  };

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
    setSelectedAtelier(atelierForApi);
    setIsAtelierModalOpen(true);
  };

  const handleDeleteAtelier = async (id: string | number) => {
    const atelier = ateliers.find(a => (a.id || a._id) == id);
    if (!atelier) return;

    const confirmMessage = `Êtes-vous sûr de vouloir supprimer l'atelier "${atelier.nom}" ?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await workshopApi.ateliers.deleteAtelier(id);
        await loadData();
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
        case 'actif':
          newStatus = 'maintenance';
          break;
        case 'fermé':
          newStatus = 'actif';
          break;
        case 'maintenance':
          newStatus = 'actif';
          break;
        default:
          newStatus = 'actif';
      }

      await workshopApi.ateliers.updateAtelier(id, { ...atelier, status: newStatus });
      await loadData();
    } catch (error) {
      console.error('Erreur lors du changement de statut de l\'atelier:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Impossible de changer le statut'}`);
    }
  };

  const handleSubmitAtelier = async (data: any) => {
    try {
      if (selectedAtelier) {
        const id = selectedAtelier.id || selectedAtelier._id;
        await workshopApi.ateliers.updateAtelier(id!, data);
      } else {
        await workshopApi.ateliers.createAtelier(data);
      }
      
      setIsAtelierModalOpen(false);
      setSelectedAtelier(null);
      await loadData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'atelier:', error);
      throw error;
    }
  };

  // Handlers de fermeture de modals
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMachine(null);
  };

  const handleCloseAtelierModal = () => {
    setIsAtelierModalOpen(false);
    setSelectedAtelier(null);
  };

  const handleCloseOuvrierModal = () => {
    setIsOuvrierModalOpen(false);
    setSelectedOuvrier(null);
  };

  const handleClearError = () => {
    workshopApi.clearAllErrors();
  };

  const handleRefresh = () => {
    loadData();
  };

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

  // Fonctions de rendu (inchangées)
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
      const errorMessage = workshopApi.machines.error || workshopApi.outils.error || workshopApi.ouvriers.error || workshopApi.ateliers.error;
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
    const currentData = type === 'machines' ? machines : 
                       type === 'outils' ? outils : 
                       type === 'ouvriers' ? ouvriers : ateliers;
    
    const icon = type === 'machines' ? Settings : 
                 type === 'outils' ? Wrench : 
                 type === 'ouvriers' ? Users : Building2;
    const IconComponent = icon;

    if (!workshopApi.isLoading && !workshopApi.hasError && currentData.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <IconComponent className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun{type === 'outils' ? ' outil' : type === 'ouvriers' ? ' ouvrier' : type === 'ateliers' ? ' atelier' : 'e machine'} trouvé{type === 'outils' || type === 'ateliers' ? '' : type === 'ouvriers' ? '' : 'e'}
          </h3>
          <p className="text-gray-600 mb-6">
            {type === 'machines' 
              ? "Commencez par ajouter votre première machine à l'atelier."
              : type === 'ateliers'
              ? "Commencez par ajouter votre premier atelier."
              : type === 'ouvriers'
              ? "Commencez par ajouter votre premier ouvrier à l'équipe."
              : `La gestion des ${type} sera disponible prochainement.`
            }
          </p>
          {(type === 'machines' || type === 'ateliers' || type === 'ouvriers') && (
            <button
              onClick={type === 'machines' ? handleCreateMachine : type === 'ateliers' ? handleCreateAtelier : handleCreateOuvrier}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter {type === 'machines' ? 'une machine' : type === 'ateliers' ? 'un atelier' : 'un ouvrier'}
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

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'machines':
        return `Machines (${machines.length})`;
      case 'outils':
        return `Outils (${outils.length})`;
      case 'ouvriers':
        return `Main d'œuvre (${ouvriers.length})`;
      case 'ateliers':
        return `Ateliers (${ateliers.length})`;
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
                Gestion complète avec API - Machines, Outils, Main d'œuvre et Ateliers
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
          <button
            onClick={() => setActiveTab('ateliers')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'ateliers' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Building2 className="w-4 h-4 inline-block mr-2" />
            {getTabTitle('ateliers')}
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

          {/* Contenu des ouvriers - CORRIGÉ avec conversion appropriée */}
          {activeTab === 'ouvriers' && (
            <>
              {renderEmptyState('ouvriers')}
              {!workshopApi.isLoading && !workshopApi.hasError && ouvriers.length > 0 &&
                ouvriers.map(ouvrier => (
                  <OuvrierComponent
                    key={ouvrier.id || ouvrier._id}
                    ouvrier={convertOuvrierForDisplay(ouvrier)}
                    onEdit={handleEditOuvrier}
                    onDelete={handleDeleteOuvrier}
                    onToggleStatus={handleToggleOuvrierDisponibilite}
                  />
                ))
              }
            </>
          )}

          {/* Contenu des ateliers */}
          {activeTab === 'ateliers' && (
            <>
              {renderEmptyState('ateliers')}
              {!workshopApi.isLoading && !workshopApi.hasError && ateliers.length > 0 &&
                ateliers.map(atelier => (
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
                ))
              }
            </>
          )}
        
        </div>

        {/* Bouton d'ajout flottant */}
        {(activeTab === 'machines' || activeTab === 'ateliers' || activeTab === 'ouvriers') && !workshopApi.hasError && (
          <div className="fixed bottom-6 right-6">
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={activeTab === 'machines' ? handleCreateMachine : activeTab === 'ateliers' ? handleCreateAtelier : handleCreateOuvrier}
              disabled={workshopApi.isLoading}
              title={`Ajouter ${activeTab === 'machines' ? 'une nouvelle machine' : activeTab === 'ateliers' ? 'un nouvel atelier' : 'un nouvel ouvrier'}`}
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

        {/* Modal de création/modification d'atelier */}
        {activeTab === 'ateliers' && (
          <AtelierFormModal
            isOpen={isAtelierModalOpen}
            onClose={handleCloseAtelierModal}
            onSubmit={handleSubmitAtelier}
            atelier={selectedAtelier}
          />
        )}

        {/* Modal de création/modification d'ouvrier */}
        {activeTab === 'ouvriers' && (
          <OuvrierFormModal
            isOpen={isOuvrierModalOpen}
            onClose={handleCloseOuvrierModal}
            onSubmit={handleSubmitOuvrier}
            ouvrier={selectedOuvrier}
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

        {/* Statistiques rapides - CORRIGÉES avec statistiques ouvriers améliorées */}
        {!workshopApi.isLoading && !workshopApi.hasError && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  {ouvriers.length > 0 ? (
                    <div className="text-xs text-gray-500 space-x-2">
                      <span className="text-green-600">{getOuvriersStats().disponibles} libres</span>
                      <span className="text-yellow-600">{getOuvriersStats().occupes} occupés</span>
                      {getOuvriersStats().absents > 0 && (
                        <span className="text-gray-600">{getOuvriersStats().absents} absents</span>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">Aucun ouvrier</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Building2 className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Ateliers</p>
                  <p className="text-2xl font-bold text-gray-900">{ateliers.length}</p>
                  <p className="text-xs text-gray-500">
                    {ateliers.filter(a => a.status === 'actif').length} actifs
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alertes et notifications pour les ouvriers en surcharge */}
        {activeTab === 'ouvriers' && !workshopApi.isLoading && !workshopApi.hasError && ouvriers.length > 0 && (
          <div className="mt-6">
            {(() => {
              const surcharges = ouvriers.filter(o => 
                o.heuresJour && o.heuresMax && 
                (o.heuresJour / o.heuresMax) >= 0.9
              );
              
              const occupesSansTache = ouvriers.filter(o => 
                o.statut === 'occupé' && !o.tacheActuelle?.trim()
              );
              
              if (surcharges.length === 0 && occupesSansTache.length === 0) return null;
              
              return (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                    <h3 className="text-sm font-medium text-yellow-800">Alertes équipe</h3>
                  </div>
                  <div className="space-y-1 text-sm text-yellow-700">
                    {surcharges.length > 0 && (
                      <p>⚠️ {surcharges.length} ouvrier{surcharges.length > 1 ? 's' : ''} en surcharge de travail</p>
                    )}
                    {occupesSansTache.length > 0 && (
                      <p>📋 {occupesSansTache.length} ouvrier{occupesSansTache.length > 1 ? 's' : ''} occupé{occupesSansTache.length > 1 ? 's' : ''} sans tâche spécifiée</p>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}