import { Machine } from '@/core/entities/Machines';
import { IMachineRepository } from '../../interfaces/repositories/IMachineRepository';

export class GetMachines {
  constructor(private machineRepository: IMachineRepository) {}

  async execute(): Promise<Machine[]> {
    return await this.machineRepository.findAll();
  }

  async byId(id: number): Promise<Machine | null> {
    return await this.machineRepository.findById(id);
  }

  async byStatus(status: "active" | "panne" | "maintenance"): Promise<Machine[]> {
    return await this.machineRepository.findByStatus(status);
  }
}