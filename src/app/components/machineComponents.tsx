import { AlertCircle, CheckCircle, Clock, Edit2, Power, Settings, Trash2 } from "lucide-react";
import { machine } from "os";

export default function MachineComponents() {
    const defaultMachine = {
        id: 1,
        nom: "Presse d'assemblage #1",
        type: "Presse hydraulique",
        capacite: 2,
        status: "active", // active, panne, maintenance
        utilisation: 75,
        derniereRevision: "2024-01-15",
        prochaineMaintenance: "2024-03-15",
        ...machine
      };
    
      const getStatusColor = (status: any) => {
        switch(status) {
          case 'active': return 'bg-green-100 text-green-800 border-green-200';
          case 'panne': return 'bg-red-100 text-red-800 border-red-200';
          case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
          default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
      };
    
      const getStatusIcon = (status: any) => {
        switch(status) {
          case 'active': return <CheckCircle className="w-4 h-4" />;
          case 'panne': return <AlertCircle className="w-4 h-4" />;
          case 'maintenance': return <Clock className="w-4 h-4" />;
          default: return <Power className="w-4 h-4" />;
        }
      };
    
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{defaultMachine.nom}</h3>
                <p className="text-sm text-gray-600">{defaultMachine.type}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
    
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Statut</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(defaultMachine.status)}`}>
                {getStatusIcon(defaultMachine.status)}
                <span className="capitalize">{defaultMachine.status}</span>
              </span>
            </div>
    
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Capacité</span>
              <span className="text-sm font-medium text-gray-900">{defaultMachine.capacite} unités/h</span>
            </div>
    
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Utilisation</span>
              <span className="text-sm font-medium text-gray-900">{defaultMachine.utilisation}%</span>
            </div>
    
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${defaultMachine.utilisation}%` }}
              ></div>
            </div>
    
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Dernière révision: {defaultMachine.derniereRevision}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                <span>Prochaine maintenance: {defaultMachine.prochaineMaintenance}</span>
              </div>
            </div>
          </div>
    
          <button
            className={`w-full mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              defaultMachine.status === 'active' 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {defaultMachine.status === 'active' ? 'Arrêter' : 'Démarrer'}
          </button>
        </div>
      );
}