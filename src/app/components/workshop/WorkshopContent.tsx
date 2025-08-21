"use client";
import { Atelier } from "../../../adapters/hooks/useAtelierApi";
import WorkshopLoadingState from "./WorkshopLoadingState";
import { WorkshopErrorState } from "./WorkshopErrorState";
import AteliersList from "./AteliersList";
import WorkshopEmptyState from "./WorkshopEmptyState";

interface WorkshopContentAteliersProps {
  activeTab: 'ateliers';
  workshopData: {
    ateliers: Atelier[];
  };
  workshopApi: any;
  modalStates: any;
  selectedItems: any;
  onLoadData: () => void;
}

export function WorkshopContentAteliers({
  activeTab,
  workshopData,
  workshopApi,
  modalStates,
  selectedItems,
  onLoadData
}: WorkshopContentAteliersProps) {
  
  const handleClearError = () => {
    workshopApi.clearAllErrors();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Loading State */}
      <WorkshopLoadingState isLoading={workshopApi.isLoading} />
      
      {/* Error State */}
      <WorkshopErrorState 
        hasError={workshopApi.hasError}
        errorMessage={workshopApi.ateliers.error}
        onClearError={handleClearError}
        onRefresh={onLoadData}
      />

      {/* Empty State */}
      <WorkshopEmptyState
        activeTab={activeTab}
        currentData={workshopData.ateliers}
        isLoading={workshopApi.isLoading}
        hasError={workshopApi.hasError}
        modalStates={modalStates}
        selectedItems={selectedItems}
      />

      {/* Ateliers List */}
      <AteliersList
        ateliers={workshopData.ateliers}
        isLoading={workshopApi.isLoading}
        hasError={workshopApi.hasError}
        workshopApi={workshopApi}
        modalStates={modalStates}
        selectedItems={selectedItems}
        onLoadData={onLoadData}
      />
    </div>
  );
}
