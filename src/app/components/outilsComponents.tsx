import { Edit2, Trash2, Wrench } from "lucide-react";

export default function OutilsComponents() {
    
  const defaultOutil = {
    id: 1,
    nom: "Clé dynamométrique #3",
    type: "Outil spécialisé",
    quantite: 2,
    disponible: 1,
    enUse: 1,
    etat: "bon", // bon, usure, reparation
    derniereVerification: "2024-02-01",
    prochaineVerification: "2024-04-01",
    // ...outil (removed as 'outil' is not defined)
  };

  const getEtatColor = (etat: string) => {
    switch(etat) {
      case 'bon': return 'bg-green-100 text-green-800 border-green-200';
      case 'usure': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reparation': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
    return (<div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Wrench className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{defaultOutil.nom}</h3>
                <p className="text-sm text-gray-600">{defaultOutil.type}</p>
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
              <span className="text-sm text-gray-600">État</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getEtatColor(defaultOutil.etat)}`}>
                {defaultOutil.etat}
              </span>
            </div>
    
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-lg font-semibold text-gray-900">{defaultOutil.quantite}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <div className="text-lg font-semibold text-green-600">{defaultOutil.disponible}</div>
                <div className="text-xs text-gray-600">Disponible</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="text-lg font-semibold text-blue-600">{defaultOutil.enUse}</div>
                <div className="text-xs text-gray-600">En usage</div>
              </div>
            </div>
    
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Dernière vérif.: {defaultOutil.derniereVerification}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                <span>Prochaine vérif.: {defaultOutil.prochaineVerification}</span>
              </div>
            </div>
          </div>
    
          <button
            disabled={defaultOutil.disponible === 0}
            className={`w-full mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              defaultOutil.disponible > 0 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {defaultOutil.disponible > 0 ? 'Réserver' : 'Non disponible'}
          </button>
        </div>
    );
}