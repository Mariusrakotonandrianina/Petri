import { Ouvrier } from '../../entities/Ouvrier';

export interface IOuvrierRepository {
  findAll(): Promise<Ouvrier[]>;
  findById(id: number): Promise<Ouvrier | null>;
  save(ouvrier: Ouvrier): Promise<Ouvrier>;
  update(id: number, ouvrier: Partial<Ouvrier>): Promise<Ouvrier | null>;
  delete(id: number): Promise<boolean>;
  findAvailable(): Promise<Ouvrier[]>;
  findBySpecialite(specialite: string): Promise<Ouvrier[]>;
  findByCompetence(competence: string): Promise<Ouvrier[]>;
}