// src/core/usecases/machines/CreateMachine.ts - Version corrigée
import { Machine } from '../../entities/Machines';
import { IMachineRepository } from '../../interfaces/repositories/IMachineRepository';
import { ValidationError } from '../../types/errors';

export class CreateMachine {
  constructor(private machineRepository: IMachineRepository) {}

  async execute(data: Omit<Machine, 'id'>): Promise<Machine> {
    // Créer une instance temporaire pour validation
    const tempMachine = Machine.create({ ...data, id: 0 });
    const validationErrors = tempMachine.validate();
    
    if (validationErrors.length > 0) {
      throw new ValidationError(validationErrors.join(', '));
    }

    // Vérifier l'unicité du nom
    const existingMachines = await this.machineRepository.findAll();
    const nameExists = existingMachines.some(m => 
      m.nom.toLowerCase().trim() === data.nom.toLowerCase().trim()
    );
    
    if (nameExists) {
      throw new ValidationError('Une machine avec ce nom existe déjà');
    }

    // Créer la machine avec un ID unique basé sur le timestamp et un nombre aléatoire
    const machine = Machine.create({
      ...data,
      id: undefined // Laisser le repository gérer l'ID
    });

    return await this.machineRepository.save(machine);
  }
}