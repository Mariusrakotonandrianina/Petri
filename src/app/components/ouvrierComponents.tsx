import { Edit2, Trash2, Users } from "lucide-react";

interface OuvrierComponentsProps {
  operateur?: {
    id: number;
    nom: string;
    specialite: string;
    niveau: "Expert" | "Confirmé" | "Débutant";
    statut: "disponible" | "occupe" | "pause";
    tacheActuelle?: string | null;
    heuresJour?: number;
    heuresMax?: number;
    competences?: string[];
  };
  onEdit?: (operateur: any) => void;
  onDelete?: (id: number) => void;
  onAssigner?: (id: number) => void;
}

export default function OuvrierComponents({ 
  operateur, 
  onEdit, 
  onDelete, 
  onAssigner 
}: OuvrierComponentsProps) {
  const defaultOperateur = {
    id: 1,
    nom: "Jean Dupont",
    specialite: "Assemblage",
    niveau: "Expert" as const,
    statut: "disponible" as const,
    tacheActuelle: null,
    heuresJour: 6.5,
    heuresMax: 8,
    competences: ["Assemblage", "Montage moteur", "Contrôle qualité"],
    ...operateur
  };

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
      case 'Expert': return 'text-purple-600 bg-purple-50';
      case 'Confirmé': return 'text-blue-600 bg-blue-50';
      case 'Débutant': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{defaultOperateur.nom}</h3>
            <p className="text-sm text-gray-600">{defaultOperateur.specialite}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit?.(defaultOperateur)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete?.(defaultOperateur.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Statut</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatutColor(defaultOperateur.statut)}`}>
            {defaultOperateur.statut}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Niveau</span>
          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getNiveauColor(defaultOperateur.niveau)}`}>
            {defaultOperateur.niveau}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Heures aujourd'hui</span>
          <span className="text-sm font-medium text-gray-900">{defaultOperateur.heuresJour}h / {defaultOperateur.heuresMax}h</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(defaultOperateur.heuresJour / defaultOperateur.heuresMax) * 100}%` }}
          ></div>
        </div>

        {defaultOperateur.tacheActuelle && (
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-sm text-gray-600 mb-1">Tâche actuelle:</div>
            <div className="text-sm font-medium text-blue-800">{defaultOperateur.tacheActuelle}</div>
          </div>
        )}

        <div className="pt-2 border-t border-gray-100">
          <div className="text-sm text-gray-600 mb-2">Compétences:</div>
          <div className="flex flex-wrap gap-1">
            {defaultOperateur.competences.map((comp, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {comp}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => onAssigner?.(defaultOperateur.id)}
        disabled={defaultOperateur.statut === 'occupe'}
        className={`w-full mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          defaultOperateur.statut !== 'occupe' 
            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {defaultOperateur.statut !== 'occupe' ? 'Assigner tâche' : 'Occupé'}
      </button>
    </div>
  );
}