import React, { useState, useEffect, useCallback } from 'react';
import { User, Wrench, Clock, X, Save, AlertCircle, Info, Plus, Minus } from "lucide-react";

interface Ouvrier {
  id?: string | number;
  _id?: string;
  nom: string;
  specialite: string;
  niveau: 'Débutant' | 'Intermédiaire' | 'Expert';
  statut: 'disponible' | 'occupé' | 'en pause';
  tacheActuelle?: string | null;
  heuresJour: number;
  heuresMax: number;
  competences: string[];
}

interface OuvrierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  ouvrier: Ouvrier | null;
}

const NIVEAU_OPTIONS = ['Débutant', 'Intermédiaire', 'Expert'] as const;
const STATUT_OPTIONS = [
  { value: 'disponible', label: '🟢 Disponible', description: 'Prêt à travailler' },
  { value: 'occupé', label: '🟡 Occupé', description: 'Actuellement sur une tâche' },
  { value: 'en pause', label: '🔴 En pause', description: 'Non disponible pour l’instant' }
] as const;

const OuvrierFormModal: React.FC<OuvrierFormModalProps> = ({ isOpen, onClose, onSubmit, ouvrier }) => {
  const [formData, setFormData] = useState<Ouvrier>({
    nom: '',
    specialite: '',
    niveau: 'Débutant',
    statut: 'disponible',
    tacheActuelle: '',
    heuresJour: 0,
    heuresMax: 8,
    competences: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCompetence, setNewCompetence] = useState('');

  useEffect(() => {
    if (ouvrier && isOpen) {
      setFormData({
        nom: ouvrier.nom,
        specialite: ouvrier.specialite,
        niveau: ouvrier.niveau,
        statut: ouvrier.statut,
        tacheActuelle: ouvrier.tacheActuelle || '',
        heuresJour: ouvrier.heuresJour,
        heuresMax: ouvrier.heuresMax,
        competences: ouvrier.competences || []
      });
    } else if (isOpen) {
      setFormData({
        nom: '',
        specialite: '',
        niveau: 'Débutant',
        statut: 'disponible',
        tacheActuelle: '',
        heuresJour: 0,
        heuresMax: 8,
        competences: []
      });
    }
    setErrors({});
  }, [ouvrier, isOpen]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.specialite.trim()) newErrors.specialite = "La spécialité est requise";
    if (formData.heuresJour < 0 || formData.heuresJour > formData.heuresMax)
      newErrors.heuresJour = "Les heures par jour doivent être entre 0 et le maximum";
    if (formData.heuresMax <= 0 || formData.heuresMax > 24)
      newErrors.heuresMax = "Les heures max doivent être entre 1 et 24";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const dataToSubmit = { ...formData };
      if (ouvrier) {
        await onSubmit({ id: ouvrier.id || ouvrier._id, ...dataToSubmit });
      } else {
        await onSubmit(dataToSubmit);
      }
      onClose();
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Erreur lors de la sauvegarde'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof Ouvrier, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddCompetence = () => {
    if (newCompetence.trim() && !formData.competences.includes(newCompetence.trim())) {
      setFormData(prev => ({
        ...prev,
        competences: [...prev.competences, newCompetence.trim()]
      }));
      setNewCompetence('');
    }
  };

  const handleRemoveCompetence = (comp: string) => {
    setFormData(prev => ({
      ...prev,
      competences: prev.competences.filter(c => c !== comp)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-green-50/80 to-emerald-50/80 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100/80 rounded-lg">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {ouvrier ? 'Modifier l’ouvrier' : 'Créer un nouvel ouvrier'}
              </h2>
              <p className="text-sm text-gray-600">
                {ouvrier ? 'Modifier les informations' : 'Ajouter un nouvel ouvrier'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-white/50" disabled={isSubmitting}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Informations principales</h3>
              
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.nom ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  placeholder="Nom de l'ouvrier"
                  disabled={isSubmitting}
                />
                {errors.nom && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.nom}</p>}
              </div>

              {/* Spécialité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spécialité *</label>
                <input
                  type="text"
                  value={formData.specialite}
                  onChange={(e) => handleInputChange('specialite', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.specialite ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  placeholder="Ex: Assemblage, Soudure..."
                  disabled={isSubmitting}
                />
                {errors.specialite && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.specialite}</p>}
              </div>

              {/* Niveau */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                <select
                  value={formData.niveau}
                  onChange={(e) => handleInputChange('niveau', e.target.value as Ouvrier['niveau'])}
                  className="w-full px-3 py-2 border rounded-lg border-gray-300"
                  disabled={isSubmitting}
                >
                  {NIVEAU_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <div className="space-y-2">
                  {STATUT_OPTIONS.map(opt => (
                    <label key={opt.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="statut"
                        value={opt.value}
                        checked={formData.statut === opt.value}
                        onChange={(e) => handleInputChange('statut', e.target.value as Ouvrier['statut'])}
                        disabled={isSubmitting}
                      />
                      <div>
                        <div className="font-medium text-sm">{opt.label}</div>
                        <div className="text-xs text-gray-500">{opt.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tâche actuelle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tâche actuelle</label>
                <input
                  type="text"
                  value={formData.tacheActuelle || ''}
                  onChange={(e) => handleInputChange('tacheActuelle', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg border-gray-300"
                  placeholder="Ex: Montage moteur"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Aperçu */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Aperçu</h3>
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Info className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="text-sm font-medium text-green-800">Résumé de l’ouvrier</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Nom:</span><span className="font-medium">{formData.nom || '—'}</span></div>
                  <div className="flex justify-between"><span>Spécialité:</span><span className="font-medium">{formData.specialite || '—'}</span></div>
                  <div className="flex justify-between"><span>Niveau:</span><span className="font-medium">{formData.niveau}</span></div>
                  <div className="flex justify-between"><span>Statut:</span><span className="font-medium">{formData.statut}</span></div>
                  <div className="flex justify-between"><span>Heures/Jour:</span><span className="font-medium">{formData.heuresJour} h</span></div>
                  <div className="flex justify-between"><span>Heures Max:</span><span className="font-medium">{formData.heuresMax} h</span></div>
                  <div><span className="text-green-700">Compétences:</span>
                    <ul className="list-disc list-inside text-green-900">
                      {formData.competences.length ? formData.competences.map((c, i) => <li key={i}>{c}</li>) : <li>Aucune</li>}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Heures */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Heures/Jour *</label>
                  <input
                    type="number"
                    min={0}
                    max={formData.heuresMax}
                    value={formData.heuresJour}
                    onChange={(e) => handleInputChange('heuresJour', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.heuresJour ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  />
                  {errors.heuresJour && <p className="text-xs text-red-600 flex items-center"><AlertCircle className="w-3 h-3 mr-1" />{errors.heuresJour}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Heures Max *</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={formData.heuresMax}
                    onChange={(e) => handleInputChange('heuresMax', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.heuresMax ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  />
                  {errors.heuresMax && <p className="text-xs text-red-600 flex items-center"><AlertCircle className="w-3 h-3 mr-1" />{errors.heuresMax}</p>}
                </div>
              </div>

              {/* Compétences */}
              <div>
                <label className="block text-sm font-medium mb-1">Compétences</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newCompetence}
                    onChange={(e) => setNewCompetence(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg border-gray-300"
                    placeholder="Ajouter une compétence..."
                    disabled={isSubmitting}
                  />
                  <button type="button" onClick={handleAddCompetence} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600" disabled={!newCompetence.trim() || isSubmitting}>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.competences.map((comp, i) => (
                    <span key={i} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center">
                      {comp}
                      <button onClick={() => handleRemoveCompetence(comp)} className="ml-1 text-red-500 hover:text-red-700">
                        <Minus className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Erreur de soumission */}
          {errors.submit && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
            <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" disabled={isSubmitting}>Annuler</button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="ml-3 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {ouvrier ? 'Modifier' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OuvrierFormModal;
