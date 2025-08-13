import { Machine } from '../../entities/Machines';
import { IMachineRepository } from '../../interfaces/repositories/IMachineRepository';
import { NotFoundError, ValidationError } from '../../types/errors';

export class UpdateMachine {
  constructor(private machineRepository: IMachineRepository) {}

  async execute(id: number, data: Partial<Machine>): Promise<Machine> {
    const existingMachine = await this.machineRepository.findById(id);
    if (!existingMachine) {
      throw new NotFoundError('Machine', id);
    }

    // Créer une machine temporaire avec les nouvelles données pour validation
    const updatedData = { ...existingMachine, ...data };
    const tempMachine = Machine.create(updatedData as unknown as Omit<Machine, 'id'> & { id?: number });
    const validationErrors = tempMachine.validate();
    
    if (validationErrors.length > 0) {
      throw new ValidationError(validationErrors.join(', '));
    }

    // Vérifier l'unicité du nom si le nom est modifié
    if (data.nom && data.nom !== existingMachine.nom) {
      const allMachines = await this.machineRepository.findAll();
      const nameExists = allMachines.some(m => 
        m.id !== id && m.nom.toLowerCase().trim() === data.nom!.toLowerCase().trim()
      );
      
      if (nameExists) {
        throw new ValidationError('Une machine avec ce nom existe déjà');
      }
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
      throw new NotFoundError('Machine', id);
    }

    let newStatus: "active" | "panne" | "maintenance";
    let newUtilisation = machine.utilisation;

    switch (machine.status) {
      case "active":
        newStatus = "maintenance";
        newUtilisation = 0;
        break;
      case "maintenance":
        newStatus = "active";
        newUtilisation = machine.utilisation > 0 ? machine.utilisation : 50; // Valeur par défaut
        break;
      case "panne":
        newStatus = "active";
        newUtilisation = machine.utilisation > 0 ? machine.utilisation : 50; // Valeur par défaut
        break;
      default:
        newStatus = "active";
    }

    return await this.execute(id, { 
      status: newStatus,
      utilisation: newUtilisation
    });
  }

  async updateUtilisation(id: number, utilisation: number): Promise<Machine> {
    if (utilisation < 0 || utilisation > 100) {
      throw new ValidationError('L\'utilisation doit être entre 0 et 100%');
    }

    return await this.execute(id, { utilisation });
  }

  async scheduleMaintenance(id: number, maintenanceDate: string): Promise<Machine> {
    const machine = await this.machineRepository.findById(id);
    if (!machine) {
      throw new NotFoundError('Machine', id);
    }

    const newMaintenanceDate = new Date(maintenanceDate);
    const lastRevisionDate = new Date(machine.derniereRevision);

    if (newMaintenanceDate <= lastRevisionDate) {
      throw new ValidationError('La date de maintenance doit être après la dernière révision');
    }

    return await this.execute(id, { 
      prochaineMaintenance: maintenanceDate,
      status: machine.status === "active" && newMaintenanceDate <= new Date() ? "maintenance" : machine.status
    });
  }
}