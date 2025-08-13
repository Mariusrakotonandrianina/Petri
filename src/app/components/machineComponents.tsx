// src/app/components/machineComponents.tsx - Version corrigée
import { AlertCircle, CheckCircle, Clock, Edit2, Power, Settings, Trash2 } from "lucide-react";
import { Machine } from "../../core/entities/Machines"; // Utilise l'entité du core

interface MachineComponentProps {
  machine: Machine;
  onEdit?: (machine: Machine) => void;
  onDelete?: (id: number) => void;
  onToggleStatus?: (id: number) => void;
}

export default function MachineComponent({
  machine,
  onEdit,
  onDelete,
  onToggleStatus
}: MachineComponentProps) {
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'panne': return 'bg-red-100 text-red-800 border-red-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'panne': return <AlertCircle className="w-4 h-4" />;
      case 'maintenance': return <Clock className="w-4 h-4" />;
      default: return <Power className="w-4 h-4" />;
    }
  };

  const getActionButtonText = () => {
    switch(machine.status) {
      case 'active': return 'Mettre en maintenance';
      case 'panne': return 'Réparer';
      case 'maintenance': return 'Remettre en service';
      default: return 'Démarrer';
    }
  };

  const getActionButtonColor = () => {
    switch(machine.status) {
      case 'active': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
      case 'panne': return 'bg-green-100 text-green-700 hover:bg-green-200';
      case 'maintenance': return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      default: return 'bg-green-100 text-green-700 hover:bg-green-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const isMaintenanceNeeded = () => {
    const today = new Date();
    const maintenanceDate = new Date(machine.prochaineMaintenance);
    return maintenanceDate <= today;
  };

  const getMaintenanceWarning = () => {
    if (isMaintenanceNeeded()) {
      return 'text-red-600 font-medium';
    }
    const today = new Date();
    const maintenanceDate = new Date(machine.prochaineMaintenance);
    const daysUntilMaintenance = Math.ceil((maintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilMaintenance <= 7) {
      return 'text-orange-600 font-medium';
    }
    return 'text-gray-500';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{machine.nom}</h3>
            <p className="text-sm text-gray-600">{machine.type}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isMaintenanceNeeded() && (
            <div className="p-1 bg-red-100 rounded-full" title="Maintenance requise">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
          )}
          <button
            onClick={() => onEdit?.(machine)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete?.(machine.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
            disabled={machine.status === 'active'}
          >
            <Trash2 className={`w-4 h-4 ${machine.status === 'active' ? 'opacity-50' : ''}`} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Statut</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(machine.status)}`}>
            {getStatusIcon(machine.status)}
            <span className="capitalize">{machine.status}</span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Capacité</span>
          <span className="text-sm font-medium text-gray-900">{machine.capacite} unités/h</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Utilisation</span>
          <span className="text-sm font-medium text-gray-900">{machine.utilisation}%</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              machine.status === 'active' ? 'bg-blue-600' : 
              machine.status === 'panne' ? 'bg-red-400' : 'bg-yellow-400'
            }`}
            style={{ width: `${machine.utilisation}%` }}
          />
        </div>

        <div className="pt-2 border-t border-gray-100 space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Dernière révision:</span>
            <span>{formatDate(machine.derniereRevision)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Prochaine maintenance:</span>
            <span className={getMaintenanceWarning()}>
              {formatDate(machine.prochaineMaintenance)}
              {isMaintenanceNeeded() && " ⚠️"}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onToggleStatus?.(machine.id)}
        className={`w-full mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${getActionButtonColor()}`}
        disabled={machine.status === 'panne' && !machine.isOperational()}
      >
        {getActionButtonText()}
      </button>
    </div>
  );
}