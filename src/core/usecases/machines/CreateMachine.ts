import { Machine } from '@/core/entities/Machines';
import { IMachineRepository } from '../../interfaces/repositories/IMachineRepository';
import { ValidationError } from '../../types/errors';

export class CreateMachine {
  constructor(private machineRepository: IMachineRepository) {}

  async execute(data: Omit<Machine, 'id'>): Promise<Machine> {
    this.validate(data);
    
    const machine = Machine.create(data);
    return await this.machineRepository.save(machine);
  }

  private validate(data: Omit<Machine, 'id'>): void {
    if (!data.nom?.trim()) {
      throw new ValidationError('Le nom de la machine est requis');
    }
    if (!data.type?.trim()) {
      throw new ValidationError('Le type de la machine est requis');
    }
    if (data.capacite <= 0) {
      throw new ValidationError('La capacité doit être supérieure à 0');
    }
    if (data.utilisation < 0 || data.utilisation > 100) {
      throw new ValidationError('L\'utilisation doit être entre 0 et 100%');
    }
  }
}