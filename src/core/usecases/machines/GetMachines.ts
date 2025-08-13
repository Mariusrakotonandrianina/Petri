import { Machine } from '../../entities/Machines';
import { IMachineRepository } from '../../interfaces/repositories/IMachineRepository';
import { NotFoundError } from '../../types/errors';

export interface MachineStats {
  total: number;
  active: number;
  maintenance: number;
  panne: number;
  averageUtilisation: number;
  totalCapacity: number;
  effectiveCapacity: number;
  maintenanceNeeded: number;
}

export interface MachineFilters {
  status?: "active" | "panne" | "maintenance";
  type?: string;
  searchTerm?: string;
  needsMaintenance?: boolean;
  minCapacity?: number;
  maxCapacity?: number;
  minUtilisation?: number;
  maxUtilisation?: number;
}

export class GetMachines {
  constructor(private machineRepository: IMachineRepository) {}

  async execute(): Promise<Machine[]> {
    return await this.machineRepository.findAll();
  }

  async byId(id: number): Promise<Machine | null> {
    return await this.machineRepository.findById(id);
  }

  async findByIdOrThrow(id: number): Promise<Machine> {
    const machine = await this.machineRepository.findById(id);
    if (!machine) {
      throw new NotFoundError('Machine', id);
    }
    return machine;
  }

  async byStatus(status: "active" | "panne" | "maintenance"): Promise<Machine[]> {
    return await this.machineRepository.findByStatus(status);
  }

  async byType(type: string): Promise<Machine[]> {
    return await this.machineRepository.findByType(type);
  }

  async withFilters(filters: MachineFilters): Promise<Machine[]> {
    let machines = await this.machineRepository.findAll();

    // Filtrage par statut
    if (filters.status) {
      machines = machines.filter(m => m.status === filters.status);
    }

    // Filtrage par type
    if (filters.type) {
      machines = machines.filter(m => 
        m.type.toLowerCase().includes(filters.type!.toLowerCase())
      );
    }

    // Recherche textuelle
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      machines = machines.filter(m => 
        m.nom.toLowerCase().includes(term) || 
        m.type.toLowerCase().includes(term)
      );
    }

    // Filtrage par besoin de maintenance
    if (filters.needsMaintenance !== undefined) {
      machines = machines.filter(m => m.needsMaintenance() === filters.needsMaintenance);
    }

    // Filtrage par capacité
    if (filters.minCapacity !== undefined) {
      machines = machines.filter(m => m.capacite >= filters.minCapacity!);
    }
    if (filters.maxCapacity !== undefined) {
      machines = machines.filter(m => m.capacite <= filters.maxCapacity!);
    }

    // Filtrage par utilisation
    if (filters.minUtilisation !== undefined) {
      machines = machines.filter(m => m.utilisation >= filters.minUtilisation!);
    }
    if (filters.maxUtilisation !== undefined) {
      machines = machines.filter(m => m.utilisation <= filters.maxUtilisation!);
    }

    return machines;
  }

  async getStats(): Promise<MachineStats> {
    const machines = await this.machineRepository.findAll();
    
    const stats: MachineStats = {
      total: machines.length,
      active: machines.filter(m => m.status === 'active').length,
      maintenance: machines.filter(m => m.status === 'maintenance').length,
      panne: machines.filter(m => m.status === 'panne').length,
      averageUtilisation: 0,
      totalCapacity: 0,
      effectiveCapacity: 0,
      maintenanceNeeded: machines.filter(m => m.needsMaintenance()).length
    };

    if (machines.length > 0) {
      stats.averageUtilisation = machines.reduce((acc, m) => acc + m.utilisation, 0) / machines.length;
      stats.totalCapacity = machines.reduce((acc, m) => acc + m.capacite, 0);
      stats.effectiveCapacity = machines.reduce((acc, m) => acc + m.getEffectiveCapacity(), 0);
    }

    return stats;
  }

  async getAvailableTypes(): Promise<string[]> {
    const machines = await this.machineRepository.findAll();
    const types = new Set(machines.map(m => m.type));
    return Array.from(types).sort();
  }

  async getMachinesNeedingMaintenance(): Promise<Machine[]> {
    const machines = await this.machineRepository.findAll();
    return machines.filter(m => m.needsMaintenance());
  }

  async getMachinesNearMaintenance(days: number = 7): Promise<Machine[]> {
    const machines = await this.machineRepository.findAll();
    return machines.filter(m => {
      const daysUntil = m.getDaysUntilMaintenance();
      return daysUntil <= days && daysUntil > 0;
    });
  }

  async count(): Promise<number> {
    return await this.machineRepository.count();
  }

  async exists(id: number): Promise<boolean> {
    return await this.machineRepository.exists(id);
  }
}