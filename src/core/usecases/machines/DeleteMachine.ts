import { IMachineRepository } from '../../interfaces/repositories/IMachineRepository';
import { NotFoundError } from '../../types/errors';

export class DeleteMachine {
  constructor(private machineRepository: IMachineRepository) {}

  async execute(id: number): Promise<void> {
    const existingMachine = await this.machineRepository.findById(id);
    if (!existingMachine) {
      throw new NotFoundError('Machine', id);
    }

    const deleted = await this.machineRepository.delete(id);
    if (!deleted) {
      throw new Error('Erreur lors de la suppression de la machine');
    }
  }
}