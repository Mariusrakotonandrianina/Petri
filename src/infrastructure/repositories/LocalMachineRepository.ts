// src/infrastructure/repositories/LocalMachineRepository.ts - Version corrigée sans erreurs
import { Machine } from '../../core/entities/Machines';
import { IMachineRepository } from '../../core/interfaces/repositories/IMachineRepository';
import { IStorageService } from '../../core/interfaces/services/IStorageService';
import { defaultMachinesData } from '../../app/data/machineData';

export class LocalMachineRepository implements IMachineRepository {
  private readonly STORAGE_KEY = 'machines';

  constructor(private storageService: IStorageService) {
    this.initializeData();
  }

  private initializeData(): void {
    if (!this.storageService.exists(this.STORAGE_KEY)) {
      // Convertir les données par défaut en instances de Machine
      const machines = defaultMachinesData.map(data => 
        Machine.create({
          nom: data.nom,
          type: data.type,
          capacite: data.capacite,
          status: data.status,
          utilisation: data.utilisation,
          derniereRevision: data.derniereRevision,
          prochaineMaintenance: data.prochaineMaintenance,
          id: data.id,
          clone: function (updates?: Partial<Omit<Machine, 'id'>>): Machine {
            throw new Error('Function not implemented.');
          },
          updateStatus: function (newStatus: 'active' | 'panne' | 'maintenance'): Machine {
            throw new Error('Function not implemented.');
          },
          isOperational: function (): boolean {
            throw new Error('Function not implemented.');
          },
          needsMaintenance: function (): boolean {
            throw new Error('Function not implemented.');
          },
          getEffectiveCapacity: function (): number {
            throw new Error('Function not implemented.');
          },
          getDaysUntilMaintenance: function (): number {
            throw new Error('Function not implemented.');
          },
          validate: function (): string[] {
            throw new Error('Function not implemented.');
          },
          isValid: function (): boolean {
            throw new Error('Function not implemented.');
          },
          toJSON: function () {
            throw new Error('Function not implemented.');
          }
        })
      );
      this.storageService.set(this.STORAGE_KEY, machines);
    }
  }

  private async getMachinesFromStorage(): Promise<Machine[]> {
    try {
      const data = this.storageService.get<any[]>(this.STORAGE_KEY) || [];
      return data.map(item => {
        // Reconstituer les instances de Machine à partir des données stockées
        if (item instanceof Machine) {
          return item;
        }
        // Si c'est un objet plain, créer une nouvelle instance Machine
        return Machine.create({
          nom: item.nom,
          type: item.type,
          capacite: item.capacite,
          status: item.status,
          utilisation: item.utilisation,
          derniereRevision: item.derniereRevision,
          prochaineMaintenance: item.prochaineMaintenance,
          id: item.id,
          clone: function (updates?: Partial<Omit<Machine, 'id'>>): Machine {
            throw new Error('Function not implemented.');
          },
          updateStatus: function (newStatus: 'active' | 'panne' | 'maintenance'): Machine {
            throw new Error('Function not implemented.');
          },
          isOperational: function (): boolean {
            throw new Error('Function not implemented.');
          },
          needsMaintenance: function (): boolean {
            throw new Error('Function not implemented.');
          },
          getEffectiveCapacity: function (): number {
            throw new Error('Function not implemented.');
          },
          getDaysUntilMaintenance: function (): number {
            throw new Error('Function not implemented.');
          },
          validate: function (): string[] {
            throw new Error('Function not implemented.');
          },
          isValid: function (): boolean {
            throw new Error('Function not implemented.');
          },
          toJSON: function () {
            throw new Error('Function not implemented.');
          }
        });
      });
    } catch (error) {
      console.error('Erreur lors de la lecture des machines:', error);
      return [];
    }
  }

  private async saveMachinesToStorage(machines: Machine[]): Promise<void> {
    try {
      // Convertir les instances Machine en objets sérialisables
      const serializableMachines = machines.map(machine => ({
        id: machine.id,
        nom: machine.nom,
        type: machine.type,
        capacite: machine.capacite,
        status: machine.status,
        utilisation: machine.utilisation,
        derniereRevision: machine.derniereRevision,
        prochaineMaintenance: machine.prochaineMaintenance
      }));
      
      this.storageService.set(this.STORAGE_KEY, serializableMachines);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des machines:', error);
      throw new Error('Impossible de sauvegarder les machines');
    }
  }

