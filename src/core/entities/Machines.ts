export class Machine {
    constructor(
      public readonly id: number,
      public nom: string,
      public type: string,
      public capacite: number,
      public status: "active" | "panne" | "maintenance",
      public utilisation: number,
      public derniereRevision: string,
      public prochaineMaintenance: string
    ) {}
  
    static create(data: Omit<Machine, 'id'> & { id?: number }): Machine {
      return new Machine(
        data.id || Date.now(),
        data.nom,
        data.type,
        data.capacite,
        data.status,
        data.utilisation,
        data.derniereRevision,
        data.prochaineMaintenance
      );
    }
  
    updateStatus(newStatus: "active" | "panne" | "maintenance"): Machine {
      this.status = newStatus;
      this.utilisation = newStatus === "maintenance" ? 0 : this.utilisation;
      return this;
    }
  
    isOperational(): boolean {
      return this.status === "active";
    }
  
    needsMaintenance(): boolean {
      const today = new Date();
      const maintenanceDate = new Date(this.prochaineMaintenance);
      return maintenanceDate <= today;
    }
  }