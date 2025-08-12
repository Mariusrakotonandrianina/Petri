import { Outil } from '../../entities/Outil';
import { IOutilRepository } from '../../interfaces/repositories/IOutilRepository';
import { ValidationError } from '../../types/errors';

export class CreateOutil {
  constructor(private outilRepository: IOutilRepository) {}

  async execute(data: Omit<Outil, 'id'>): Promise<Outil> {
    this.validate(data);
    
    const outil = Outil.create(data);
    return await this.outilRepository.save(outil);
  }

  private validate(data: Omit<Outil, 'id'>): void {
    if (!data.nom?.trim()) {
      throw new ValidationError('Le nom de l\'outil est requis');
    }
    if (!data.type?.trim()) {
      throw new ValidationError('Le type de l\'outil est requis');
    }
    if (data.quantite <= 0) {
      throw new ValidationError('La quantité doit être supérieure à 0');
    }
    if (data.disponible < 0 || data.disponible > data.quantite) {
      throw new ValidationError('La quantité disponible doit être entre 0 et la quantité totale');
    }
    if (data.enUse < 0 || (data.disponible + data.enUse) > data.quantite) {
      throw new ValidationError('Les quantités ne sont pas cohérentes');
    }
  }
}