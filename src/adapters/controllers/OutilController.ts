import { Outil } from '../../core/entities/Outil';
import { CreateOutil } from '../../core/usecases/outils/CreateOutil';
import { IOutilRepository } from '../../core/interfaces/repositories/IOutilRepository';

export class OutilController {
  private createOutil: CreateOutil;

  constructor(private outilRepository: IOutilRepository) {
    this.createOutil = new CreateOutil(outilRepository);
  }

  async getAllOutils(): Promise<Outil[]> {
    return await this.outilRepository.findAll();
  }

  async getOutilById(id: number): Promise<Outil | null> {
    return await this.outilRepository.findById(id);
  }

  async getAvailableOutils(): Promise<Outil[]> {
    return await this.outilRepository.findAvailable();
  }

  async getOutilsByType(type: string): Promise<Outil[]> {
    return await this.outilRepository.findByType(type);
  }

  async createNewOutil(data: Omit<Outil, 'id'>): Promise<Outil> {
    return await this.createOutil.execute(data);
  }

  async updateExistingOutil(id: number, data: Partial<Outil>): Promise<Outil | null> {
    return await this.outilRepository.update(id, data);
  }

  async reserveOutil(id: number): Promise<boolean> {
    const outil = await this.outilRepository.findById(id);
    if (!outil || !outil.reserve()) {
      return false;
    }
    
    await this.outilRepository.update(id, {
      disponible: outil.disponible,
      enUse: outil.enUse
    });
    return true;
  }

  async releaseOutil(id: number): Promise<boolean> {
    const outil = await this.outilRepository.findById(id);
    if (!outil || !outil.release()) {
      return false;
    }
    
    await this.outilRepository.update(id, {
      disponible: outil.disponible,
      enUse: outil.enUse
    });
    return true;
  }

  async deleteOutilById(id: number): Promise<boolean> {
    return await this.outilRepository.delete(id);
  }
}