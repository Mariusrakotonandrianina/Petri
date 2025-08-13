import React, { useState, useEffect, useCallback } from 'react';
import { X, Save, AlertCircle, Info, Calendar, Settings } from 'lucide-react';
import { Machine } from '../../core/entities/Machines';

interface MachineFormData {
  nom: string;
  type: string;
  capacite: number;
  status: "active" | "panne" | "maintenance";
  utilisation: number;
  derniereRevision: string;
  prochaineMaintenance: string;
}

interface MachineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Machine, 'id'> | Machine) => Promise<void>;
  machine?: Machine | null;
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
    utilisation: 0,
    derniereRevision: '',
    prochaineMaintenance: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Initialisation des données du formulaire
  useEffect(() => {
    if (machine && isOpen) {
      setFormData({
        nom: machine.nom,
        type: machine.type,
        capacite: machine.capacite,
        status: machine.status,
        utilisation: machine.utilisation,
        derniereRevision: machine.derniereRevision,
        prochaineMaintenance: machine.prochaineMaintenance
      });
    } else if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 3);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      setFormData({
        nom: '',
        type: '',
        capacite: 1,
        status: 'active',
        utilisation: 0,
        derniereRevision: today,
        prochaineMaintenance: futureDateStr
      });
    }
    setErrors({});
    setShowPreview(false);
  }, [machine, isOpen]);

  // Validation du formulaire
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Validation du nom
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    } else if (formData.nom.trim().length < 3) {
      newErrors.nom = 'Le nom doit contenir au moins 3 caractères';
    } else if (formData.nom.trim().length > 50) {
      newErrors.nom = 'Le nom ne peut pas dépasser 50 caractères';
    }

    // Validation du type
    if (!formData.type.trim()) {
      newErrors.type = 'Le type est requis';
    }

    // Validation de la capacité
    if (formData.capacite <= 0) {
      newErrors.capacite = 'La capacité doit être supérieure à 0';
    } else if (formData.capacite > 1000) {
      newErrors.capacite = 'La capacité ne peut pas dépasser 1000 unités/h';
    }

    // Validation de l'utilisation
    if (formData.utilisation < 0) {
      newErrors.utilisation = 'L\'utilisation ne peut pas être négative';
    } else if (formData.utilisation > 100) {
      newErrors.utilisation = 'L\'utilisation ne peut pas dépasser 100%';
    }

    // Validation des dates
    if (!formData.derniereRevision) {
      newErrors.derniereRevision = 'La date de révision est requise';
    } else {
      const revisionDate = new Date(formData.derniereRevision);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (revisionDate > today) {
        newErrors.derniereRevision = 'La date de révision ne peut pas être dans le futur';
      }
    }

    if (!formData.prochaineMaintenance) {
      newErrors.prochaineMaintenance = 'La date de maintenance est requise';
    } else if (formData.derniereRevision && formData.prochaineMaintenance) {
      const revisionDate = new Date(formData.derniereRevision);
      const maintenanceDate = new Date(formData.prochaineMaintenance);
      
      if (maintenanceDate <= revisionDate) {
        newErrors.prochaineMaintenance = 'La prochaine maintenance doit être après la dernière révision';
      }
    }

    // Validation logique métier
    if (formData.status === 'maintenance' && formData.utilisation > 0) {
      newErrors.utilisation = 'L\'utilisation doit être 0% pour une machine en maintenance';
    }

    if (formData.status === 'panne' && formData.utilisation > 0) {
      newErrors.utilisation = 'L\'utilisation doit être 0% pour une machine en panne';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Soumission du formulaire
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSubmit = machine 
        ? { ...machine, ...formData }
        : { ...formData };
      
      await onSubmit(dataToSubmit as any);
      onClose();
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Erreur lors de la sauvegarde'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestion des changements de champs
  const handleInputChange = useCallback((field: keyof MachineFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Ajustements automatiques selon la logique métier
      if (field === 'status') {
        if (value === 'maintenance' || value === 'panne') {
          newData.utilisation = 0;
        }
      }
      
      return newData;
    });
    
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Gestion des touches clavier
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [isSubmitting, handleSubmit, onClose]);

  // Calculs pour l'aperçu
  const previewData = {
    effectiveCapacity: Math.round(formData.capacite * formData.utilisation / 100),
    daysUntilMaintenance: formData.prochaineMaintenance 
      ? Math.ceil((new Date(formData.prochaineMaintenance).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0,
    isMaintenanceUrgent: formData.prochaineMaintenance 
      ? new Date(formData.prochaineMaintenance) <= new Date()
      : false
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
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
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-white"
            disabled={isSubmitting}
            title="Fermer (Échap)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6" onKeyDown={handleKeyPress}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Colonne gauche - Informations principales */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Informations principales
              </h3>

              {/* Nom de la machine */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la machine *
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.nom ? 'border-red-500 bg-red-50' : 'border-gray-300'
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

              {/* Type de machine */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de machine *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.type ? 'border-red-500 bg-red-50' : 'border-gray-300'
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

              {/* Capacité et Utilisation */}
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.capacite ? 'border-red-500 bg-red-50' : 'border-gray-300'
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.utilisation ? 'border-red-500 bg-red-50' : 'border-gray-300'
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

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut de la machine
                </label>
                <div className="space-y-2">
                  {STATUS_OPTIONS.map(option => (
                    <label key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
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

            {/* Colonne droite - Dates et aperçu */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Planification et aperçu
              </h3>

              {/* Dates */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dernière révision *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      value={formData.derniereRevision}
                      onChange={(e) => handleInputChange('derniereRevision', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.derniereRevision ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.derniereRevision && (
                    <p className="mt-1 text-xs text-red-600 flex items-start">
                      <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0 mt-0.5" />
                      {errors.derniereRevision}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prochaine maintenance *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      value={formData.prochaineMaintenance}
                      onChange={(e) => handleInputChange('prochaineMaintenance', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.prochaineMaintenance ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.prochaineMaintenance && (
                    <p className="mt-1 text-xs text-red-600 flex items-start">
                      <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0 mt-0.5" />
                      {errors.prochaineMaintenance}
                    </p>
                  )}
                </div>
              </div>

              {/* Aperçu des données calculées */}
              {formData.nom && formData.type && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-lg p-4">
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
                    {formData.prochaineMaintenance && (
                      <div className="flex justify-between">
                        <span className="text-blue-700">Maintenance dans:</span>
                        <span className={`font-medium ${
                          previewData.isMaintenanceUrgent ? 'text-red-600' : 
                          previewData.daysUntilMaintenance <= 7 ? 'text-orange-600' : 'text-blue-900'
                        }`}>
                          {previewData.daysUntilMaintenance} jours
                          {previewData.isMaintenanceUrgent && " ⚠️"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Alertes de validation */}
              {previewData.isMaintenanceUrgent && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <p className="text-sm text-red-700 font-medium">
                      Maintenance urgente requise !
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Erreur générale */}
          {errors.submit && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <p><strong>💡 Astuce:</strong> Utilisez Entrée pour valider ou Échap pour annuler</p>
              <p><strong>📋 Requis:</strong> Tous les champs avec * sont obligatoires</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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