import React, { useState, useEffect, useCallback } from 'react';
import { Building2, X, Save, AlertCircle, Info } from "lucide-react";

interface Atelier {
  id?: string | number;
  _id?: string;
  nom: string;
  localisation: string;
  superficie: number;
  capaciteEmployes: number;
  status: 'actif' | 'fermé' | 'maintenance';
  createdAt?: string;
  updatedAt?: string;
}

interface AtelierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  atelier: Atelier | null;
}

const STATUS_OPTIONS = [
  { value: 'actif', label: '🟢 Actif', description: 'Atelier en fonctionnement normal' },
  { value: 'maintenance', label: '🟡 En maintenance', description: 'Maintenance préventive en cours' },
  { value: 'fermé', label: '🔴 Fermé', description: 'Atelier temporairement fermé' }
] as const;

const LOCALISATIONS_SUGGESTIONS = [
  'Bâtiment A - Niveau 1',
  'Bâtiment A - Niveau 2', 
  'Bâtiment B - Niveau 1',
  'Bâtiment B - Niveau 2',
  'Zone Industrielle Nord',
  'Zone Industrielle Sud',
  'Hangar Principal',
  'Atelier Externe',
  'Zone de Production',
  'Zone d\'Assemblage'
];

const AtelierFormModal: React.FC<AtelierFormModalProps> = ({ isOpen, onClose, onSubmit, atelier }) => {
  const [formData, setFormData] = useState({
    nom: '',
    localisation: '',
    superficie: 0,
    capaciteEmployes: 0,
    status: 'actif' as 'actif' | 'fermé' | 'maintenance'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomLocation, setShowCustomLocation] = useState(false);

  useEffect(() => {
    if (atelier && isOpen) {
      setFormData({
        nom: atelier.nom,
        localisation: atelier.localisation,
        superficie: atelier.superficie,
        capaciteEmployes: atelier.capaciteEmployes,
        status: atelier.status
      });
      setShowCustomLocation(!LOCALISATIONS_SUGGESTIONS.includes(atelier.localisation));
    } else if (isOpen) {
      setFormData({
        nom: '',
        localisation: '',
        superficie: 0,
        capaciteEmployes: 0,
        status: 'actif'
      });
      setShowCustomLocation(false);
    }
    setErrors({});
  }, [atelier, isOpen]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom de l'atelier est requis";
    } else if (formData.nom.trim().length < 3) {
      newErrors.nom = "Le nom doit contenir au moins 3 caractères";
    } else if (formData.nom.trim().length > 50) {
      newErrors.nom = "Le nom ne peut pas dépasser 50 caractères";
    }

    if (!formData.localisation.trim()) {
      newErrors.localisation = "La localisation est requise";
    } else if (formData.localisation.trim().length < 3) {
      newErrors.localisation = "La localisation doit contenir au moins 3 caractères";
    }

    if (formData.superficie <= 0) {
      newErrors.superficie = "La superficie doit être supérieure à 0";
    } else if (formData.superficie > 10000) {
      newErrors.superficie = "La superficie ne peut pas dépasser 10 000 m²";
    }

    if (formData.capaciteEmployes <= 0) {
      newErrors.capaciteEmployes = "La capacité doit être supérieure à 0";
    } else if (formData.capaciteEmployes > 1000) {
      newErrors.capaciteEmployes = "La capacité ne peut pas dépasser 1 000 employés";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSubmit = { ...formData };
      if (atelier) {
        await onSubmit({ id: atelier.id || atelier._id, ...dataToSubmit });
      } else {
        await onSubmit(dataToSubmit);
      }
      onClose();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Erreur lors de la sauvegarde'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [isSubmitting, handleSubmit, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleLocationSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'custom') {
      setShowCustomLocation(true);
      handleInputChange('localisation', '');
    } else {
      setShowCustomLocation(false);
      handleInputChange('localisation', value);
    }
  };

  const previewData = {
    densiteEmployes: formData.superficie > 0 ? Math.round((formData.capaciteEmployes / formData.superficie) * 100) / 100 : 0,
    efficienceEspace: formData.superficie > 0 && formData.capaciteEmployes > 0 ? Math.round(formData.superficie / formData.capaciteEmployes * 10) / 10 : 0
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-t-xl backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100/80 backdrop-blur-sm rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {atelier ? 'Modifier l\'atelier' : 'Créer un nouvel atelier'}
              </h2>
              <p className="text-sm text-gray-600">
                {atelier ? 'Modifier les informations' : 'Ajouter un nouvel atelier'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-white/50"
            disabled={isSubmitting}
            title="Fermer (Échap)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6" onKeyDown={handleKeyPress}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulaire principal */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Informations principales
              </h3>

              {/* Nom de l'atelier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'atelier *
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white/70 backdrop-blur-sm ${
                    errors.nom ? 'border-red-500 bg-red-50/70' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Atelier Principal, Zone de Production..."
                  disabled={isSubmitting}
                  maxLength={50}
                />
                {errors.nom && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                    {errors.nom}
                  </p>
                )}
              </div>

              {/* Localisation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localisation *
                </label>
                <select
                  value={showCustomLocation ? 'custom' : formData.localisation}
                  onChange={handleLocationSelect}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white/70 backdrop-blur-sm ${
                    errors.localisation ? 'border-red-500 bg-red-50/70' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                >
                  <option value="">Sélectionner une localisation</option>
                  {LOCALISATIONS_SUGGESTIONS.map(localisation => (
                    <option key={localisation} value={localisation}>{localisation}</option>
                  ))}
                  <option value="custom">Autre (saisie personnalisée)</option>
                </select>
                
                {showCustomLocation && (
                  <input
                    type="text"
                    value={formData.localisation}
                    onChange={(e) => handleInputChange('localisation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white/70 backdrop-blur-sm mt-2"
                    placeholder="Saisissez une localisation personnalisée..."
                    disabled={isSubmitting}
                  />
                )}
                
                {errors.localisation && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                    {errors.localisation}
                  </p>
                )}
              </div>

              {/* Superficie et Capacité */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Superficie (m²) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={formData.superficie || ''}
                    onChange={(e) => handleInputChange('superficie', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white/70 backdrop-blur-sm ${
                      errors.superficie ? 'border-red-500 bg-red-50/70' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.superficie && (
                    <p className="mt-1 text-xs text-red-600 flex items-start">
                      <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0 mt-0.5" />
                      {errors.superficie}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacité max *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.capaciteEmployes || ''}
                    onChange={(e) => handleInputChange('capaciteEmployes', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white/70 backdrop-blur-sm ${
                      errors.capaciteEmployes ? 'border-red-500 bg-red-50/70' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.capaciteEmployes && (
                    <p className="mt-1 text-xs text-red-600 flex items-start">
                      <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0 mt-0.5" />
                      {errors.capaciteEmployes}
                    </p>
                  )}
                </div>
              </div>

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut de l'atelier
                </label>
                <div className="space-y-2">
                  {STATUS_OPTIONS.map(option => (
                    <label key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50/50 cursor-pointer backdrop-blur-sm">
                      <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={formData.status === option.value}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                        disabled={isSubmitting}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Aperçu */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Aperçu
              </h3>
              <div className="bg-gradient-to-br from-blue-50/80 to-indigo-100/80 border border-blue-200/50 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center mb-3">
                  <Info className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="text-sm font-medium text-blue-800">Aperçu de l'atelier</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Atelier:</span>
                    <span className="font-medium text-blue-900">{formData.nom || 'Non défini'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Localisation:</span>
                    <span className="font-medium text-blue-900 text-right ml-2">{formData.localisation || 'Non définie'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Superficie:</span>
                    <span className="font-medium text-blue-900">{formData.superficie} m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Capacité max:</span>
                    <span className="font-medium text-blue-900">{formData.capaciteEmployes} employés</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Densité:</span>
                    <span className="font-medium text-blue-900">{previewData.densiteEmployes} emp/m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Espace par employé:</span>
                    <span className="font-medium text-blue-900">{previewData.efficienceEspace} m²</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Erreur de soumission */}
          {errors.submit && (
            <div className="mt-6 p-4 bg-red-50/70 border border-red-200/50 rounded-lg backdrop-blur-sm">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200/50">
            <div className="text-xs text-gray-500">
              <p><strong>Astuce:</strong> Utilisez Entrée pour valider ou Échap pour annuler</p>
              <p><strong>Requis:</strong> Tous les champs avec * sont obligatoires</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || Object.keys(errors).length > 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {atelier ? 'Modifier' : 'Créer'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtelierFormModal;