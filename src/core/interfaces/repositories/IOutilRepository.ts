import { Outil } from '../../entities/Outil';

export interface IOutilRepository {
  findAll(): Promise<Outil[]>;
  findById(id: number): Promise<Outil | null>;
  save(outil: Outil): Promise<Outil>;
  update(id: number, outil: Partial<Outil>): Promise<Outil | null>;
  delete(id: number): Promise<boolean>;
  findAvailable(): Promise<Outil[]>;
  findByType(type: string): Promise<Outil[]>;
}