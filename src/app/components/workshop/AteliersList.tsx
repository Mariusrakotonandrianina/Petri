"use client";
import AtelierComponent from "../AtelierComponents";
import { Atelier } from "../../../adapters/hooks/useAtelierApi";

// Interface pour les machines associées
interface MachineAssociee {
  _id: string;
  nom: string;
  type: string;
  capacite?: number;
  status?: string;
  utilisation?: number;
  usage?: string;
  atelierId?: string;
}

interface AteliersListProps {
  ateliers: Atelier[];
  machines?: MachineAssociee[]; // Ajout des machines pour le mapping
  isLoading: boolean;
  hasError: boolean;
  workshopApi: any;
  modalStates: any;
  selectedItems: any;
  onLoadData: () => void;
}

export default function AteliersList({
  ateliers,
  machines = [], // Valeur par défaut
  isLoading,
  hasError,
  workshopApi,
  modalStates,
  selectedItems,
  onLoadData
}: AteliersListProps) {
  
  if (isLoading || hasError || ateliers.length === 0) return null;

  // Fonction pour obtenir les machines associées à un atelier
  const getMachinesForAtelier = (atelierId: string): Array<{nom: string, type: string}> => {
    if (!machines || machines.length === 0 || !atelierId) return [];
    
    return machines
      .filter(machine => machine.atelierId === atelierId)
      .map(machine => ({
        nom: machine.nom,
        type: machine.type
      }));
  };

  // Fonction pour formater les machines associées en string array
  const formatMachinesAssociees = (atelierId: string | number | undefined): string[] => {
    if (!atelierId) return []; // Gestion du cas undefined
    
    const machinesAssociees = getMachinesForAtelier(String(atelierId));
    return machinesAssociees.length > 0 
      ? machinesAssociees.map(m => `${m.nom} (${m.type})`)
      : [];
  };

  const handleEditAtelier = (atelier: any) => {
    // Mapping correct selon l'interface Atelier et les données MongoDB
    const atelierForApi: Atelier = {
      id: atelier._id, // Utiliser _id comme id principal
      _id: atelier._id,
      nom: atelier.nom,
      localisation: atelier.localisation,
      superficie: atelier.superficie,
      capaciteEmployes: atelier.capaciteEmployes,
      ouvrierActuelle: atelier.ouvrierActuelle || 0,
      status: atelier.status,
      usage: atelier.usage,
      machinesAssociees: formatMachinesAssociees(atelier._id), // Peut être un tableau vide
      createdAt: atelier.createdAt,
      updatedAt: atelier.updatedAt
    };
    selectedItems.setSelectedAtelier(atelierForApi);
    modalStates.setIsAtelierModalOpen(true);
  };

  const handleDeleteAtelier = async (id: string | number) => {
    // Recherche par _id MongoDB
    const atelier = ateliers.find(a => (a._id || a.id) === String(id));
    if (!atelier) return;

    const confirmMessage = `Êtes-vous sûr de vouloir supprimer l'atelier "${atelier.nom}" ?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        // Utiliser _id pour l'API
        await workshopApi.ateliers.deleteAtelier(atelier._id || atelier.id);
        await onLoadData();
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'atelier:', error);
        alert(`Erreur lors de la suppression: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }
  };

  const handleToggleAtelierStatus = async (id: string | number) => {
    // Recherche par _id MongoDB
    const atelier = ateliers.find(a => (a._id || a.id) === String(id));
    if (!atelier) return;

    try {
      let newStatus: 'actif' | 'ferme' | 'maintenance'; // Correction: 'ferme' au lieu de 'fermé'
      
      switch (atelier.status) {
        case 'actif': 
          newStatus = 'maintenance'; 
          break;
        case 'ferme': // Correction: utiliser 'ferme' selon l'interface
          newStatus = 'actif'; 
          break;
        case 'maintenance': 
          newStatus = 'actif'; 
          break;
        default: 
          newStatus = 'actif';
      }

      // Créer l'objet complet pour la mise à jour
      const updatedAtelier: Partial<Atelier> = {
        nom: atelier.nom,
        localisation: atelier.localisation,
        superficie: atelier.superficie,
        capaciteEmployes: atelier.capaciteEmployes,
        ouvrierActuelle: atelier.ouvrierActuelle,
        status: newStatus,
        usage: atelier.usage,
        machinesAssociees: formatMachinesAssociees(atelier._id || atelier.id) // Peut être vide
      };

      await workshopApi.ateliers.updateAtelier(atelier._id || atelier.id, updatedAtelier);
      await onLoadData();
    } catch (error) {
      console.error('Erreur lors du changement de statut de l\'atelier:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Impossible de changer le statut'}`);
    }
  };

  return (
    <>
      {ateliers.map(atelier => (
        <AtelierComponent 
          key={atelier._id || atelier.id} 
          atelier={{
            _id: String(atelier._id || atelier.id),
            nom: atelier.nom,
            localisation: atelier.localisation,
            superficie: atelier.superficie,
            capaciteEmployes: atelier.capaciteEmployes,
            ouvrierActuelle: atelier.ouvrierActuelle || 0, // Maintenant inclus dans l'interface
            status: atelier.status,
            usage: atelier.usage || '',
            machinesAssociees: formatMachinesAssociees(atelier._id || atelier.id),
            createdAt: atelier.createdAt,
            updatedAt: atelier.updatedAt
          }}
          onEdit={handleEditAtelier}
          onDelete={handleDeleteAtelier}
          onToggleStatus={handleToggleAtelierStatus}
        />
      ))}
    </>
  );
}