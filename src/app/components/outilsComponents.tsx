import { Edit2, Trash2, Wrench, AlertTriangle, Info } from "lucide-react";

interface Outil {
  _id?: string;
  id?: number;
  nom: string;
  type: string;
  quantite: number;
  disponible: number;
  enUse: number;
  etat?: "bon" | "usure" | "reparation" | string;
  derniereVerification?: string;
  prochaineVerification?: string;
}

interface OutilComponentProps {
  outil: Outil;
  onEdit?: (outil: Outil) => void;
  onDelete?: (id: string | number) => void;
  onReserver?: (id: string | number) => void;
}

export default function OutilComponent({
  outil,
  onEdit,
  onDelete,
  onReserver
}: OutilComponentProps) {

  const getEtatColor = (etat: string) => {
    switch(etat) {
      case "bon": return "bg-green-100 text-green-800 border-green-200";
      case "usure": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "reparation": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getIconColor = () => {
    switch(outil.etat) {
      case "bon": return "text-orange-600";
      case "usure": return "text-yellow-600";
      case "reparation": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "—";
    const d = new Date(date);
    return isNaN(d.getTime()) ? date : d.toLocaleDateString("fr-FR");
  };

  const etat = outil.etat ?? "inconnu";
  const isReservable = outil.disponible > 0 && etat === "bon";
  const utilisationPourcentage = outil.quantite > 0 
    ? (outil.enUse / outil.quantite) * 100 
    : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            {etat === "reparation" 
              ? <AlertTriangle className={`w-6 h-6 ${getIconColor()}`} />
              : <Wrench className={`w-6 h-6 ${getIconColor()}`} />
            }
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{outil.nom}</h3>
            <p className="text-sm text-gray-600">{outil.type}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit?.(outil)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete?.(outil._id ?? outil.id!)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Infos principales */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">État</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getEtatColor(etat)}`}>
            {etat}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-lg font-semibold text-gray-900">{outil.quantite}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div className="bg-green-50 rounded-lg p-2">
            <div className="text-lg font-semibold text-green-600">{outil.disponible}</div>
            <div className="text-xs text-gray-600">Disponible</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-2">
            <div className="text-lg font-semibold text-blue-600">{outil.enUse}</div>
            <div className="text-xs text-gray-600">En usage</div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${utilisationPourcentage}%` }}
          />
        </div>

        {/* Dates de vérification */}
        <div className="pt-2 border-t border-gray-100 space-y-1 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>Dernière vérif.:</span>
            <span>{formatDate(outil.derniereVerification)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Prochaine vérif.:</span>
            <span>{formatDate(outil.prochaineVerification)}</span>
          </div>
        </div>
      </div>

      {/* Bouton réserver */}
      <button
        onClick={() => onReserver?.(outil._id ?? outil.id!)}
        disabled={!isReservable}
        className={`w-full mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isReservable
            ? "bg-blue-100 text-blue-700 hover:bg-blue-200" 
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        {etat === "reparation" 
          ? "En réparation" 
          : outil.disponible > 0 
            ? "Réserver" 
            : "Non disponible"
        }
      </button>
    </div>
  );
}
