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
      data.id || Date.now() + Math.random(),
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

  getEffectiveCapacity(): number {
    return Math.round(this.capacite * this.utilisation / 100);
  }

  getDaysUntilMaintenance(): number {
    const today = new Date();
    const maintenanceDate = new Date(this.prochaineMaintenance);
    return Math.ceil((maintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  validate(): string[] {
    const errors: string[] = [];

    if (!this.nom || this.nom.trim().length < 3) {
      errors.push('Le nom doit contenir au moins 3 caractères');
    }

    if (!this.type || this.type.trim().length === 0) {
      errors.push('Le type est requis');
    }

    if (this.capacite <= 0) {
      errors.push('La capacité doit être positive');
    }

    if (this.utilisation < 0 || this.utilisation > 100) {
      errors.push('L\'utilisation doit être entre 0 et 100%');
    }

    if (!this.derniereRevision) {
      errors.push('La date de dernière révision est requise');
    }

    if (!this.prochaineMaintenance) {
      errors.push('La date de prochaine maintenance est requise');
    }

    if (this.derniereRevision && this.prochaineMaintenance) {
      const revisionDate = new Date(this.derniereRevision);
      const maintenanceDate = new Date(this.prochaineMaintenance);
      
      if (maintenanceDate <= revisionDate) {
        errors.push('La prochaine maintenance doit être après la dernière révision');
      }
    }

    return errors;
  }

  isValid(): boolean {
    return this.validate().length === 0;
  }
}