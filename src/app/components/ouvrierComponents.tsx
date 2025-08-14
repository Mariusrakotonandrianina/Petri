// src/app/components/OuvrierComponents.tsx - Module Ouvrier avec structure cohérente
"use client";
import { Users, Edit, Trash2, Clock, Award, User, CheckCircle, XCircle } from "lucide-react";
import { Ouvrier } from "../../adapters/hooks/useApi";

interface OuvrierComponentProps {
  ouvrier: {
    _id: string;
    nom: string;
    prenom?: string;
    specialite: string;
    niveau?: 'Débutant' | 'Intermédiaire' | 'Expert';
    competences?: string[];
    disponible?: boolean;
    statut?: 'disponible' | 'occupé' | 'absent';
    tacheActuelle?: string;
    heuresJour?: number;
    heuresTravail?: number;
    heuresMax?: number;
    createdAt?: string;
    updatedAt?: string;
  };
  onEdit: (ouvrier: any) => void;
  onDelete: (id: string | number) => void;
  onToggleStatus: (id: string | number) => void;
}

export default function OuvrierComponent({ 
  ouvrier, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: OuvrierComponentProps) {
  // Détermination du statut de disponibilité
  const isDisponible = ouvrier.statut === 'disponible' || ouvrier.disponible;
  
  // Calcul du pourcentage de progression des heures de travail
  const progressPercentage = ouvrier.heuresJour && ouvrier.heuresMax 
    ? Math.round((ouvrier.heuresJour / ouvrier.heuresMax) * 100) 
    : 0;

  // Couleur du badge de statut
  const getStatusColor = () => {
    if (ouvrier.statut === 'absent') return 'bg-gray-100 text-gray-800';
    return isDisponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Texte du statut
  const getStatusText = () => {
    if (ouvrier.statut === 'absent') return '⏸ Absent';
    return isDisponible ? '✓ Disponible' : '✗ Occupé';
  };

  // Couleur du badge de niveau
  const getNiveauColor = () => {
    switch (ouvrier.niveau) {
      case 'Expert': return 'bg-purple-100 text-purple-800';
      case 'Intermédiaire': return 'bg-blue-100 text-blue-800';
      case 'Débutant': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Couleur de la barre de progression
  const getProgressColor = () => {
    if (progressPercentage >= 90) return 'bg-red-500';
    if (progressPercentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

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
              {ouvrier.prenom ? `${ouvrier.prenom} ${ouvrier.nom}` : ouvrier.nom}
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
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Tâche actuelle si présente */}
      {ouvrier.tacheActuelle && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-yellow-600 mr-2" />
            <span className="text-sm font-medium text-yellow-800">Tâche en cours:</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">{ouvrier.tacheActuelle}</p>
        </div>
      )}

      {/* Informations sur les heures de travail */}
      {(ouvrier.heuresJour !== undefined || ouvrier.heuresTravail !== undefined) && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Heures travaillées
            </span>
            <span className="text-sm text-gray-600">
              {ouvrier.heuresJour || ouvrier.heuresTravail || 0}h
              {ouvrier.heuresMax && ` / ${ouvrier.heuresMax}h`}
            </span>
          </div>
          {ouvrier.heuresMax && progressPercentage > 0 && (
            <>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 text-right">
                Charge de travail: {progressPercentage}%
              </div>
            </>
          )}
        </div>
      )}

      {/* Compétences */}
      {ouvrier.competences && ouvrier.competences.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Award className="w-4 h-4 mr-1" />
            Compétences:
          </p>
          <div className="flex flex-wrap gap-1">
            {ouvrier.competences.slice(0, 3).map((competence, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-medium"
              >
                {competence}
              </span>
            ))}
            {ouvrier.competences.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                +{ouvrier.competences.length - 3} autres
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => onEdit(ouvrier)}
          className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center justify-center"
        >
          <Edit className="w-4 h-4 mr-1" />
          Modifier
        </button>
        <button
          onClick={() => onToggleStatus(ouvrier._id)}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
            isDisponible
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {isDisponible ? (
            <>
              <XCircle className="w-4 h-4 mr-1" />
              Occuper
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-1" />
              Libérer
            </>
          )}
        </button>
        <button
          onClick={() => onDelete(ouvrier._id)}
          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors flex items-center justify-center"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Footer avec informations supplémentaires */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center">
            <User className="w-3 h-3 mr-1" />
            <span>ID: {ouvrier._id.slice(-6)}</span>
          </div>
          <div className="flex items-center space-x-3">
            {progressPercentage > 0 && (
              <span className={`font-medium ${
                progressPercentage >= 90 ? 'text-red-600' :
                progressPercentage >= 75 ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {progressPercentage}% charge
              </span>
            )}
            {ouvrier.createdAt && (
              <span>
                Ajouté: {new Date(ouvrier.createdAt).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>
        </div>
        
        {/* Indicateurs de performance si disponibles */}
        {(progressPercentage > 0 || ouvrier.competences?.length) && (
          <div className="mt-2 flex justify-between items-center">
            <div className="flex space-x-2">
              {ouvrier.niveau && (
                <div className={`w-2 h-2 rounded-full ${
                  ouvrier.niveau === 'Expert' ? 'bg-purple-500' :
                  ouvrier.niveau === 'Intermédiaire' ? 'bg-blue-500' :
                  'bg-yellow-500'
                }`} title={`Niveau: ${ouvrier.niveau}`}></div>
              )}
              {isDisponible && (
                <div className="w-2 h-2 rounded-full bg-green-500" title="Disponible"></div>
              )}
              {progressPercentage >= 75 && (
                <div className={`w-2 h-2 rounded-full ${
                  progressPercentage >= 90 ? 'bg-red-500' : 'bg-yellow-500'
                }`} title={`Charge élevée: ${progressPercentage}%`}></div>
              )}
            </div>
            {ouvrier.competences && (
              <span className="text-xs text-indigo-600 font-medium">
                {ouvrier.competences.length} compétence{ouvrier.competences.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}