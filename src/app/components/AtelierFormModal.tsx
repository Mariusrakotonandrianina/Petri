// src/app/components/AtelierComponent.tsx
import { Building2, MapPin, Users, Ruler, Edit2, Trash2, Power, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useState } from "react";

interface Atelier {
  _id?: string;
  nom: string;
  localisation: string;
  superficie: number;
  capaciteEmployes: number;
  status: "actif" | "inactif" | "maintenance";
  createdAt?: string;
}

interface AtelierComponentProps {
  atelier: Atelier;
  onEdit: (atelier: Atelier) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export default function AtelierComponent({ atelier, onEdit, onDelete, onToggleStatus }: AtelierComponentProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case "actif":
        return { color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-4 h-4" />, label: "Actif" };
      case "maintenance":
        return { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-4 h-4" />, label: "Maintenance" };
      case "inactif":
        return { color: "bg-red-100 text-red-800", icon: <AlertCircle className="w-4 h-4" />, label: "Inactif" };
      default:
        return { color: "bg-gray-100 text-gray-800", icon: <Power className="w-4 h-4" />, label: "Inconnu" };
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    if (!window.confirm(`Supprimer l'atelier "${atelier.nom}" ?`)) return;
    setIsDeleting(true);
    try {
      await onDelete(atelier._id || "");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      await onToggleStatus(atelier._id || "");
    } finally {
      setIsToggling(false);
    }
  };

  const statusConfig = getStatusConfig(atelier.status);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{atelier.nom}</h3>
            <p className="text-sm text-gray-600 flex items-center">
              <MapPin className="w-4 h-4 mr-1" /> {atelier.localisation}
            </p>
          </div>
        </div>
        <div className="flex space-x-1">
          <button onClick={() => onEdit(atelier)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={handleDelete} disabled={isDeleting} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
            {isDeleting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Statut */}
      <div className="flex justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">Statut</span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${statusConfig.color}`}>
          {statusConfig.icon}
          <span>{statusConfig.label}</span>
        </span>
      </div>

      {/* Infos principales */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <Users className="w-4 h-4 text-gray-600 mx-auto mb-1" />
          <span className="text-lg font-bold">{atelier.capaciteEmployes}</span>
          <span className="text-xs text-gray-600 block">Employés max</span>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <Ruler className="w-4 h-4 text-gray-600 mx-auto mb-1" />
          <span className="text-lg font-bold">{atelier.superficie} m²</span>
          <span className="text-xs text-gray-600 block">Superficie</span>
        </div>
      </div>

      {/* Bouton action */}
      <div className="mt-6">
        <button
          onClick={handleToggleStatus}
          disabled={isToggling}
          className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            atelier.status === "actif" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          {isToggling ? "Changement..." : atelier.status === "actif" ? "Mettre en maintenance" : "Activer"}
        </button>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
        <span>ID: {atelier._id}</span>
        {atelier.createdAt && <span>Créé le {new Date(atelier.createdAt).toLocaleDateString()}</span>}
      </div>
    </div>
  );
}
