import { Ouvrier } from '../../core/entities/Ouvrier';
import { CreateOuvrier } from '../../core/usecases/ouvriers/CreateOuvrier';
import { IOuvrierRepository } from '../../core/interfaces/repositories/IOuvrierRepository';

export class OuvrierController {
  private createOuvrier: CreateOuvrier;

  constructor(private ouvrierRepository: IOuvrierRepository) {
    this.createOuvrier = new CreateOuvrier(ouvrierRepository);
  }

  async getAllOuvriers(): Promise<Ouvrier[]> {
    return await this.ouvrierRepository.findAll();
  }

  async getOuvrierById(id: number): Promise<Ouvrier | null> {
    return await this.ouvrierRepository.findById(id);
  }

  async getAvailableOuvriers(): Promise<Ouvrier[]> {
    return await this.ouvrierRepository.findAvailable();
  }

  async getOuvriersBySpecialite(specialite: string): Promise<Ouvrier[]> {
    return await this.ouvrierRepository.findBySpecialite(specialite);
  }

  async getOuvriersByCompetence(competence: string): Promise<Ouvrier[]> {
    return await this.ouvrierRepository.findByCompetence(competence);
  }

  async createNewOuvrier(data: Omit<Ouvrier, 'id'>): Promise<Ouvrier> {
    return await this.createOuvrier.execute(data);
  }

  async updateExistingOuvrier(id: number, data: Partial<Ouvrier>): Promise<Ouvrier | null> {
    return await this.ouvrierRepository.update(id, data);
  }

  async assignTaskToOuvrier(id: number, task: string): Promise<boolean> {
    const ouvrier = await this.ouvrierRepository.findById(id);
    if (!ouvrier || !ouvrier.assignTask(task)) {
      return false;
    }
    
    await this.ouvrierRepository.update(id, {
      tacheActuelle: ouvrier.tacheActuelle,
      statut: ouvrier.statut
    });
    return true;
  }

  async completeOuvrierTask(id: number): Promise<boolean> {
    const ouvrier = await this.ouvrierRepository.findById(id);
    if (!ouvrier) {
      return false;
    }
    
    ouvrier.completeTask();
    await this.ouvrierRepository.update(id, {
      tacheActuelle: ouvrier.tacheActuelle,
      statut: ouvrier.statut
    });
    return true;
  }

  async deleteOuvrierById(id: number): Promise<boolean> {
    return await this.ouvrierRepository.delete(id);
  }
}