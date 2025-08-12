import { Outil } from '../../core/entities/Outil';
import { IOutilRepository } from '../../core/interfaces/repositories/IOutilRepository';
import { IStorageService } from '../../core/interfaces/services/IStorageService';
import { defaultOutilsData } from '../../app/data/outilData';

export class LocalOutilRepository implements IOutilRepository {
  private readonly STORAGE_KEY = 'outils';

  constructor(private storageService: IStorageService) {
    this.initializeData();
  }

  private initializeData(): void {
    if (!this.storageService.exists(this.STORAGE_KEY)) {
      const outils = defaultOutilsData.map(data => Outil.create(data));
      this.storageService.set(this.STORAGE_KEY, outils);
    }
  }

  private async getOutilsFromStorage(): Promise<Outil[]> {
    const data = this.storageService.get<any[]>(this.STORAGE_KEY) || [];
    return data.map(item => Outil.create(item));
  }

  private async saveOutilsToStorage(outils: Outil[]): Promise<void> {
    this.storageService.set(this.STORAGE_KEY, outils);
  }

  async findAll(): Promise<Outil[]> {
    return await this.getOutilsFromStorage();
  }

  async findById(id: number): Promise<Outil | null> {
    const outils = await this.getOutilsFromStorage();
    return outils.find(outil => outil.id === id) || null;
  }

  async save(outil: Outil): Promise<Outil> {
    const outils = await this.getOutilsFromStorage();
    
    const existingIndex = outils.findIndex(o => o.id === outil.id);
    if (existingIndex !== -1) {
      throw new Error(`Outil with id ${outil.id} already exists`);
    }

    outils.push(outil);
    await this.saveOutilsToStorage(outils);
    return outil;
  }

  async update(id: number, updateData: Partial<Outil>): Promise<Outil | null> {
    const outils = await this.getOutilsFromStorage();
    const outilIndex = outils.findIndex(outil => outil.id === id);
    
    if (outilIndex === -1) {
      return null;
    }

    const updatedOutil = { ...outils[outilIndex], ...updateData };
    outils[outilIndex] = Outil.create(updatedOutil);
    
    await this.saveOutilsToStorage(outils);
    return outils[outilIndex];
  }

  async delete(id: number): Promise<boolean> {
    const outils = await this.getOutilsFromStorage();
    const initialLength = outils.length;
    const filteredOutils = outils.filter(outil => outil.id !== id);
    
    if (filteredOutils.length === initialLength) {
      return false;
    }

    await this.saveOutilsToStorage(filteredOutils);
    return true;
  }

  async findAvailable(): Promise<Outil[]> {
    const outils = await this.getOutilsFromStorage();
    return outils.filter(outil => outil.isAvailable());
  }

  async findByType(type: string): Promise<Outil[]> {
    const outils = await this.getOutilsFromStorage();
    return outils.filter(outil => outil.type.toLowerCase().includes(type.toLowerCase()));
  }
}