"use client";
import { useState, useEffect } from "react";
import { Atelier, useAtelierApi } from "../../adapters/hooks/useAtelierApi";
import { Building2 } from "lucide-react";
import { WorkshopModalsAteliers } from "./workshop/WorkshopModals";
import { WorkshopStatsAteliers } from "./workshop/WorkshopStats";
import { WorkshopContentAteliers } from "./workshop/WorkshopContent";
import { WorkshopHeaderAteliers } from "./workshop/WorkshopHeader";

export default function WorkshopComponents() {
  const [activeTab] = useState<'ateliers'>('ateliers'); // Seul onglet ateliers
  
  const [isAtelierModalOpen, setIsAtelierModalOpen] = useState(false);
  const [selectedAtelier, setSelectedAtelier] = useState<Atelier | null>(null);
  
  const [workshopData, setWorkshopData] = useState({
    ateliers: [] as Atelier[]
  });

  // Hook API pour les ateliers uniquement
  const atelierApi = useAtelierApi();

  // Objet workshopApi unifié pour compatibilité avec les composants existants
  const workshopApi = {
    ateliers: atelierApi,
    isLoading: atelierApi.loading,
    hasError: Boolean(atelierApi.error),
    clearAllErrors: () => {
      atelierApi.clearError();
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const ateliersData = await atelierApi.getAteliers();
      setWorkshopData({ ateliers: ateliersData });
    } catch (err) {
      console.error('Erreur lors du chargement des ateliers:', err);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const modalStates = {
    isAtelierModalOpen,
    setIsAtelierModalOpen
  };

  const selectedItems = {
    selectedAtelier,
    setSelectedAtelier
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <WorkshopHeaderAteliers
          isLoading={workshopApi.isLoading}
          onRefresh={handleRefresh}
        />

        {/* Contenu principal - ateliers uniquement */}
        <WorkshopContentAteliers
          activeTab={activeTab}
          workshopData={workshopData}
          workshopApi={workshopApi}
          modalStates={modalStates}
          selectedItems={selectedItems}
          onLoadData={loadData}
        />

        <WorkshopStatsAteliers
          workshopData={workshopData}
          isLoading={workshopApi.isLoading}
          hasError={workshopApi.hasError}
        />

        {/* Bouton flottant pour ajouter un atelier */}
        <button
          onClick={() => {
            selectedItems.setSelectedAtelier(null);
            modalStates.setIsAtelierModalOpen(true);
          }}
          disabled={workshopApi.hasError || workshopApi.isLoading}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Ajouter un atelier"
        >
          <Building2 className="w-6 h-6" />
        </button>

        <WorkshopModalsAteliers
          activeTab={activeTab}
          modalStates={modalStates}
          selectedItems={selectedItems}
          workshopApi={workshopApi}
          onLoadData={loadData}
        />

        {/* Indicateur de connexion API */}
        <div className="fixed bottom-6 left-6 z-30">
          <div className={`flex items-center px-3 py-2 rounded-lg text-xs font-medium ${
            workshopApi.hasError 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'bg-green-100 text-green-700 border border-green-200'
          }`}>
            <Building2 className="w-3 h-3 mr-1" />
            {workshopApi.hasError ? 'Erreur API' : 'API OK'}
          </div>
        </div>
      </div>
    </div>
  );
}