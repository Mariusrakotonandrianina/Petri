// src/app/components/workshop/index.ts
// Composants principaux
export { default as WorkshopComponents } from '../WorkshopComponents';
export { default as WorkshopHeader } from './WorkshopHeader';
export { default as WorkshopTabs } from './WorkshopTabs';
export { default as WorkshopContent } from './WorkshopContent';
export { default as WorkshopModals } from './WorkshopModals';
export { default as WorkshopStats } from './WorkshopStats';
export { default as WorkshopAlerts } from './WorkshopAlerts';

// Composants utilitaires
export { default as WorkshopFloatingButton } from './WorkshopFloatingButton';
export { default as ApiConnectionIndicator } from './ApiConnectionIndicator';

// Composants d'état
export { default as WorkshopLoadingState } from './WorkshopLoadingState';
export { default as WorkshopErrorState } from './WorkshopErrorState';
export { default as WorkshopEmptyState } from './WorkshopEmptyState';

// Composants de listes
export { default as MachinesList } from './MachinesList';
export { default as OutilsList } from './OutilsList';
export { default as OuvriersList } from './OuvriersList';
export { default as AteliersList } from './AteliersList';

// Types et interfaces (si nécessaire)
export type WorkshopTab = 'machines' | 'outils' | 'ouvriers' | 'ateliers';

export interface WorkshopData {
  machines: any[];
  outils: any[];
  ouvriers: any[];
  ateliers: any[];
}

export interface ModalStates {
  isModalOpen: boolean;
  isAtelierModalOpen: boolean;
  isOuvrierModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  setIsAtelierModalOpen: (open: boolean) => void;
  setIsOuvrierModalOpen: (open: boolean) => void;
}

export interface SelectedItems {
  selectedMachine: any;
  selectedAtelier: any;
  selectedOuvrier: any;
  setSelectedMachine: (item: any) => void;
  setSelectedAtelier: (item: any) => void;
  setSelectedOuvrier: (item: any) => void;
}