  async findAll(): Promise<Machine[]> {
    return await this.getMachinesFromStorage();
  }

  async findById(id: number): Promise<Machine | null> {
    try {
      const machines = await this.getMachinesFromStorage();
      return machines.find(machine => machine.id === id) || null;
    } catch (error) {
      console.error('Erreur lors de la recherche par ID:', error);
      return null;
    }
  }

  async save(machine: Machine): Promise<Machine> {
    try {
      const machines = await this.getMachinesFromStorage();
      
      // Générer un nouvel ID si nécessaire
      let newId = machine.id;
      if (!newId || newId === 0) {
        const existingIds = machines.map(m => m.id);
        newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
      }
      
      // Vérifier si l'ID existe déjà
      const existingIndex = machines.findIndex(m => m.id === newId);
      if (existingIndex !== -1) {
        throw new Error(`Machine with id ${newId} already exists`);
      }

      // Créer la nouvelle machine avec l'ID correct
      const newMachine = Machine.create({
        nom: machine.nom,
        type: machine.type,
        capacite: machine.capacite,
        status: machine.status,
        utilisation: machine.utilisation,
        derniereRevision: machine.derniereRevision,
        prochaineMaintenance: machine.prochaineMaintenance,
        id: newId,
        clone: function (updates?: Partial<Omit<Machine, 'id'>>): Machine {
          throw new Error('Function not implemented.');
        },
        updateStatus: function (newStatus: 'active' | 'panne' | 'maintenance'): Machine {
          throw new Error('Function not implemented.');
        },
        isOperational: function (): boolean {
          throw new Error('Function not implemented.');
        },
        needsMaintenance: function (): boolean {
          throw new Error('Function not implemented.');
        },
        getEffectiveCapacity: function (): number {
          throw new Error('Function not implemented.');
        },
        getDaysUntilMaintenance: function (): number {
          throw new Error('Function not implemented.');
        },
        validate: function (): string[] {
          throw new Error('Function not implemented.');
        },
        isValid: function (): boolean {
          throw new Error('Function not implemented.');
        },
        toJSON: function () {
          throw new Error('Function not implemented.');
        }
      });

      machines.push(newMachine);
      await this.saveMachinesToStorage(machines);
      return newMachine;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }
  }

  async update(id: number, updateData: Partial<Machine>): Promise<Machine | null> {
    try {
      const machines = await this.getMachinesFromStorage();
      const machineIndex = machines.findIndex(machine => machine.id === id);
      
      if (machineIndex === -1) {
        return null;
      }

      // Créer la machine mise à jour en conservant l'ID
      const currentMachine = machines[machineIndex];
      const updatedMachine = Machine.create({
        nom: updateData.nom ?? currentMachine.nom,
        type: updateData.type ?? currentMachine.type,
        capacite: updateData.capacite ?? currentMachine.capacite,
        status: updateData.status ?? currentMachine.status,
        utilisation: updateData.utilisation ?? currentMachine.utilisation,
        derniereRevision: updateData.derniereRevision ?? currentMachine.derniereRevision,
        prochaineMaintenance: updateData.prochaineMaintenance ?? currentMachine.prochaineMaintenance,
        id: id,
        clone: function (updates?: Partial<Omit<Machine, 'id'>>): Machine {
          throw new Error('Function not implemented.');
        },
        updateStatus: function (newStatus: 'active' | 'panne' | 'maintenance'): Machine {
          throw new Error('Function not implemented.');
        },
        isOperational: function (): boolean {
          throw new Error('Function not implemented.');
        },
        needsMaintenance: function (): boolean {
          throw new Error('Function not implemented.');
        },
        getEffectiveCapacity: function (): number {
          throw new Error('Function not implemented.');
        },
        getDaysUntilMaintenance: function (): number {
          throw new Error('Function not implemented.');
        },
        validate: function (): string[] {
          throw new Error('Function not implemented.');
        },
        isValid: function (): boolean {
          throw new Error('Function not implemented.');
        },
        toJSON: function () {
          throw new Error('Function not implemented.');
        }
      });
      
      machines[machineIndex] = updatedMachine;
      await this.saveMachinesToStorage(machines);
      return updatedMachine;
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const machines = await this.getMachinesFromStorage();
      const initialLength = machines.length;
      const filteredMachines = machines.filter(machine => machine.id !== id);
      
      if (filteredMachines.length === initialLength) {
        return false; // Aucune machine supprimée
      }

      await this.saveMachinesToStorage(filteredMachines);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      return false;
    }
  }

