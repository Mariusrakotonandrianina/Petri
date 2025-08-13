import { IStorageService } from '../../core/interfaces/services/IStorageService';

/**
 * Service de stockage en mémoire comme alternative à localStorage
 * Compatible avec l'environnement Claude.ai qui ne supporte pas localStorage
 */
export class InMemoryStorageService implements IStorageService {
  private storage: Map<string, any> = new Map();
  private maxSize: number = 1000; // Limite de sécurité

  constructor(maxSize?: number) {
    if (maxSize) {
      this.maxSize = maxSize;
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = this.storage.get(key);
      return item !== undefined ? item : null;
    } catch (error) {
      console.error(`Erreur lors de la lecture de la clé: ${key}`, error);
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      // Vérification de la limite de taille
      if (this.storage.size >= this.maxSize && !this.storage.has(key)) {
        console.warn(`Limite de stockage atteinte (${this.maxSize}). Suppression de la plus ancienne entrée.`);
        const firstKey = this.storage.keys().next().value;
        if (firstKey) {
          this.storage.delete(firstKey);
        }
      }

      // Simulation de la sérialisation/désérialisation comme localStorage
      const serialized = JSON.stringify(value);
      const deserialized = JSON.parse(serialized);
      this.storage.set(key, deserialized);
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde de la clé: ${key}`, error);
      throw new Error(`Impossible de sauvegarder les données pour la clé: ${key}`);
    }
  }

  remove(key: string): void {
    try {
      this.storage.delete(key);
    } catch (error) {
      console.error(`Erreur lors de la suppression de la clé: ${key}`, error);
    }
  }

  clear(): void {
    try {
      this.storage.clear();
    } catch (error) {
      console.error('Erreur lors du nettoyage du stockage', error);
    }
  }

  exists(key: string): boolean {
    try {
      return this.storage.has(key);
    } catch (error) {
      console.error(`Erreur lors de la vérification de l'existence de la clé: ${key}`, error);
      return false;
    }
  }

  getAllKeys(): string[] {
    try {
      return Array.from(this.storage.keys());
    } catch (error) {
      console.error('Erreur lors de la récupération des clés', error);
      return [];
    }
  }

  getSize(): number {
    try {
      return this.storage.size;
    } catch (error) {
      console.error('Erreur lors de la récupération de la taille', error);
      return 0;
    }
  }

  // Méthodes utilitaires pour le debug et la persistence
  exportData(): string {
    try {
      const data = Object.fromEntries(this.storage);
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Erreur lors de l\'export des données', error);
      return '{}';
    }
  }

  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      this.storage.clear();
      Object.entries(data).forEach(([key, value]) => {
        this.storage.set(key, value);
      });
    } catch (error) {
      console.error('Erreur lors de l\'import des données', error);
      throw new Error('Données JSON invalides pour l\'import');
    }
  }

  // Méthode pour la sauvegarde périodique (si nécessaire)
  backup(): { timestamp: number; data: string } {
    return {
      timestamp: Date.now(),
      data: this.exportData()
    };
  }

  restore(backup: { timestamp: number; data: string }): void {
    try {
      this.importData(backup.data);
      console.log(`Données restaurées depuis le backup du ${new Date(backup.timestamp).toLocaleString()}`);
    } catch (error) {
      console.error('Erreur lors de la restauration du backup', error);
      throw new Error('Impossible de restaurer le backup');
    }
  }

  // Méthode pour obtenir des statistiques
  getStats(): {
    totalKeys: number;
    memoryUsage: string;
    oldestEntry?: string;
    newestEntry?: string;
  } {
    try {
      const keys = this.getAllKeys();
      const stats = {
        totalKeys: keys.length,
        memoryUsage: `${Math.round(JSON.stringify(Object.fromEntries(this.storage)).length / 1024)} KB`,
        oldestEntry: keys.length > 0 ? keys[0] : undefined,
        newestEntry: keys.length > 0 ? keys[keys.length - 1] : undefined
      };
      
      return stats;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques', error);
      return {
        totalKeys: 0,
        memoryUsage: '0 KB'
      };
    }
  }

  // Méthode pour nettoyer les entrées anciennes (si timestamp disponible)
  cleanup(maxAge: number = 24 * 60 * 60 * 1000): number { // 24h par défaut
    try {
      const now = Date.now();
      let removedCount = 0;
      
      for (const [key, value] of this.storage.entries()) {
        if (value && typeof value === 'object' && value.timestamp) {
          if (now - value.timestamp > maxAge) {
            this.storage.delete(key);
            removedCount++;
          }
        }
      }
      
      return removedCount;
    } catch (error) {
      console.error('Erreur lors du nettoyage', error);
      return 0;
    }
  }
}