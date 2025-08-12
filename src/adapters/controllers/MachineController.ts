import { Machine } from '@/core/entities/Machines';
import { CreateMachine } from '../../core/usecases/machines/CreateMachine';
import { GetMachines } from '../../core/usecases/machines/GetMachines';
import { UpdateMachine } from '../../core/usecases/machines/UpdateMachine';
import { DeleteMachine } from '../../core/usecases/machines/DeleteMachine';
import { IMachineRepository } from '../../core/interfaces/repositories/IMachineRepository';

export class MachineController {
  private createMachine: CreateMachine;
  private getMachines: GetMachines;
  private updateMachine: UpdateMachine;
  private deleteMachine: DeleteMachine;

  constructor(machineRepository: IMachineRepository) {
    this.createMachine = new CreateMachine(machineRepository);
    this.getMachines = new GetMachines(machineRepository);
    this.updateMachine = new UpdateMachine(machineRepository);
    this.deleteMachine = new DeleteMachine(machineRepository);
  }

  async getAllMachines(): Promise<Machine[]> {
    return await this.getMachines.execute();
  }

  async getMachineById(id: number): Promise<Machine | null> {
    return await this.getMachines.byId(id);
  }

  async getMachinesByStatus(status: "active" | "panne" | "maintenance"): Promise<Machine[]> {
    return await this.getMachines.byStatus(status);
  }

  async createNewMachine(data: Omit<Machine, 'id'>): Promise<Machine> {
    return await this.createMachine.execute(data);
  }

  async updateExistingMachine(id: number, data: Partial<Machine>): Promise<Machine> {
    return await this.updateMachine.execute(id, data);
  }

  async toggleMachineStatus(id: number): Promise<Machine> {
    return await this.updateMachine.toggleStatus(id);
  }

  async deleteMachineById(id: number): Promise<void> {
    return await this.deleteMachine.execute(id);
  }
}