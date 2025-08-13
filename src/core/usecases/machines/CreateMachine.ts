import { Machine } from '../../entities/Machines';
import { IMachineRepository } from '../../interfaces/repositories/IMachineRepository';

export class CreateMachine {
  constructor(private machineRepository: IMachineRepository) {}

  async execute(data: Omit<Machine, 'id'>): Promise<Machine> {
    // Validation des données
    if (!data.nom || !data.type) {
      throw new Error('Le nom et le type sont requis');
    }
    
    if (data.capacite <= 0) {
      throw new Error('La capacité doit être positive');
    }

    if (data.utilisation < 0 || data.utilisation > 100) {
      throw new Error('L\'utilisation doit être entre 0 et 100%');
    }

    const machine = Machine.create({
      ...data,
      id: Date.now() + Math.random() // ID unique
    });

    return await this.machineRepository.save(machine);
  }
}