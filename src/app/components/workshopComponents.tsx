"use client";
import { useState, useEffect } from "react";
import { useWorkshopApi, Machine, Outil, Ouvrier, Atelier } from "../../adapters/hooks/useApi";

// Import des composants modulaires du dossier workshop
import WorkshopHeader from "./workshop/WorkshopHeader";
import WorkshopTabs from "./workshop/WorkshopTabs";
import WorkshopContent from "./workshop/WorkshopContent";
import WorkshopModals from "./workshop/WorkshopModals";
import WorkshopStats from "./workshop/WorkshopStats";
import WorkshopAlerts from "./workshop/WorkshopAlerts";
import WorkshopFloatingButton from "./workshop/WorkshopFloatingButton";
import ApiConnectionIndicator from "./workshop/ApiConnectionIndicator";

export default function WorkshopComponents() {
  // État principal
  const [activeTab, setActiveTab] = useState<'machines' | 'ouvriers' | 'ateliers'>('machines');
  
  // États des modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAtelierModalOpen, setIsAtelierModalOpen] = useState(false);
  const [isOuvrierModalOpen, setIsOuvrierModalOpen] = useState(false);
  
  // États des éléments sélectionnés
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [selectedAtelier, setSelectedAtelier] = useState<Atelier | null>(null);
  const [selectedOuvrier, setSelectedOuvrier] = useState<Ouvrier | null>(null);
  
  // États des données
  const [workshopData, setWorkshopData] = useState({
    machines: [] as Machine[],
    ouvriers: [] as Ouvrier[],
    ateliers: [] as Atelier[]
  });

  // Hook API
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
          setWorkshopData(prev => ({ ...prev, machines: machinesData }));
          break;
        case 'ouvriers':
          const ouvriersData = await workshopApi.ouvriers.getOuvriers();
          setWorkshopData(prev => ({ ...prev, ouvriers: ouvriersData }));
          break;
        case 'ateliers':
          const ateliersData = await workshopApi.ateliers.getAteliers();
          setWorkshopData(prev => ({ ...prev, ateliers: ateliersData }));
          break;
      }
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
    }
  };

  // Chargement complet des données (pour le refresh)
  const loadAllData = async () => {
    try {
      const [machinesData, ouvriersData, ateliersData] = await Promise.all([
        workshopApi.machines.getMachines().catch(() => []),
        workshopApi.ouvriers.getOuvriers().catch(() => []),
        workshopApi.ateliers.getAteliers().catch(() => [])
      ]);
      
      setWorkshopData({
        machines: machinesData,
        ouvriers: ouvriersData,
        ateliers: ateliersData
      });
    } catch (err) {
      console.error('Erreur lors du chargement complet:', err);
    }
  };

  // Gestionnaire de changement d'onglet
  const handleTabChange = (tab: 'machines' | 'ouvriers' | 'ateliers') => {
    setActiveTab(tab);
  };

  // Gestionnaire de refresh
  const handleRefresh = () => {
    loadAllData();
  };

  // Objets de configuration pour passer aux composants
  const modalStates = {
    isModalOpen,
    isAtelierModalOpen,
    isOuvrierModalOpen,
    setIsModalOpen,
    setIsAtelierModalOpen,
    setIsOuvrierModalOpen
  };

  const selectedItems = {
    selectedMachine,
    selectedAtelier,
    selectedOuvrier,
    setSelectedMachine,
    setSelectedAtelier,
    setSelectedOuvrier
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header avec titre et bouton de refresh */}
        <WorkshopHeader 
          isLoading={workshopApi.isLoading}
          onRefresh={handleRefresh}
        />

        {/* Onglets de navigation */}
        <WorkshopTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          workshopData={workshopData}
        />

        {/* Contenu principal selon l'onglet actif */}
        <WorkshopContent
          activeTab={activeTab}
          workshopData={workshopData}
          workshopApi={workshopApi}
          modalStates={modalStates}
          selectedItems={selectedItems}
          onLoadData={loadData}
        />

        {/* Statistiques générales */}
        <WorkshopStats
          workshopData={workshopData}
          isLoading={workshopApi.isLoading}
          hasError={workshopApi.hasError}
        />

        {/* Alertes et notifications (spécifiques aux ouvriers) */}
        <WorkshopAlerts
          activeTab={activeTab}
          ouvriers={workshopData.ouvriers}
          isLoading={workshopApi.isLoading}
          hasError={workshopApi.hasError}
        />

        {/* Bouton flottant d'ajout */}
        <WorkshopFloatingButton
          activeTab={activeTab}
          hasError={workshopApi.hasError}
          isLoading={workshopApi.isLoading}
          modalStates={modalStates}
          selectedItems={selectedItems}
        />

        {/* Modales de création/modification */}
        <WorkshopModals
          activeTab={activeTab}
          modalStates={modalStates}
          selectedItems={selectedItems}
          workshopApi={workshopApi}
          onLoadData={loadData}
        />

        {/* Indicateur de connexion API */}
        <ApiConnectionIndicator hasError={workshopApi.hasError} />
      </div>
    </div>
  );
}