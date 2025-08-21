"use client";
import { Building2, Users, Ruler, Cog } from "lucide-react";
import { Atelier } from "../../../adapters/hooks/useAtelierApi";

interface WorkshopStatsAteliersProps {
  workshopData: {
    ateliers: Atelier[];
  };
  isLoading: boolean;
  hasError: boolean;
}

export function WorkshopStatsAteliers({ workshopData, isLoading, hasError }: WorkshopStatsAteliersProps) {
  if (isLoading || hasError) return null;

  const getAtelierStats = () => {
    const total = workshopData.ateliers.length;
    const actifs = workshopData.ateliers.filter(a => a.status === 'actif').length;
    const fermes = workshopData.ateliers.filter(a => a.status === 'ferme').length;
    const maintenance = workshopData.ateliers.filter(a => a.status === 'maintenance').length;
    
    const superficieTotale = workshopData.ateliers.reduce((sum, a) => sum + a.superficie, 0);
    const capaciteTotale = workshopData.ateliers.reduce((sum, a) => sum + a.capaciteEmployes, 0);
    const ouvriersActuels = workshopData.ateliers.reduce((sum, a) => sum + (a.ouvrierActuelle || 0), 0);
    
    return {
      total,
      actifs,
      fermes,
      maintenance,
      superficieTotale,
      capaciteTotale,
      ouvriersActuels,
      tauxOccupation: capaciteTotale > 0 ? Math.round((ouvriersActuels / capaciteTotale) * 100) : 0
    };
  };

  const stats = getAtelierStats();

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Statistiques Ateliers */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <Building2 className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Ateliers</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex space-x-3">
                <span className="text-green-600 font-medium">{stats.actifs} actifs</span>
                <span className="text-yellow-600 font-medium">{stats.maintenance} maintenance</span>
                {stats.fermes > 0 && (
                  <span className="text-red-600 font-medium">{stats.fermes} fermés</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Statistiques Superficie */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <Ruler className="w-8 h-8 text-green-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Superficie totale</p>
            <p className="text-2xl font-bold text-gray-900">{stats.superficieTotale.toLocaleString()}</p>
            <p className="text-xs text-gray-500">m²</p>
          </div>
        </div>
      </div>

      {/* Statistiques Capacité */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <Users className="w-8 h-8 text-purple-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Capacité</p>
            <p className="text-2xl font-bold text-gray-900">{stats.capaciteTotale}</p>
            <p className="text-xs text-gray-500">employés max</p>
          </div>
        </div>
      </div>

      {/* Statistiques Occupation */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <Cog className="w-8 h-8 text-orange-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Occupation</p>
            <p className="text-2xl font-bold text-gray-900">{stats.ouvriersActuels}/{stats.capaciteTotale}</p>
            <p className="text-xs text-gray-500">{stats.tauxOccupation}% utilisé</p>
          </div>
        </div>
      </div>
    </div>
  );
}