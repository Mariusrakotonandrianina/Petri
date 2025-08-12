import { IStorageService } from '../../core/interfaces/services/IStorageService';

export class LocalStorageService implements IStorageService {
  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  get<T>(key: string): T | null {
    if (!this.isClient()) {
      return null;
    }

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item from localStorage: ${key}`, error);
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    if (!this.isClient()) {
      return;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item in localStorage: ${key}`, error);
    }
  }

  remove(key: string): void {
    if (!this.isClient()) {
      return;
    }

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from localStorage: ${key}`, error);
    }
  }

  clear(): void {
    if (!this.isClient()) {
      return;
    }

    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  }

  exists(key: string): boolean {
    if (!this.isClient()) {
      return false;
    }

    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Error checking existence in localStorage: ${key}`, error);
      return false;
    }
  }
}