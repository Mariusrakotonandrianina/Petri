// src/app/components/machineComponents.tsx - Version corrigée pour API
import { AlertCircle, CheckCircle, Clock, Edit2, Power, Settings, Trash2, Calendar, Activity } from "lucide-react";

interface MachineComponentProps {
  machine: any; // Type flexible pour s'adapter à la structure de votre API
  onEdit: (machine: any) => void;
  onDelete: (id: string | number) => void;
  onToggleStatus: (id: string | number) => void;
}

export default function MachineComponent({
  machine,
  onEdit,
  onDelete,
  onToggleStatus
}: MachineComponentProps) {
  
  const getStatusConfig = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'active': 
      case 'actif':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Actif'
        };
      case 'panne': 
      case 'broken':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <AlertCircle className="w-4 h-4" />,
          label: 'En panne'
        };
      case 'maintenance': 
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Clock className="w-4 h-4" />,
          label: 'Maintenance'
        };
      default: 
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <Power className="w-4 h-4" />,
          label: 'Inconnu'
        };
    }
  };

  const getActionButtonConfig = () => {
    const status = machine.status?.toLowerCase();
    switch(status) {
      case 'active': 
      case 'actif':
        return {
          text: 'Mettre en maintenance',
          color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
          disabled: false
        };
      case 'panne': 
      case 'broken':
        return {
          text: 'Réparer et remettre en service',
          color: 'bg-green-100 text-green-700 hover:bg-green-200',
          disabled: false
        };
      case 'maintenance': 
        return {
          text: 'Remettre en service',
          color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
          disabled: false
        };
      default: 
        return {
          text: 'Démarrer',
          color: 'bg-green-100 text-green-700 hover:bg-green-200',
          disabled: false
        };
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non définie';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Date invalide';
    }
  };

  const getMaintenanceStatus = () => {
    if (!machine.prochaineMaintenance) {
      return {
        status: 'normal',
        text: 'Non programmée',
        color: 'text-gray-600',
        icon: '📅'
      };
    }

    const today = new Date();
    const maintenanceDate = new Date(machine.prochaineMaintenance);
    const daysUntilMaintenance = Math.ceil((maintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilMaintenance <= 0) {
      return {
        status: 'urgent',
        text: 'Maintenance requise !',
        color: 'text-red-600 font-semibold',
        icon: '⚠️'
      };
    } else if (daysUntilMaintenance <= 7) {
      return {
        status: 'warning',
        text: `Dans ${daysUntilMaintenance} jour${daysUntilMaintenance > 1 ? 's' : ''}`,
        color: 'text-orange-600 font-medium',
        icon: '⚡'
      };
    } else {
      return {
        status: 'normal',
        text: `Dans ${daysUntilMaintenance} jours`,
        color: 'text-gray-600',
        icon: '📅'
      };
    }
  };

  const getUtilisationColor = (utilisation: number) => {
    if (!utilisation || utilisation === 0) return 'bg-gray-400';
    if (utilisation < 30) return 'bg-red-400';
    if (utilisation < 70) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  // Calculs sécurisés pour éviter les erreurs si les méthodes n'existent pas
  const getEffectiveCapacity = () => {
    if (machine.getEffectiveCapacity && typeof machine.getEffectiveCapacity === 'function') {
      return machine.getEffectiveCapacity();
    }
    // Calcul manuel si la méthode n'existe pas
    const capacite = machine.capacite || 0;
    const utilisation = machine.utilisation || 0;
    return Math.round(capacite * utilisation / 100);
  };

  const isOperational = () => {
    if (machine.isOperational && typeof machine.isOperational === 'function') {
      return machine.isOperational();
    }
    // Logique manuelle si la méthode n'existe pas
    const status = machine.status?.toLowerCase();
    return status === 'active' || status === 'actif';
  };

  const getDaysUntilMaintenance = () => {
    if (machine.getDaysUntilMaintenance && typeof machine.getDaysUntilMaintenance === 'function') {
      return machine.getDaysUntilMaintenance();
    }
    // Calcul manuel si la méthode n'existe pas
    if (!machine.prochaineMaintenance) return 0;
    const today = new Date();
    const maintenanceDate = new Date(machine.prochaineMaintenance);
    return Math.ceil((maintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const statusConfig = getStatusConfig(machine.status);
  const actionButtonConfig = getActionButtonConfig();
  const maintenanceStatus = getMaintenanceStatus();
  const canDelete = machine.status?.toLowerCase() !== 'active' && machine.status?.toLowerCase() !== 'actif';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-200 group">
      {/* Header avec titre et actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 truncate" title={machine.nom}>
              {machine.nom || 'Machine sans nom'}
            </h3>
            <p className="text-sm text-gray-600 truncate" title={machine.type}>
              {machine.type || 'Type non défini'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 ml-2">
          {maintenanceStatus.status === 'urgent' && (
            <div className="p-1 bg-red-100 rounded-full" title="Maintenance urgente requise !">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
          )}
          <button
            onClick={() => onEdit?.(machine)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Modifier la machine"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete?.(machine.id || machine._id)}
            className={`p-2 rounded-lg transition-colors ${
              canDelete 
                ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title={canDelete ? 'Supprimer la machine' : 'Impossible de supprimer une machine active'}
            disabled={!canDelete}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Informations principales */}
      <div className="space-y-4">
        {/* Statut */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Statut</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${statusConfig.color}`}>
            {statusConfig.icon}
            <span>{statusConfig.label}</span>
          </span>
        </div>

        {/* Capacité et performance */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Activity className="w-4 h-4 text-gray-600 mr-1" />
              <span className="text-xs font-medium text-gray-600">Capacité</span>
            </div>
            <span className="text-lg font-bold text-gray-900">{machine.capacite || 0}</span>
            <span className="text-xs text-gray-600">u/h</span>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <span className="text-xs font-medium text-gray-600">Effective</span>
            </div>
            <span className="text-lg font-bold text-gray-900">{getEffectiveCapacity()}</span>
            <span className="text-xs text-gray-600">u/h</span>
          </div>
        </div>

        {/* Barre d'utilisation */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Utilisation</span>
            <span className="text-sm font-bold text-gray-900">{machine.utilisation || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${getUtilisationColor(machine.utilisation)}`}
              style={{ width: `${machine.utilisation || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bouton d'action principal */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={() => onToggleStatus?.(machine.id || machine._id)}
          disabled={actionButtonConfig.disabled}
          className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${actionButtonConfig.color} ${
            actionButtonConfig.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
          }`}
          title={actionButtonConfig.text}
        >
          <div className="flex items-center justify-center space-x-2">
            <Power className="w-4 h-4" />
            <span>{actionButtonConfig.text}</span>
          </div>
        </button>
      </div>

      {/* Informations techniques en footer */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full mr-2" 
                  style={{ backgroundColor: isOperational() ? '#10b981' : '#ef4444' }}></span>
            <span>ID: {machine.id || machine._id || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-3">
            <span title="Capacité effective">
              {getEffectiveCapacity()}/{machine.capacite || 0} u/h
            </span>
            <span title="Jours jusqu'à maintenance">
              {getDaysUntilMaintenance()}j
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}