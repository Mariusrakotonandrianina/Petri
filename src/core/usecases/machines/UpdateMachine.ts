import { Machine } from '../../entities/Machines';
import { IMachineRepository } from '../../interfaces/repositories/IMachineRepository';

export class UpdateMachine {
  constructor(private machineRepository: IMachineRepository) {}

  async execute(id: number, data: Partial<Machine>): Promise<Machine> {
    const existingMachine = await this.machineRepository.findById(id);
    if (!existingMachine) {
      throw new Error('Machine non trouvée');
    }

    // Validation des données
    if (data.capacite !== undefined && data.capacite <= 0) {
      throw new Error('La capacité doit être positive');
    }

    if (data.utilisation !== undefined && (data.utilisation < 0 || data.utilisation > 100)) {
      throw new Error('L\'utilisation doit être entre 0 et 100%');
    }

    const updatedMachine = await this.machineRepository.update(id, data);
    if (!updatedMachine) {
      throw new Error('Erreur lors de la mise à jour');
    }

    return updatedMachine;
  }

  async toggleStatus(id: number): Promise<Machine> {
    const machine = await this.machineRepository.findById(id);
    if (!machine) {
      throw new Error('Machine non trouvée');
    }

    let newStatus: "active" | "panne" | "maintenance";
    switch (machine.status) {
      case "active":
        newStatus = "maintenance";
        break;
      case "maintenance":
        newStatus = "active";
        break;
      case "panne":
        newStatus = "active";
        break;
      default:
        newStatus = "active";
    }

    return await this.execute(id, { 
      status: newStatus,
      utilisation: newStatus === "maintenance" ? 0 : machine.utilisation
    });
  }
}