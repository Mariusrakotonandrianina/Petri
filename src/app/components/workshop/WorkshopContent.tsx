"use client";
import { Machine, Outil, Ouvrier, Atelier } from "../../../adapters/hooks/useApi";
import WorkshopLoadingState from "./WorkshopLoadingState";
import { WorkshopErrorState } from "./WorkshopErrorState"; // Correction ici - import nommé
import MachinesList from "./MachinesList";
import OutilsList from "./OutilsList";
import OuvriersList from "./OuvriersList";
import AteliersList from "./AteliersList";
import WorkshopEmptyState from "./WorkshopEmptyState";

interface WorkshopContentProps {
  activeTab: 'machines' | 'outils' | 'ouvriers' | 'ateliers';
  workshopData: {
    machines: Machine[];
    outils: Outil[];
    ouvriers: Ouvrier[];
    ateliers: Atelier[];
  };
  workshopApi: any;
  modalStates: any;
  selectedItems: any;
  onLoadData: () => void;
}

export default function WorkshopContent({
  activeTab,
  workshopData,
  workshopApi,
  modalStates,
  selectedItems,
  onLoadData
}: WorkshopContentProps) {
  
  const handleClearError = () => {
    workshopApi.clearAllErrors();
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'machines': return workshopData.machines;
      case 'outils': return workshopData.outils;
      case 'ouvriers': return workshopData.ouvriers;
      case 'ateliers': return workshopData.ateliers;
      default: return [];
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Loading State */}
      <WorkshopLoadingState isLoading={workshopApi.isLoading} />
      
      {/* Error State */}
      <WorkshopErrorState 
        hasError={workshopApi.hasError}
        errorMessage={workshopApi.machines.error || workshopApi.outils.error || workshopApi.ouvriers.error || workshopApi.ateliers.error}
        onClearError={handleClearError}
        onRefresh={onLoadData}
      />

      {/* Empty State */}
      <WorkshopEmptyState
        activeTab={activeTab}
        currentData={getCurrentData()}
        isLoading={workshopApi.isLoading}
        hasError={workshopApi.hasError}
        modalStates={modalStates}
        selectedItems={selectedItems}
      />

      {/* Content based on active tab */}
      {activeTab === 'machines' && (
        <MachinesList
          machines={workshopData.machines}
          isLoading={workshopApi.isLoading}
          hasError={workshopApi.hasError}
          workshopApi={workshopApi}
          modalStates={modalStates}
          selectedItems={selectedItems}
          onLoadData={onLoadData}
        />
      )}

      {activeTab === 'outils' && (
        <OutilsList
          outils={workshopData.outils}
          isLoading={workshopApi.isLoading}
          hasError={workshopApi.hasError}
          workshopApi={workshopApi}
          onLoadData={onLoadData}
        />
      )}

      {activeTab === 'ouvriers' && (
        <OuvriersList
          ouvriers={workshopData.ouvriers}
          isLoading={workshopApi.isLoading}
          hasError={workshopApi.hasError}
          workshopApi={workshopApi}
          modalStates={modalStates}
          selectedItems={selectedItems}
          onLoadData={onLoadData}
        />
      )}

      {activeTab === 'ateliers' && (
        <AteliersList
          ateliers={workshopData.ateliers}
          isLoading={workshopApi.isLoading}
          hasError={workshopApi.hasError}
          workshopApi={workshopApi}
          modalStates={modalStates}
          selectedItems={selectedItems}
          onLoadData={onLoadData}
        />
      )}
    </div>
  );
}