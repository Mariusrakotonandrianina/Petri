import React, { useState, useEffect, useCallback } from 'react';
import { X, Save, AlertCircle, Info, Settings } from 'lucide-react';

interface MachineFormData {
  nom: string;
  type: string;
  capacite: number;
  status: "active" | "panne" | "maintenance";
  utilisation: number;
}

interface MachineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  machine?: any | null;
  title: string;
}

const MACHINE_TYPES = [
  'Presse hydraulique',
  'Cabine automatique',
  'Poste manuel',
  'Tour CNC',
  'Fraiseuse',
  'Perceuse',
  'Soudure automatique',
  'Station d\'assemblage',
  'Robot de peinture',
  'Chaîne d\'assemblage',
  'Machine de découpe',
  'Poste de soudure',
  'Rectifieuse',
  'Ponceuse',
  'Machine à laver industrielle'
];

const STATUS_OPTIONS = [
  { value: 'active', label: '🟢 Actif', description: 'Machine en fonctionnement normal' },
  { value: 'panne', label: '🔴 En panne', description: 'Machine arrêtée pour réparation' },
  { value: 'maintenance', label: '🟡 En maintenance', description: 'Maintenance préventive en cours' }
] as const;

const MachineFormModal: React.FC<MachineFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  machine,
  title
}) => {
  const [formData, setFormData] = useState<MachineFormData>({
    nom: '',
    type: '',
    capacite: 1,
    status: 'active',
    utilisation: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (machine && isOpen) {
      setFormData({
        nom: machine.nom || '',
        type: machine.type || '',
        capacite: machine.capacite || 1,
        status: machine.status || 'active',
        utilisation: machine.utilisation || 0 
      });
    } else if (isOpen) {
      setFormData({
        nom: '',
        type: '',
        capacite: 1,
        status: 'active',
        utilisation: 0
      });
    }
    setErrors({});
  }, [machine, isOpen]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    } else if (formData.nom.trim().length < 3) {
      newErrors.nom = 'Le nom doit contenir au moins 3 caractères';
    } else if (formData.nom.trim().length > 50) {
      newErrors.nom = 'Le nom ne peut pas dépasser 50 caractères';
    }

    if (!formData.type.trim()) {
      newErrors.type = 'Le type est requis';
    }

    if (formData.capacite <= 0) {
      newErrors.capacite = 'La capacité doit être supérieure à 0';
    } else if (formData.capacite > 1000) {
      newErrors.capacite = 'La capacité ne peut pas dépasser 1000 unités/h';
    }

    if (formData.utilisation < 0) {
      newErrors.utilisation = 'L\'utilisation ne peut pas être négative';
    } else if (formData.utilisation > 100) {
      newErrors.utilisation = 'L\'utilisation ne peut pas dépasser 100%';
    }

    if (formData.status === 'maintenance' && formData.utilisation > 0) {
      newErrors.utilisation = 'L\'utilisation doit être 0% pour une machine en maintenance';
    }

    if (formData.status === 'panne' && formData.utilisation > 0) {
      newErrors.utilisation = 'L\'utilisation doit être 0% pour une machine en panne';
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
      if (machine) {
        await onSubmit({ id: machine.id || machine._id, ...dataToSubmit });
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

  const handleInputChange = useCallback((field: keyof MachineFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'status' && (value === 'maintenance' || value === 'panne')) {
        newData.utilisation = 0;
      }
      return newData;
    });

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

  const previewData = {
    effectiveCapacity: Math.round(formData.capacite * formData.utilisation / 100)
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
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-t-xl backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100/80 backdrop-blur-sm rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600">
                {machine ? 'Modifier les informations' : 'Ajouter une nouvelle machine'}
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
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Informations principales
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la machine *
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white/70 backdrop-blur-sm ${
                    errors.nom ? 'border-red-500 bg-red-50/70' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Presse d'assemblage #1"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de machine *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white/70 backdrop-blur-sm ${
                    errors.type ? 'border-red-500 bg-red-50/70' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                >
                  <option value="">Sélectionner un type</option>
                  {MACHINE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                    {errors.type}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacité (u/h) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.capacite}
                    onChange={(e) => handleInputChange('capacite', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white/70 backdrop-blur-sm ${
                      errors.capacite ? 'border-red-500 bg-red-50/70' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.capacite && (
                    <p className="mt-1 text-xs text-red-600 flex items-start">
                      <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0 mt-0.5" />
                      {errors.capacite}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Utilisation (%) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.utilisation}
                    onChange={(e) => handleInputChange('utilisation', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white/70 backdrop-blur-sm ${
                      errors.utilisation ? 'border-red-500 bg-red-50/70' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting || formData.status === 'maintenance' || formData.status === 'panne'}
                  />
                  {errors.utilisation && (
                    <p className="mt-1 text-xs text-red-600 flex items-start">
                      <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0 mt-0.5" />
                      {errors.utilisation}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut de la machine
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

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Aperçu
              </h3>
              <div className="bg-gradient-to-br from-blue-50/80 to-indigo-100/80 border border-blue-200/50 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center mb-3">
                  <Info className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="text-sm font-medium text-blue-800">Aperçu de la machine</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Machine:</span>
                    <span className="font-medium text-blue-900">{formData.nom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Type:</span>
                    <span className="font-medium text-blue-900">{formData.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Capacité totale:</span>
                    <span className="font-medium text-blue-900">{formData.capacite} u/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Capacité effective:</span>
                    <span className="font-medium text-blue-900">{previewData.effectiveCapacity} u/h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="mt-6 p-4 bg-red-50/70 border border-red-200/50 rounded-lg backdrop-blur-sm">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            </div>
          )}

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
                    {machine ? 'Modifier' : 'Créer'}
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

export default MachineFormModal;
