import { Ouvrier } from '../../entities/Ouvrier';
import { IOuvrierRepository } from '../../interfaces/repositories/IOuvrierRepository';
import { ValidationError } from '../../types/errors';

export class CreateOuvrier {
  constructor(private ouvrierRepository: IOuvrierRepository) {}

  async execute(data: Omit<Ouvrier, 'id'>): Promise<Ouvrier> {
    this.validate(data);
    
    const ouvrier = Ouvrier.create(data);
    return await this.ouvrierRepository.save(ouvrier);
  }

  private validate(data: Omit<Ouvrier, 'id'>): void {
    if (!data.nom?.trim()) {
      throw new ValidationError('Le nom de l\'ouvrier est requis');
    }
    if (!data.specialite?.trim()) {
      throw new ValidationError('La spécialité est requise');
    }
    if (data.heuresJour < 0 || data.heuresJour > data.heuresMax) {
      throw new ValidationError('Les heures travaillées doivent être entre 0 et le maximum');
    }
    if (data.heuresMax <= 0) {
      throw new ValidationError('Le nombre d\'heures maximum doit être supérieur à 0');
    }
    if (!data.competences || data.competences.length === 0) {
      throw new ValidationError('Au moins une compétence est requise');
    }
  }
}