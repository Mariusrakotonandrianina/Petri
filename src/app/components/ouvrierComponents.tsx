// components/OperateurComponent.tsx
import { Edit2, Trash2, Users, Clock, Coffee } from "lucide-react";
import { Ouvrier } from "../data/ouvrierData";

interface OperateurComponentProps {
  operateur: Ouvrier;
  onEdit?: (operateur: Ouvrier) => void;
  onDelete?: (id: number) => void;
  onAssigner?: (id: number) => void;
}

export default function OperateurComponent({
  operateur,
  onEdit,
  onDelete,
  onAssigner
}: OperateurComponentProps) {

  const getStatutColor = (statut: string) => {
    switch(statut) {
      case 'disponible': return 'bg-green-100 text-green-800 border-green-200';
      case 'occupe': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pause': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNiveauColor = (niveau: string) => {
    switch(niveau) {
      case 'Expert': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Confirmé': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Débutant': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getIconColor = () => {
    switch(operateur.statut) {
      case 'disponible': return 'text-green-600';
      case 'occupe': return 'text-blue-600';
      case 'pause': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getProgressBarColor = () => {
    const percentage = (operateur.heuresJour / operateur.heuresMax) * 100;
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 75) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  const canAssignTask = operateur.statut === 'disponible' || operateur.statut === 'pause';

  const getActionButtonText = () => {
    switch(operateur.statut) {
      case 'occupe': return 'Occupé';
      case 'pause': return 'Reprendre service';
      default: return 'Assigner tâche';
    }
  };

  const getActionButtonColor = () => {
    switch(operateur.statut) {
      case 'occupe': return 'bg-gray-100 text-gray-400';
      case 'pause': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
      default: return 'bg-green-100 text-green-700 hover:bg-green-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            {operateur.statut === 'pause' ? (
              <Coffee className={`w-6 h-6 ${getIconColor()}`} />
            ) : operateur.statut === 'occupe' ? (
              <Clock className={`w-6 h-6 ${getIconColor()}`} />
            ) : (
              <Users className={`w-6 h-6 ${getIconColor()}`} />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{operateur.nom}</h3>
            <p className="text-sm text-gray-600">{operateur.specialite}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit?.(operateur)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete?.(operateur.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Statut</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatutColor(operateur.statut)}`}>
            {operateur.statut}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Niveau</span>
          <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getNiveauColor(operateur.niveau)}`}>
            {operateur.niveau}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Heures aujourd'hui</span>
          <span className="text-sm font-medium text-gray-900">
            {operateur.heuresJour}h / {operateur.heuresMax}h
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
            style={{ width: `${(operateur.heuresJour / operateur.heuresMax) * 100}%` }}
          />
        </div>

        {operateur.tacheActuelle && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="text-sm text-gray-600 mb-1">Tâche actuelle:</div>
            <div className="text-sm font-medium text-blue-800">{operateur.tacheActuelle}</div>
          </div>
        )}

        <div className="pt-2 border-t border-gray-100">
          <div className="text-sm text-gray-600 mb-2">Compétences:</div>
          <div className="flex flex-wrap gap-1">
            {operateur.competences.map((comp, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200"
              >
                {comp}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => onAssigner?.(operateur.id)}
        disabled={!canAssignTask}
        className={`w-full mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          canAssignTask 
            ? getActionButtonColor()
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {getActionButtonText()}
      </button>
    </div>
  );
}