// src/infrastructure/services/InMemoryStorageService.ts
import { IStorageService } from '../../core/interfaces/services/IStorageService';

/**
 * Service de stockage en mémoire comme alternative à localStorage
 * Compatible avec l'environnement Claude.ai qui ne supporte pas localStorage
 */
export class InMemoryStorageService implements IStorageService {
  private storage: Map<string, any> = new Map();

  get<T>(key: string): T | null {
    try {
      const item = this.storage.get(key);
      return item !== undefined ? item : null;
    } catch (error) {
      console.error(`Error getting item from memory storage: ${key}`, error);
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      // Simulation de la sérialisation/désérialisation comme localStorage
      const serialized = JSON.stringify(value);
      const deserialized = JSON.parse(serialized);
      this.storage.set(key, deserialized);
    } catch (error) {
      console.error(`Error setting item in memory storage: ${key}`, error);
    }
  }

  remove(key: string): void {
    try {
      this.storage.delete(key);
    } catch (error) {
      console.error(`Error removing item from memory storage: ${key}`, error);
    }
  }

  clear(): void {
    try {
      this.storage.clear();
    } catch (error) {
      console.error('Error clearing memory storage', error);
    }
  }

  exists(key: string): boolean {
    try {
      return this.storage.has(key);
    } catch (error) {
      console.error(`Error checking existence in memory storage: ${key}`, error);
      return false;
    }
  }

  // Méthodes utilitaires pour le debug
  getAllKeys(): string[] {
    return Array.from(this.storage.keys());
  }

  getSize(): number {
    return this.storage.size;
  }

  // Méthode pour sauvegarder/charger depuis un fichier JSON (pour persistence)
  exportData(): string {
    const data = Object.fromEntries(this.storage);
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      this.storage.clear();
      Object.entries(data).forEach(([key, value]) => {
        this.storage.set(key, value);
      });
    } catch (error) {
      console.error('Error importing data:', error);
    }
  }
}