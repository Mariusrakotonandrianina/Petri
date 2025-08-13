import { Machine } from '../../core/entities/Machines';
import { CreateMachine } from '../../core/usecases/machines/CreateMachine';
import { GetMachines, MachineFilters, MachineStats } from '../../core/usecases/machines/GetMachines';
import { UpdateMachine } from '../../core/usecases/machines/UpdateMachine';
import { DeleteMachine } from '../../core/usecases/machines/DeleteMachine';
import { IMachineRepository } from '../../core/interfaces/repositories/IMachineRepository';
import { getErrorMessage, isAppError } from '../../core/types/errors';

export interface MachineControllerResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export class MachineController {
  private createMachine: CreateMachine;
  private getMachines: GetMachines;
  private updateMachine: UpdateMachine;
  private deleteMachine: DeleteMachine;

  constructor(machineRepository: IMachineRepository) {
    this.createMachine = new CreateMachine(machineRepository);
    this.getMachines = new GetMachines(machineRepository);
    this.updateMachine = new UpdateMachine(machineRepository);
    this.deleteMachine = new DeleteMachine(machineRepository);
  }

  async getAllMachines(): Promise<MachineControllerResponse<Machine[]>> {
    try {
      const machines = await this.getMachines.execute();
      return {
        success: true,
        data: machines
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
        code: isAppError(error) ? error.code : 'UNKNOWN_ERROR'
      };
    }
  }

  async getMachineById(id: number): Promise<MachineControllerResponse<Machine | null>> {
    try {
      const machine = await this.getMachines.byId(id);
      return {
        success: true,
        data: machine
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
        code: isAppError(error) ? error.code : 'UNKNOWN_ERROR'
      };
    }
  }

  async getMachinesByStatus(status: "active" | "panne" | "maintenance"): Promise<MachineControllerResponse<Machine[]>> {
    try {
      const machines = await this.getMachines.byStatus(status);
      return {
        success: true,
        data: machines
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
        code: isAppError(error) ? error.code : 'UNKNOWN_ERROR'
      };
    }
  }

  async getMachinesByType(type: string): Promise<MachineControllerResponse<Machine[]>> {
    try {
      const machines = await this.getMachines.byType(type);
      return {
        success: true,
        data: machines
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
        code: isAppError(error) ? error.code : 'UNKNOWN_ERROR'
      };
    }
  }

  async getMachinesWithFilters(filters: MachineFilters): Promise<MachineControllerResponse<Machine[]>> {
    try {
      const machines = await this.getMachines.withFilters(filters);
      return {
        success: true,
        data: machines
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
        code: isAppError(error) ? error.code : 'UNKNOWN_ERROR'
      };
    }
  }