  async findByStatus(status: "active" | "panne" | "maintenance"): Promise<Machine[]> {
    try {
      const machines = await this.getMachinesFromStorage();
      return machines.filter(machine => machine.status === status);
    } catch (error) {
      console.error('Erreur lors de la recherche par statut:', error);
      return [];
    }
  }

  async findByType(type: string): Promise<Machine[]> {
    try {
      const machines = await this.getMachinesFromStorage();
      return machines.filter(machine => 
        machine.type.toLowerCase().includes(type.toLowerCase())
      );
    } catch (error) {
      console.error('Erreur lors de la recherche par type:', error);
      return [];
    }
  }

  async count(): Promise<number> {
    try {
      const machines = await this.getMachinesFromStorage();
      return machines.length;
    } catch (error) {
      console.error('Erreur lors du comptage:', error);
      return 0;
    }
  }

  async exists(id: number): Promise<boolean> {
    try {
      const machine = await this.findById(id);
      return machine !== null;
    } catch (error) {
      console.error('Erreur lors de la vérification d\'existence:', error);
      return false;
    }
  }

  // Méthodes utilitaires pour le debugging et la maintenance
  async clearAll(): Promise<void> {
    try {
      this.storageService.remove(this.STORAGE_KEY);
    } catch (error) {
      console.error('Erreur lors de la suppression de toutes les machines:', error);
    }
  }

  async resetToDefault(): Promise<void> {
    try {
      this.storageService.remove(this.STORAGE_KEY);
      this.initializeData();
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
    }
  }

  async exportData(): Promise<string> {
    try {
      const machines = await this.getMachinesFromStorage();
      return JSON.stringify(machines.map(m => ({
        id: m.id,
        nom: m.nom,
        type: m.type,
        capacite: m.capacite,
        status: m.status,
        utilisation: m.utilisation,
        derniereRevision: m.derniereRevision,
        prochaineMaintenance: m.prochaineMaintenance
      })), null, 2);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      return '[]';
    }
  }

  async importData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      if (!Array.isArray(data)) {
        throw new Error('Les données importées doivent être un tableau');
      }

      const machines = data.map(item => Machine.create(item));
      await this.saveMachinesToStorage(machines);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      return false;
    }
  }

  // Méthode pour obtenir des statistiques du repository
  async getRepositoryStats(): Promise<{
    totalMachines: number;
    machinesByStatus: Record<string, number>;
    machinesByType: Record<string, number>;
    averageUtilisation: number;
    totalCapacity: number;
  }> {
    try {
      const machines = await this.getMachinesFromStorage();
      
      const machinesByStatus = machines.reduce((acc, machine) => {
        acc[machine.status] = (acc[machine.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const machinesByType = machines.reduce((acc, machine) => {
        acc[machine.type] = (acc[machine.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const averageUtilisation = machines.length > 0
        ? machines.reduce((acc, machine) => acc + machine.utilisation, 0) / machines.length
        : 0;

      const totalCapacity = machines.reduce((acc, machine) => acc + machine.capacite, 0);

      return {
        totalMachines: machines.length,
        machinesByStatus,
        machinesByType,
        averageUtilisation,
        totalCapacity
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return {
        totalMachines: 0,
        machinesByStatus: {},
        machinesByType: {},
        averageUtilisation: 0,
        totalCapacity: 0
      };
    }
  }
}