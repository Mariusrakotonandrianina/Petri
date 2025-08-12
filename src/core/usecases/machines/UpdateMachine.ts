import { Machine } from '@/core/entities/Machines';
import { IMachineRepository } from '../../interfaces/repositories/IMachineRepository';
import { NotFoundError, ValidationError } from '../../types/errors';

export class UpdateMachine {
  constructor(private machineRepository: IMachineRepository) {}

  async execute(id: number, data: Partial<Machine>): Promise<Machine> {
    const existingMachine = await this.machineRepository.findById(id);
    if (!existingMachine) {
      throw new NotFoundError('Machine', id);
    }

    this.validate(data);
    
    const updatedMachine = await this.machineRepository.update(id, data);
    if (!updatedMachine) {
      throw new NotFoundError('Machine', id);
    }

    return updatedMachine;
  }

  async toggleStatus(id: number): Promise<Machine> {
    const machine = await this.machineRepository.findById(id);
    if (!machine) {
      throw new NotFoundError('Machine', id);
    }

    const newStatus = this.getNextStatus(machine.status);
    return await this.execute(id, { status: newStatus });
  }

  private validate(data: Partial<Machine>): void {
    if (data.nom !== undefined && !data.nom?.trim()) {
      throw new ValidationError('Le nom de la machine est requis');
    }
    if (data.capacite !== undefined && data.capacite <= 0) {
      throw new ValidationError('La capacité doit être supérieure à 0');
    }
    if (data.utilisation !== undefined && (data.utilisation < 0 || data.utilisation > 100)) {
      throw new ValidationError('L\'utilisation doit être entre 0 et 100%');
    }
  }

  private getNextStatus(currentStatus: "active" | "panne" | "maintenance"): "active" | "panne" | "maintenance" {
    switch (currentStatus) {
      case 'active': return 'maintenance';
      case 'panne': return 'active';
      case 'maintenance': return 'active';
      default: return 'active';
    }
  }
}