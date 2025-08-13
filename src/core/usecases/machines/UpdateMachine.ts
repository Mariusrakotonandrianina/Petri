// src/core/usecases/machines/UpdateMachine.ts - Version corrigée sans erreurs
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
    // CORRECTION: On doit exclure l'ID et passer les données correctement à Machine.create
    const updatedData = {
      nom: data.nom ?? existingMachine.nom,
      type: data.type ?? existingMachine.type,
      capacite: data.capacite ?? existingMachine.capacite,
      status: data.status ?? existingMachine.status,
      utilisation: data.utilisation ?? existingMachine.utilisation,
      derniereRevision: data.derniereRevision ?? existingMachine.derniereRevision,
      prochaineMaintenance: data.prochaineMaintenance ?? existingMachine.prochaineMaintenance
    };

    // Créer une machine temporaire pour validation avec l'ID existant
    const tempMachine = Machine.create({
      ...updatedData, id,
      clone: function (updates?: Partial<Omit<Machine, 'id'>>): Machine {
        throw new Error('Function not implemented.');
      },
      updateStatus: function (newStatus: 'active' | 'panne' | 'maintenance'): Machine {
        throw new Error('Function not implemented.');
      },
      isOperational: function (): boolean {
        throw new Error('Function not implemented.');
      },
      needsMaintenance: function (): boolean {
        throw new Error('Function not implemented.');
      },
      getEffectiveCapacity: function (): number {
        throw new Error('Function not implemented.');
      },
      getDaysUntilMaintenance: function (): number {
        throw new Error('Function not implemented.');
      },
      validate: function (): string[] {
        throw new Error('Function not implemented.');
      },
      isValid: function (): boolean {
        throw new Error('Function not implemented.');
      },
      toJSON: function () {
        throw new Error('Function not implemented.');
      }
    });
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

    // Règles métier pour les changements de statut
    const finalData = { ...data };
    
    if (data.status && data.status !== existingMachine.status) {
      // Si on passe en maintenance ou en panne, mettre l'utilisation à 0
      if ((data.status === 'maintenance' || data.status === 'panne') && !data.hasOwnProperty('utilisation')) {
        finalData.utilisation = 0;
      }
      
      // Si on remet en service et que l'utilisation est 0, la remettre à une valeur par défaut
      if (data.status === 'active' && existingMachine.utilisation === 0 && !data.hasOwnProperty('utilisation')) {
        finalData.utilisation = 50; // Valeur par défaut
      }
    }

    // Valider les règles métier spécifiques
    if (finalData.utilisation !== undefined) {
      const targetStatus = finalData.status ?? existingMachine.status;
      
      // Une machine en maintenance ou en panne ne peut pas avoir d'utilisation > 0
      if (finalData.utilisation > 0 && (targetStatus === 'maintenance' || targetStatus === 'panne')) {
        throw new ValidationError(`Impossible de définir une utilisation > 0% pour une machine en ${targetStatus}`);
      }
    }

    const updatedMachine = await this.machineRepository.update(id, finalData);
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
        newUtilisation = 50;
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

    const machine = await this.machineRepository.findById(id);
    if (!machine) {
      throw new NotFoundError('Machine', id);
    }

    // Vérifier que la machine peut avoir une utilisation > 0
    if (utilisation > 0 && (machine.status === 'maintenance' || machine.status === 'panne')) {
      throw new ValidationError(`Impossible de définir une utilisation > 0% pour une machine en ${machine.status}`);
    }

    return await this.execute(id, { utilisation });
  }

  async scheduleMaintenance(id: number, maintenanceDate: string): Promise<Machine> {
    const machine = await this.machineRepository.findById(id);
    if (!machine) {
      throw new NotFoundError('Machine', id);
    }

    // Validation de la date
    const newMaintenanceDate = new Date(maintenanceDate);
    const lastRevisionDate = new Date(machine.derniereRevision);
    
    if (isNaN(newMaintenanceDate.getTime())) {
      throw new ValidationError('Date de maintenance invalide');
    }

    if (isNaN(lastRevisionDate.getTime())) {
      throw new ValidationError('Date de dernière révision invalide');
    }

    if (newMaintenanceDate <= lastRevisionDate) {
      throw new ValidationError('La date de maintenance doit être après la dernière révision');
    }

    // Si la maintenance est prévue aujourd'hui ou dans le passé, changer le statut
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
    newMaintenanceDate.setHours(0, 0, 0, 0);
    
    const shouldChangeStatus = newMaintenanceDate <= today && machine.status === 'active';

    const updateData: Partial<Machine> = { 
      prochaineMaintenance: maintenanceDate
    };

    if (shouldChangeStatus) {
      updateData.status = 'maintenance';
      updateData.utilisation = 0;
    }

    return await this.execute(id, updateData);
  }

  async performMaintenance(id: number): Promise<Machine> {
    const machine = await this.machineRepository.findById(id);
    if (!machine) {
      throw new NotFoundError('Machine', id);
    }

    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3); // Prochaine maintenance dans 3 mois
    const nextMaintenanceDate = futureDate.toISOString().split('T')[0];

    return await this.execute(id, {
      status: 'active',
      utilisation: 50, // Valeur par défaut après maintenance
      derniereRevision: today,
      prochaineMaintenance: nextMaintenanceDate
    });
  }

  async setMachineStatus(id: number, status: "active" | "panne" | "maintenance"): Promise<Machine> {
    const machine = await this.machineRepository.findById(id);
    if (!machine) {
      throw new NotFoundError('Machine', id);
    }

    const updateData: Partial<Machine> = { status };

    // Règles métier pour chaque statut
    switch (status) {
      case 'maintenance':
      case 'panne':
        updateData.utilisation = 0;
        break;
      case 'active':
        // Si la machine était en panne/maintenance avec utilisation 0, remettre une valeur par défaut
        if (machine.utilisation === 0) {
          updateData.utilisation = 50;
        }
        break;
    }

    return await this.execute(id, updateData);
  }

  async updateCapacity(id: number, capacite: number): Promise<Machine> {
    if (capacite <= 0) {
      throw new ValidationError('La capacité doit être supérieure à 0');
    }

    if (capacite > 1000) {
      throw new ValidationError('La capacité ne peut pas dépasser 1000 unités/h');
    }

    return await this.execute(id, { capacite });
  }

  async updateMaintenanceDates(id: number, derniereRevision: string, prochaineMaintenance: string): Promise<Machine> {
    const revisionDate = new Date(derniereRevision);
    const maintenanceDate = new Date(prochaineMaintenance);

    if (isNaN(revisionDate.getTime()) || isNaN(maintenanceDate.getTime())) {
      throw new ValidationError('Dates invalides');
    }

    if (maintenanceDate <= revisionDate) {
      throw new ValidationError('La prochaine maintenance doit être après la dernière révision');
    }

    return await this.execute(id, { 
      derniereRevision, 
      prochaineMaintenance 
    });
  }
}