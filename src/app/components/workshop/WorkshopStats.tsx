"use client";
import { Settings, Users, Wrench, Building2 } from "lucide-react";
import { Machine, Outil, Ouvrier, Atelier } from "../../../adapters/hooks/useApi";

interface WorkshopStatsProps {
  workshopData: {
    machines: Machine[];
    outils: Outil[];
    ouvriers: Ouvrier[];
    ateliers: Atelier[];
  };
  isLoading: boolean;
  hasError: boolean;
}

export default function WorkshopStats({ workshopData, isLoading, hasError }: WorkshopStatsProps) {
  if (isLoading || hasError) return null;

  // CORRECTION: Fonctions utilitaires pour les statistiques des ouvriers avec les bons statuts
  const getOuvriersStats = () => {
    const total = workshopData.ouvriers.length;
    const disponibles = workshopData.ouvriers.filter(o => o.statut === 'disponible').length;
    const occupes = workshopData.ouvriers.filter(o => o.statut === 'occupé').length;
    const absents = workshopData.ouvriers.filter(o => o.statut === 'absent').length;   
    
    return {
      total,
      disponibles,
      occupes,
      absents,
      tauxDisponibilite: total > 0 ? Math.round((disponibles / total) * 100) : 0,
    };
  };

  const ouvriersStats = getOuvriersStats();

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Statistiques Machines */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <Settings className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Machines</p>
            <p className="text-2xl font-bold text-gray-900">{workshopData.machines.length}</p>
            <p className="text-xs text-gray-500">
              {workshopData.machines.filter(m => m.status === 'active').length} actives
            </p>
          </div>
        </div>
      </div>
      
      {/* Statistiques Outils */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <Wrench className="w-8 h-8 text-orange-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Outils</p>
            <p className="text-2xl font-bold text-gray-900">{workshopData.outils.length}</p>
            <p className="text-xs text-gray-500">
              {workshopData.outils.filter(o => o.disponible).length} disponibles
            </p>
          </div>
        </div>
      </div>
      
      {/* Statistiques Main d'œuvre - CORRIGÉ */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <Users className="w-8 h-8 text-purple-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Main d'œuvre</p>
            <p className="text-2xl font-bold text-gray-900">{workshopData.ouvriers.length}</p>
            {workshopData.ouvriers.length > 0 ? (
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex space-x-3">
                  <span className="text-green-600 font-medium">
                    {ouvriersStats.disponibles} libres
                  </span>
                  <span className="text-yellow-600 font-medium">
                    {ouvriersStats.occupes} occupés
                  </span>
                  {ouvriersStats.absents > 0 && (
                    <span className="text-red-600 font-medium">
                      {ouvriersStats.absents} absents
                    </span>
                  )}
                </div>
                <div className="text-gray-500">
                  Taux disponibilité: {ouvriersStats.tauxDisponibilite}%
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500">Aucun ouvrier</p>
            )}
          </div>
        </div>
      </div>

      {/* Statistiques Ateliers */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <Building2 className="w-8 h-8 text-green-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Ateliers</p>
            <p className="text-2xl font-bold text-gray-900">{workshopData.ateliers.length}</p>
            <p className="text-xs text-gray-500">
              {workshopData.ateliers.filter(a => a.status === 'actif').length} actifs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}