// src/app/components/AtelierComponent.tsx
import { Building2, MapPin, Ruler, Users, Edit2, Trash2, Power, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useState } from "react";

interface Atelier {
  _id: string;
  nom: string;
  localisation: string;
  superficie: number;
  capaciteEmployes: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AtelierComponentProps {
  atelier: Atelier;
  onEdit: (atelier: Atelier) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export default function AtelierComponent({
  atelier,
  onEdit,
  onDelete,
  onToggleStatus
}: AtelierComponentProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case "actif":
        return { color: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle className="w-4 h-4" />, label: "Actif" };
      case "fermé":
        return { color: "bg-red-100 text-red-800 border-red-200", icon: <AlertCircle className="w-4 h-4" />, label: "Fermé" };
      case "maintenance":
        return { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: <Clock className="w-4 h-4" />, label: "Maintenance" };
      default:
        return { color: "bg-gray-100 text-gray-800 border-gray-200", icon: <Power className="w-4 h-4" />, label: "Inconnu" };
    }
  };

  const handleEdit = () => onEdit(atelier);

  const handleDelete = async () => {
    if (isDeleting) return;
    if (atelier.status?.toLowerCase() === "actif") {
      alert("Impossible de supprimer un atelier actif. Mettez-le en maintenance ou fermez-le d'abord.");
      return;
    }
    if (window.confirm(`Supprimer définitivement l'atelier "${atelier.nom}" ?`)) {
      setIsDeleting(true);
      try {
        await onDelete(atelier._id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleToggleStatus = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      await onToggleStatus(atelier._id);
    } finally {
      setIsToggling(false);
    }
  };

  const statusConfig = getStatusConfig(atelier.status);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{atelier.nom}</h3>
            <p className="text-sm text-gray-600 flex items-center">
              <MapPin className="w-4 h-4 mr-1" /> {atelier.localisation}
            </p>
          </div>
        </div>
        <div className="flex space-x-1">
          <button onClick={handleEdit} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={atelier.status?.toLowerCase() === "actif" || isDeleting}
            className={`p-2 rounded-lg ${atelier.status?.toLowerCase() === "actif" ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-red-600 hover:bg-red-50"}`}
          >
            {isDeleting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Informations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Statut</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${statusConfig.color}`}>
            {statusConfig.icon}
            <span>{statusConfig.label}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Ruler className="w-4 h-4 text-gray-600 mx-auto mb-1" />
            <span className="text-lg font-bold">{atelier.superficie}</span>
            <span className="text-xs text-gray-600"> m²</span>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Users className="w-4 h-4 text-gray-600 mx-auto mb-1" />
            <span className="text-lg font-bold">{atelier.capaciteEmployes}</span>
            <span className="text-xs text-gray-600"> employés</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6">
        <button
          onClick={handleToggleStatus}
          disabled={isToggling}
          className="w-full px-4 py-3 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
        >
          {isToggling ? "Changement en cours..." : "Changer le statut"}
        </button>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
        Créé le : {atelier.createdAt ? new Date(atelier.createdAt).toLocaleDateString() : "N/A"}
      </div>
    </div>
  );
}
