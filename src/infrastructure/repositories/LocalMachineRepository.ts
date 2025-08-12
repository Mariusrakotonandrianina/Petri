import { Machine } from '@/core/entities/Machines';
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
      const machines = defaultMachinesData.map(data => Machine.create(data));
      this.storageService.set(this.STORAGE_KEY, machines);
    }
  }

  private async getMachinesFromStorage(): Promise<Machine[]> {
    const data = this.storageService.get<any[]>(this.STORAGE_KEY) || [];
    return data.map(item => Machine.create(item));
  }

  private async saveMachinesToStorage(machines: Machine[]): Promise<void> {
    this.storageService.set(this.STORAGE_KEY, machines);
  }

  async findAll(): Promise<Machine[]> {
    return await this.getMachinesFromStorage();
  }

  async findById(id: number): Promise<Machine | null> {
    const machines = await this.getMachinesFromStorage();
    return machines.find(machine => machine.id === id) || null;
  }

  async save(machine: Machine): Promise<Machine> {
    const machines = await this.getMachinesFromStorage();
    
    // Vérifier si l'ID existe déjà
    const existingIndex = machines.findIndex(m => m.id === machine.id);
    if (existingIndex !== -1) {
      throw new Error(`Machine with id ${machine.id} already exists`);
    }

    machines.push(machine);
    await this.saveMachinesToStorage(machines);
    return machine;
  }

  async update(id: number, updateData: Partial<Machine>): Promise<Machine | null> {
    const machines = await this.getMachinesFromStorage();
    const machineIndex = machines.findIndex(machine => machine.id === id);
    
    if (machineIndex === -1) {
      return null;
    }

    // Mettre à jour la machine
    const updatedMachine = { ...machines[machineIndex], ...updateData };
    machines[machineIndex] = Machine.create(updatedMachine);
    
    await this.saveMachinesToStorage(machines);
    return machines[machineIndex];
  }

  async delete(id: number): Promise<boolean> {
    const machines = await this.getMachinesFromStorage();
    const initialLength = machines.length;
    const filteredMachines = machines.filter(machine => machine.id !== id);
    
    if (filteredMachines.length === initialLength) {
      return false; // Aucune machine supprimée
    }

    await this.saveMachinesToStorage(filteredMachines);
    return true;
  }

  async findByStatus(status: "active" | "panne" | "maintenance"): Promise<Machine[]> {
    const machines = await this.getMachinesFromStorage();
    return machines.filter(machine => machine.status === status);
  }
}