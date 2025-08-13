import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

// Type definition for Machine
interface Machine {
  id: number;
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

const MachineFormModal: React.FC<MachineFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  machine,
  title
}) => {
  const [formData, setFormData] = useState({
    nom: '',
    type: '',
    capacite: 1,
    status: 'active' as "active" | "panne" | "maintenance",
    utilisation: 0,
    derniereRevision: '',
    prochaineMaintenance: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const machineTypes = [
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
    'Poste de soudure'
  ];

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
  }, [machine, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    } else if (formData.nom.trim().length < 3) {
      newErrors.nom = 'Le nom doit contenir au moins 3 caractères';
    }

    if (!formData.type.trim()) {
      newErrors.type = 'Le type est requis';
    }

    if (formData.capacite <= 0) {
      newErrors.capacite = 'La capacité doit être supérieure à 0';
    } else if (formData.capacite > 100) {
      newErrors.capacite = 'La capacité ne peut pas dépasser 100 unités/h';
    }

    if (formData.utilisation < 0) {
      newErrors.utilisation = 'L\'utilisation ne peut pas être négative';
    } else if (formData.utilisation > 100) {
      newErrors.utilisation = 'L\'utilisation ne peut pas dépasser 100%';
    }

    if (!formData.derniereRevision) {
      newErrors.derniereRevision = 'La date de révision est requise';
    } else {
      const revisionDate = new Date(formData.derniereRevision);
      const today = new Date();
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSubmit = machine 
        ? { ...machine, ...formData }
        : { ...formData, id: Date.now() + Math.random() };
      
      await onSubmit(dataToSubmit);
      onClose();
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Erreur lors de la sauvegarde'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4" onKeyPress={handleKeyPress}>
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
              {machineTypes.map(type => (
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

          {/* Capacité et Utilisation - Ligne double */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacité (u/h) *
              </label>
              <input
                type="number"
                min="1"
                max="100"
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
                disabled={isSubmitting}
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
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as "active" | "panne" | "maintenance")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={isSubmitting}
            >
              <option value="active">🟢 Actif</option>
              <option value="panne">🔴 En panne</option>
              <option value="maintenance">🟡 En maintenance</option>
            </select>
          </div>

          {/* Dates - Ligne double */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dernière révision *
              </label>
              <input
                type="date"
                value={formData.derniereRevision}
                onChange={(e) => handleInputChange('derniereRevision', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.derniereRevision ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
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
              <input
                type="date"
                value={formData.prochaineMaintenance}
                onChange={(e) => handleInputChange('prochaineMaintenance', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.prochaineMaintenance ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.prochaineMaintenance && (
                <p className="mt-1 text-xs text-red-600 flex items-start">
                  <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0 mt-0.5" />
                  {errors.prochaineMaintenance}
                </p>
              )}
            </div>
          </div>

          {/* Aperçu des informations calculées */}
          {formData.nom && formData.type && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Aperçu</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Machine:</strong> {formData.nom} ({formData.type})</p>
                <p><strong>Capacité totale:</strong> {formData.capacite} unités/h</p>
                <p><strong>Capacité effective:</strong> {Math.round(formData.capacite * formData.utilisation / 100)} unités/h</p>
                {formData.derniereRevision && formData.prochaineMaintenance && (
                  <p><strong>Prochaine maintenance dans:</strong> {
                    Math.ceil((new Date(formData.prochaineMaintenance).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  } jours</p>
                )}
              </div>
            </div>
          )}

          {/* Erreur générale */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {errors.submit}
              </p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(errors).length > 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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

          {/* Aide utilisateur */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p><strong>💡 Conseil:</strong> Utilisez Entrée pour valider ou Échap pour annuler</p>
            <p><strong>📋 Requis:</strong> Tous les champs avec * sont obligatoires</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineFormModal;