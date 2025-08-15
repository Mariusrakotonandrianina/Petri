"use client";
import { Users, Edit, Trash2, Clock, Award, User, CheckCircle, XCircle, AlertTriangle, Coffee, UserCheck, UserX, UserMinus } from "lucide-react";

// CORRECTION: Types unifiés alignés avec le backend
type NiveauOuvrier = 'Débutant' | 'Confirmé' | 'Expert';  // Ajout de 'Confirmé'
type StatutOuvrier = 'disponible' | 'occupe' | 'absent';

interface OuvrierComponentProps {
  ouvrier: {
    _id: string;
    nom: string;
    prenom?: string;
    specialite: string;
    niveau?: NiveauOuvrier;
    competences?: string[];
    statut?: StatutOuvrier;
    tacheActuelle?: string;
    heuresJour?: number;
    heuresMax?: number;
    createdAt?: string;
    updatedAt?: string;
  };
  onEdit: (ouvrier: any) => void;
  onDelete: (id: string | number) => void;
  onToggleStatus: (id: string | number) => void;
  onChangeStatus?: (id: string | number, newStatus: StatutOuvrier) => void;
}

export default function OuvrierComponent({ 
  ouvrier, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  onChangeStatus
}: OuvrierComponentProps) {
  
  const statut = ouvrier.statut || 'disponible';
  
  // Couleur du badge de niveau - CORRECTION avec 'Confirmé'
  const getNiveauColor = () => {
    switch (ouvrier.niveau) {
      case 'Expert': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'Confirmé': return 'bg-blue-100 text-blue-800 border border-blue-200'; // Ajout de 'Confirmé'
      case 'Débutant': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Configuration des boutons selon le statut
  const getStatusConfig = () => {
    switch (statut) {
      case 'disponible':
        return {
          color: 'bg-green-100 text-green-800 border border-green-200',
          text: '🟢 Disponible',
          icon: CheckCircle,
          buttonColor: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
          buttonText: 'Marquer occupé',
          buttonIcon: Clock,
        };
      case 'occupe':
        return {
          color: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
          text: '🟡 Occupé',
          icon: Clock,
          buttonColor: 'bg-green-100 text-green-700 hover:bg-green-200',
          buttonText: 'Libérer',
          buttonIcon: CheckCircle,
        };
      case 'absent':
        return {
          color: 'bg-gray-100 text-gray-800 border border-gray-200',
          text: '🔴 Absent',
          icon: Coffee,
          buttonColor: 'bg-green-100 text-green-700 hover:bg-green-200',
          buttonText: 'Marquer disponible',
          buttonIcon: CheckCircle,
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border border-gray-200',
          text: '❓ Inconnu',
          icon: AlertTriangle,
          buttonColor: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
          buttonText: 'Actualiser',
          buttonIcon: CheckCircle,
        };
    }
  };

  const statusConfig = getStatusConfig();

  // Calculs et logique existante...
  const progressPercentage = ouvrier.heuresJour && ouvrier.heuresMax 
    ? Math.round((ouvrier.heuresJour / ouvrier.heuresMax) * 100) 
    : 0;

  const getProgressColor = () => {
    if (progressPercentage >= 100) return 'bg-red-500';
    if (progressPercentage >= 90) return 'bg-orange-500';
    if (progressPercentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const nomComplet = ouvrier.prenom 
    ? `${ouvrier.prenom} ${ouvrier.nom}` 
    : ouvrier.nom;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-200">
      {/* Header avec nom, prénom et statut */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              {nomComplet}
            </h3>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-600">{ouvrier.specialite}</p>
              {ouvrier.niveau && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNiveauColor()}`}>
                  {ouvrier.niveau}
                </span>
              )}
            </div>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
          {statusConfig.text}
        </span>
      </div>

      {/* Tâche actuelle si présente */}
      {ouvrier.tacheActuelle && statut !== 'disponible' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-800">Tâche en cours:</span>
          </div>
          <p className="text-sm text-blue-700 mt-1">{ouvrier.tacheActuelle}</p>
        </div>
      )}

      {/* Informations sur les heures */}
      {(ouvrier.heuresJour !== undefined || ouvrier.heuresMax !== undefined) && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Heures travaillées
            </span>
            <span className="text-sm text-gray-600">
              {ouvrier.heuresJour || 0}h / {ouvrier.heuresMax || 8}h
            </span>
          </div>
          {progressPercentage > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {/* Actions principales */}
      <div className="space-y-3 mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(ouvrier)}
            className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center justify-center border border-blue-200"
          >
            <Edit className="w-4 h-4 mr-1" />
            Modifier
          </button>
          
          <button
            onClick={() => onToggleStatus(ouvrier._id)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center border ${statusConfig.buttonColor}`}
          >
            <statusConfig.buttonIcon className="w-4 h-4 mr-1" />
            {statusConfig.buttonText}
          </button>
          
          <button
            onClick={() => onDelete(ouvrier._id)}
            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors flex items-center justify-center border border-red-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Boutons de statut spécifiques */}
        {onChangeStatus && (
          <div className="flex space-x-2">
            <button
              onClick={() => onChangeStatus(ouvrier._id, 'disponible')}
              disabled={statut === 'disponible'}
              className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center border ${
                statut === 'disponible' 
                  ? 'bg-green-200 text-green-800 border-green-300 cursor-not-allowed opacity-75' 
                  : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
              }`}
            >
              <UserCheck className="w-3 h-3 mr-1" />
              Disponible
            </button>
            
            <button
              onClick={() => onChangeStatus(ouvrier._id, 'occupe')}
              disabled={statut === 'occupe'}
              className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center border ${
                statut === 'occupe' 
                  ? 'bg-yellow-200 text-yellow-800 border-yellow-300 cursor-not-allowed opacity-75' 
                  : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
              }`}
            >
              <Clock className="w-3 h-3 mr-1" />
              Occupé
            </button>
            
            <button
              onClick={() => onChangeStatus(ouvrier._id, 'absent')}
              disabled={statut === 'absent'}
              className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center border ${
                statut === 'absent' 
                  ? 'bg-gray-200 text-gray-800 border-gray-300 cursor-not-allowed opacity-75' 
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <UserMinus className="w-3 h-3 mr-1" />
              Absent
            </button>
          </div>
        )}
      </div>

      {/* Footer avec informations */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>ID: {ouvrier._id.slice(-6)}</span>
          {statut === 'disponible' && (
            <span className="text-green-600 font-medium">● Libre</span>
          )}
          {statut === 'occupe' && (
            <span className="text-yellow-600 font-medium">● En activité</span>
          )}
          {statut === 'absent' && (
            <span className="text-gray-600 font-medium">● Indisponible</span>
          )}
        </div>
      </div>
    </div>
  );
}