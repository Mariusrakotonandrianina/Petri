import { Ouvrier } from '../../core/entities/Ouvrier';
import { IOuvrierRepository } from '../../core/interfaces/repositories/IOuvrierRepository';
import { IStorageService } from '../../core/interfaces/services/IStorageService';
import { defaultOuvriersData } from '../../app/data/ouvrierData';

export class LocalOuvrierRepository implements IOuvrierRepository {
  private readonly STORAGE_KEY = 'ouvriers';

  constructor(private storageService: IStorageService) {
    this.initializeData();
  }

  private initializeData(): void {
    if (!this.storageService.exists(this.STORAGE_KEY)) {
      const ouvriers = defaultOuvriersData.map(data => Ouvrier.create(data));
      this.storageService.set(this.STORAGE_KEY, ouvriers);
    }
  }

  private async getOuvriersFromStorage(): Promise<Ouvrier[]> {
    const data = this.storageService.get<any[]>(this.STORAGE_KEY) || [];
    return data.map(item => Ouvrier.create(item));
  }

  private async saveOuvriersToStorage(ouvriers: Ouvrier[]): Promise<void> {
    this.storageService.set(this.STORAGE_KEY, ouvriers);
  }

  async findAll(): Promise<Ouvrier[]> {
    return await this.getOuvriersFromStorage();
  }

  async findById(id: number): Promise<Ouvrier | null> {
    const ouvriers = await this.getOuvriersFromStorage();
    return ouvriers.find(ouvrier => ouvrier.id === id) || null;
  }

  async save(ouvrier: Ouvrier): Promise<Ouvrier> {
    const ouvriers = await this.getOuvriersFromStorage();
    
    const existingIndex = ouvriers.findIndex(o => o.id === ouvrier.id);
    if (existingIndex !== -1) {
      throw new Error(`Ouvrier with id ${ouvrier.id} already exists`);
    }

    ouvriers.push(ouvrier);
    await this.saveOuvriersToStorage(ouvriers);
    return ouvrier;
  }

  async update(id: number, updateData: Partial<Ouvrier>): Promise<Ouvrier | null> {
    const ouvriers = await this.getOuvriersFromStorage();
    const ouvrierIndex = ouvriers.findIndex(ouvrier => ouvrier.id === id);
    
    if (ouvrierIndex === -1) {
      return null;
    }

    const updatedOuvrier = { ...ouvriers[ouvrierIndex], ...updateData };
    ouvriers[ouvrierIndex] = Ouvrier.create(updatedOuvrier);
    
    await this.saveOuvriersToStorage(ouvriers);
    return ouvriers[ouvrierIndex];
  }

  async delete(id: number): Promise<boolean> {
    const ouvriers = await this.getOuvriersFromStorage();
    const initialLength = ouvriers.length;
    const filteredOuvriers = ouvriers.filter(ouvrier => ouvrier.id !== id);
    
    if (filteredOuvriers.length === initialLength) {
      return false;
    }

    await this.saveOuvriersToStorage(filteredOuvriers);
    return true;
  }

  async findAvailable(): Promise<Ouvrier[]> {
    const ouvriers = await this.getOuvriersFromStorage();
    return ouvriers.filter(ouvrier => ouvrier.isAvailable());
  }

  async findBySpecialite(specialite: string): Promise<Ouvrier[]> {
    const ouvriers = await this.getOuvriersFromStorage();
    return ouvriers.filter(ouvrier => 
      ouvrier.specialite.toLowerCase().includes(specialite.toLowerCase())
    );
  }

  async findByCompetence(competence: string): Promise<Ouvrier[]> {
    const ouvriers = await this.getOuvriersFromStorage();
    return ouvriers.filter(ouvrier => ouvrier.hasCompetence(competence));
  }
