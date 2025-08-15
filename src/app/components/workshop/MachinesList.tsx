// src/app/components/workshop/MachinesList.tsx
"use client";
import MachineComponents from "../machineComponents";
import { Machine } from "../../../adapters/hooks/useApi";

interface MachinesListProps {
  machines: Machine[];
  isLoading: boolean;
  hasError: boolean;
  workshopApi: any;
  modalStates: any;
  selectedItems: any;
  onLoadData: () => void;
}

export default function MachinesList({
  machines,
  isLoading,
  hasError,
  workshopApi,
  modalStates,
  selectedItems,
  onLoadData
}: MachinesListProps) {
  
  if (isLoading || hasError || machines.length === 0) return null;

  const handleEditMachine = (machine: Machine) => {
    selectedItems.setSelectedMachine(machine);
    modalStates.setIsModalOpen(true);
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
        await onLoadData();
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
        case 'active': newStatus = 'maintenance'; break;
        case 'panne': newStatus = 'active'; break;
        case 'maintenance': newStatus = 'active'; break;
        default: newStatus = 'active';
      }

      await workshopApi.machines.toggleMachineStatus(id, newStatus);
      await onLoadData();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Impossible de changer le statut'}`);
    }
  };

  return (
    <>
      {machines.map(machine => (
        <MachineComponents 
          key={machine.id || machine._id} 
          machine={machine}
          onEdit={handleEditMachine}
          onDelete={handleDeleteMachine}
          onToggleStatus={handleToggleMachineStatus}
        />
      ))}
    </>
  );
}
