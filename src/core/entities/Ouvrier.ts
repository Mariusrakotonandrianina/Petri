export class Ouvrier {
    constructor(
      public readonly id: number,
      public nom: string,
      public specialite: string,
      public niveau: "Expert" | "Confirmé" | "Débutant",
      public statut: "disponible" | "occupe" | "pause",
      public tacheActuelle: string | null,
      public heuresJour: number,
      public heuresMax: number,
      public competences: string[]
    ) {}
  
    static create(data: Omit<Ouvrier, 'id'> & { id?: number }): Ouvrier {
      return new Ouvrier(
        data.id || Date.now(),
        data.nom,
        data.specialite,
        data.niveau,
        data.statut,
        data.tacheActuelle || null,
        data.heuresJour,
        data.heuresMax,
        data.competences
      );
    }
  
    isAvailable(): boolean {
      return this.statut === "disponible" || this.statut === "pause";
    }
  
    canWork(): boolean {
      return this.heuresJour < this.heuresMax && this.isAvailable();
    }
  
    assignTask(task: string): boolean {
      if (!this.canWork()) return false;
      
      this.tacheActuelle = task;
      this.statut = "occupe";
      return true;
    }
  
    completeTask(): void {
      this.tacheActuelle = null;
      this.statut = "disponible";
    }
  
    hasCompetence(competence: string): boolean {
      return this.competences.includes(competence);
    }
  
    getWorkloadPercentage(): number {
      return (this.heuresJour / this.heuresMax) * 100;
    }
  }