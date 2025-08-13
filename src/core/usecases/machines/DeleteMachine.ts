import { IMachineRepository } from '../../interfaces/repositories/IMachineRepository';

export class DeleteMachine {
  constructor(private machineRepository: IMachineRepository) {}

  async execute(id: number): Promise<void> {
    const machine = await this.machineRepository.findById(id);
    if (!machine) {
      throw new Error('Machine non trouvée');
    }

    if (machine.status === "active") {
      throw new Error('Impossible de supprimer une machine active');
    }

    const deleted = await this.machineRepository.delete(id);
    if (!deleted) {
      throw new Error('Erreur lors de la suppression');
    }
  }
}