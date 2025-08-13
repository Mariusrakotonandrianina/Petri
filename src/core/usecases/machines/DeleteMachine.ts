import { IMachineRepository } from '../../interfaces/repositories/IMachineRepository';
import { NotFoundError, ConflictError } from '../../types/errors';

export class DeleteMachine {
  constructor(private machineRepository: IMachineRepository) {}

  async execute(id: number): Promise<void> {
    const machine = await this.machineRepository.findById(id);
    if (!machine) {
      throw new NotFoundError('Machine', id);
    }

    // Règles métier pour la suppression
    if (machine.status === "active") {
      throw new ConflictError('Impossible de supprimer une machine active. Mettez-la d\'abord en maintenance ou en panne.');
    }

    // Vérification supplémentaire : ne pas supprimer si maintenance imminente
    if (machine.needsMaintenance() && machine.status === "maintenance") {
      throw new ConflictError('Impossible de supprimer une machine en cours de maintenance');
    }

    const deleted = await this.machineRepository.delete(id);
    if (!deleted) {
      throw new Error('Erreur lors de la suppression de la machine');
    }
  }

  async canDelete(id: number): Promise<{ canDelete: boolean; reason?: string }> {
    const machine = await this.machineRepository.findById(id);
    if (!machine) {
      return { canDelete: false, reason: 'Machine non trouvée' };
    }

    if (machine.status === "active") {
      return { 
        canDelete: false, 
        reason: 'Machine active - arrêtez-la d\'abord' 
      };
    }

    if (machine.needsMaintenance() && machine.status === "maintenance") {
      return { 
        canDelete: false, 
        reason: 'Machine en cours de maintenance' 
      };
    }

    return { canDelete: true };
  }

  async forceDelete(id: number): Promise<void> {
    const machine = await this.machineRepository.findById(id);
    if (!machine) {
      throw new NotFoundError('Machine', id);
    }

    const deleted = await this.machineRepository.delete(id);
    if (!deleted) {
      throw new Error('Erreur lors de la suppression forcée de la machine');
    }
  }
}