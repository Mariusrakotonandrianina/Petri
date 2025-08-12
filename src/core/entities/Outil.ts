export class Outil {
    constructor(
      public readonly id: number,
      public nom: string,
      public type: string,
      public quantite: number,
      public disponible: number,
      public enUse: number,
      public etat: "bon" | "usure" | "reparation",
      public derniereVerification: string,
      public prochaineVerification: string
    ) {}
  
    static create(data: Omit<Outil, 'id'> & { id?: number }): Outil {
      return new Outil(
        data.id || Date.now(),
        data.nom,
        data.type,
        data.quantite,
        data.disponible,
        data.enUse,
        data.etat,
        data.derniereVerification,
        data.prochaineVerification
      );
    }
  
    isAvailable(): boolean {
      return this.disponible > 0 && this.etat === "bon";
    }
  
    reserve(): boolean {
      if (!this.isAvailable()) return false;
      
      this.disponible--;
      this.enUse++;
      return true;
    }
  
    release(): boolean {
      if (this.enUse <= 0) return false;
      
      this.disponible++;
      this.enUse--;
      return true;
    }
  
    needsVerification(): boolean {
      const today = new Date();
      const verificationDate = new Date(this.prochaineVerification);
      return verificationDate <= today;
    }
  }