  async getMachineStats(): Promise<MachineControllerResponse<MachineStats>> {
    try {
      const stats = await this.getMachines.getStats();
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
        code: isAppError(error) ? error.code : 'UNKNOWN_ERROR'
      };
    }
  }

  async getAvailableTypes(): Promise<MachineControllerResponse<string[]>> {
    try {
      const types = await this.getMachines.getAvailableTypes();
      return {
        success: true,
        data: types
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
        code: isAppError(error) ? error.code : 'UNKNOWN_ERROR'
      };
    }
  }

  async getMachinesNeedingMaintenance(): Promise<MachineControllerResponse<Machine[]>> {
    try {
      const machines = await this.getMachines.getMachinesNeedingMaintenance();
      return {
        success: true,
        data: machines
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
        code: isAppError(error) ? error.code : 'UNKNOWN_ERROR'
      };
    }
  }

  async getMachinesNearMaintenance(days: number = 7): Promise<MachineControllerResponse<Machine[]>> {
    try {
      const machines = await this.getMachines.getMachinesNearMaintenance(days);
      return {
        success: true,
        data: machines
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
        code: isAppError(error) ? error.code : 'UNKNOWN_ERROR'
      };
    }
  }

  async createNewMachine(data: Omit<Machine, 'id'>): Promise<MachineControllerResponse<Machine>> {
    try {
      const machine = await this.createMachine.execute(data);
      return {
        success: true,
        data: machine
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
        code: isAppError(error) ? error.code : 'UNKNOWN_ERROR'
      };
    }
  }

  async updateExistingMachine(id: number, data: Partial<Machine>): Promise<MachineControllerResponse<Machine>> {
    try {
      const machine = await this.updateMachine.execute(id, data);
      return {
        success: true,
        data: machine
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
        code: isAppError(error) ? error.code : 'UNKNOWN_ERROR'
      };
    }
  }

  async toggleMachineStatus(id: number): Promise<MachineControllerResponse<Machine>> {
    try {
      const machine = await this.updateMachine.toggleStatus(id);
      return {
        success: true,
        data: machine
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
        code: isAppError(error) ? error.code : 'UNKNOWN_ERROR'
      };
    }
  }

  async updateMachineUtilisation(id: number, utilisation: number): Promise<MachineControllerResponse<Machine>> {
    try {
      const machine = await this.updateMachine.updateUtilisation(id, utilisation);
      return {
        success: true,
        data: machine
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
        code: isAppError(error) ? error.code : 'UNKNOWN_ERROR'
      };
    }
  }

  async scheduleMaintenance(id: number, maintenanceDate: string): Promise<MachineControllerResponse<Machine>> {
    try {
      const machine = await this.updateMachine.scheduleMaintenance(id, maintenanceDate);
      return {
        success: true,
        data: machine
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
        code: isAppError(error) ? error.code : 'UNKNOWN_ERROR'
      };
    }
  }

  async deleteMachineById(id: number): Promise<MachineControllerResponse<void>> {
    try {
      await this.deleteMachine.execute(id);
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
        code: isAppError(error) ? error.code : 'UNKNOWN_ERROR'
      };
    }
  }

  async canDeleteMachine(id: number): Promise<MachineControllerResponse<{ canDelete: boolean; reason?: string }>> {
    try {
      const result = await this.deleteMachine.canDelete(id);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
        code: isAppError(error) ? error.code : 'UNKNOWN_ERROR'
      };
    }
  }

  async forceDeleteMachine(id: number): Promise<MachineControllerResponse<void>> {
    try {
      await this.deleteMachine.forceDelete(id);
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
        code: isAppError(error) ? error.code : 'UNKNOWN_ERROR'
      };
    }
  }

  async machineExists(id: number): Promise<MachineControllerResponse<boolean>> {
    try {
      const exists = await this.getMachines.exists(id);
      return {
        success: true,
        data: exists
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
        code: isAppError(error) ? error.code : 'UNKNOWN_ERROR'
      };
    }
  }

  async countMachines(): Promise<MachineControllerResponse<number>> {
    try {
      const count = await this.getMachines.count();
      return {
        success: true,
        data: count
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
        code: isAppError(error) ? error.code : 'UNKNOWN_ERROR'
      };
    }
  }

  // Méthodes utilitaires pour l'interface utilisateur
  async searchMachines(searchTerm: string): Promise<MachineControllerResponse<Machine[]>> {
    try {
      const machines = await this.getMachines.withFilters({ searchTerm });
      return {
        success: true,
        data: machines
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
        code: isAppError(error) ? error.code : 'UNKNOWN_ERROR'
      };
    }
  }

  async getMaintenanceAlerts(): Promise<MachineControllerResponse<{
    urgent: Machine[];
    upcoming: Machine[];
  }>> {
    try {
      const [urgent, upcoming] = await Promise.all([
        this.getMachines.getMachinesNeedingMaintenance(),
        this.getMachines.getMachinesNearMaintenance(7)
      ]);

      return {
        success: true,
        data: {
          urgent,
          upcoming: upcoming.filter(m => !urgent.some(u => u.id === m.id))
        }
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
        code: isAppError(error) ? error.code : 'UNKNOWN_ERROR'
      };
    }
  }
}