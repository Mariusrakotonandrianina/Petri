// src/app/components/ouvrierComponents.tsx - Composant ouvrier avec logique cohérente
"use client";
import { Users, Edit, Trash2, Clock, Award, User, CheckCircle, XCircle, AlertTriangle, Coffee } from "lucide-react";

// Types unifiés
type NiveauOuvrier = 'Débutant' | 'Intermédiaire' | 'Expert';
type StatutOuvrier = 'disponible' | 'occupé' | 'absent';

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
    // Champs dépréciés pour compatibilité
    disponible?: boolean;
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
  
  // Normalisation du statut (logique cohérente)
  const getStatutNormalise = (): StatutOuvrier => {
    if (ouvrier.statut) {
      return ouvrier.statut;
    }
    // Compatibilité avec l'ancien système
    if (ouvrier.disponible === false) {
      return 'occupé';
    }
    return 'disponible';
  };

  const statut = getStatutNormalise();
  const isDisponible = statut === 'disponible';
  
  // Calcul du pourcentage de progression des heures de travail
  const progressPercentage = ouvrier.heuresJour && ouvrier.heuresMax 
    ? Math.round((ouvrier.heuresJour / ouvrier.heuresMax) * 100) 
    : 0;

  // Configuration des couleurs et icônes selon le statut
  const getStatusConfig = () => {
    switch (statut) {
      case 'disponible':
        return {
          color: 'bg-green-100 text-green-800',
          text: '🟢 Disponible',
          icon: CheckCircle,
          buttonColor: 'bg-red-100 text-red-700 hover:bg-red-200',
          buttonText: 'Marquer occupé',
          buttonIcon: XCircle
        };
      case 'occupé':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          text: '🟡 Occupé',
          icon: Clock,
          buttonColor: 'bg-green-100 text-green-700 hover:bg-green-200',
          buttonText: 'Libérer',
          buttonIcon: CheckCircle
        };
      case 'absent':
        return {
          color: 'bg-gray-100 text-gray-800',
          text: '🔴 Absent',
          icon: Coffee,
          buttonColor: 'bg-green-100 text-green-700 hover:bg-green-200',
          buttonText: 'Marquer disponible',
          buttonIcon: CheckCircle
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          text: '❓ Inconnu',
          icon: AlertTriangle,
          buttonColor: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
          buttonText: 'Actualiser',
          buttonIcon: CheckCircle
        };
    }
  };

  const statusConfig = getStatusConfig();

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

  // Détection des alertes
  const getAlertes = () => {
    const alertes = [];
    
    if (progressPercentage >= 100) {
      alertes.push({ type: 'error', message: 'Dépassement horaire' });
    } else if (progressPercentage >= 90) {
      alertes.push({ type: 'warning', message: 'Surcharge de travail' });
    }
    
    if (statut === 'occupé' && !ouvrier.tacheActuelle?.trim()) {
      alertes.push({ type: 'warning', message: 'Aucune tâche spécifiée' });
    }
    
    return alertes;
  };

  const alertes = getAlertes();

  // Nom complet pour l'affichage
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

      {/* Alertes */}
      {alertes.length > 0 && (
        <div className="mb-4 space-y-2">
          {alertes.map((alerte, index) => (
            <div 
              key={index}
              className={`p-2 rounded-lg text-xs flex items-center ${
                alerte.type === 'error' 
                  ? 'bg-red-50 border border-red-200 text-red-800' 
                  : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
              }`}
            >
              <AlertTriangle className="w-3 h-3 mr-1" />
              {alerte.message}
            </div>
          ))}
        </div>
      )}

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

      {/* Informations sur les heures de travail */}
      {(ouvrier.heuresJour !== undefined || ouvrier.heuresMax !== undefined) && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Heures travaillées
            </span>
            <span className="text-sm text-gray-600">
              {ouvrier.heuresJour || 0}h
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
              <div className={`text-xs text-right ${
                progressPercentage >= 90 ? 'text-red-600 font-medium' :
                progressPercentage >= 75 ? 'text-yellow-600' :
                'text-gray-500'
              }`}>
                Charge de travail: {progressPercentage}%
                {progressPercentage >= 100 && ' (DÉPASSEMENT!)'}
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
            Compétences ({ouvrier.competences.length}):
          </p>
          <div className="flex flex-wrap gap-1">
            {ouvrier.competences.slice(0, 4).map((competence, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-medium"
              >
                {competence}
              </span>
            ))}
            {ouvrier.competences.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                +{ouvrier.competences.length - 4} autres
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
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${statusConfig.buttonColor}`}
        >
          <statusConfig.buttonIcon className="w-4 h-4 mr-1" />
          {statusConfig.buttonText}
        </button>
        
        <button
          onClick={() => onDelete(ouvrier._id)}
          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors flex items-center justify-center"
          title={`Supprimer ${nomComplet}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Footer avec informations supplémentaires */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <User className="w-3 h-3 mr-1" />
              <span>ID: {ouvrier._id.slice(-6)}</span>
            </div>
            {ouvrier.createdAt && (
              <span>
                Ajouté: {new Date(ouvrier.createdAt).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {progressPercentage > 0 && (
              <span className={`font-medium ${
                progressPercentage >= 100 ? 'text-red-600' :
                progressPercentage >= 90 ? 'text-red-600' :
                progressPercentage >= 75 ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {progressPercentage}% charge
              </span>
            )}
            
            {ouvrier.updatedAt && ouvrier.updatedAt !== ouvrier.createdAt && (
              <span>
                Modifié: {new Date(ouvrier.updatedAt).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>
        </div>
        
        {/* Indicateurs visuels de statut */}
        <div className="mt-2 flex justify-between items-center">
          <div className="flex space-x-1">
            {/* Indicateur de niveau */}
            {ouvrier.niveau && (
              <div className={`w-2 h-2 rounded-full ${
                ouvrier.niveau === 'Expert' ? 'bg-purple-500' :
                ouvrier.niveau === 'Intermédiaire' ? 'bg-blue-500' :
                'bg-yellow-500'
              }`} title={`Niveau: ${ouvrier.niveau}`}></div>
            )}
            
            {/* Indicateur de statut */}
            <div className={`w-2 h-2 rounded-full ${
              statut === 'disponible' ? 'bg-green-500' :
              statut === 'occupé' ? 'bg-yellow-500' :
              'bg-gray-500'
            }`} title={`Statut: ${statut}`}></div>
            
            {/* Indicateur de charge de travail */}
            {progressPercentage >= 75 && (
              <div className={`w-2 h-2 rounded-full ${
                progressPercentage >= 100 ? 'bg-red-600' :
                progressPercentage >= 90 ? 'bg-red-500' : 
                'bg-yellow-500'
              }`} title={`Charge élevée: ${progressPercentage}%`}></div>
            )}
            
            {/* Indicateur de tâche manquante */}
            {statut === 'occupé' && !ouvrier.tacheActuelle?.trim() && (
              <div className="w-2 h-2 rounded-full bg-orange-500" title="Tâche non spécifiée"></div>
            )}
          </div>
          
          {/* Résumé des compétences */}
          <div className="flex items-center space-x-2 text-xs">
            {ouvrier.competences && ouvrier.competences.length > 0 && (
              <span className="text-indigo-600 font-medium">
                {ouvrier.competences.length} compétence{ouvrier.competences.length > 1 ? 's' : ''}
              </span>
            )}
            
            {statut === 'disponible' && (
              <span className="text-green-600 font-medium">Libre</span>
            )}
            
            {statut === 'occupé' && ouvrier.tacheActuelle && (
              <span className="text-yellow-600 font-medium">En activité</span>
            )}
            
            {statut === 'absent' && (
              <span className="text-gray-600 font-medium">Indisponible</span>
            )}
          </div>
        </div>
        
        {/* Barre de progression compacte en bas */}
        {progressPercentage > 0 && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}