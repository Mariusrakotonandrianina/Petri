"use client";
import { Wrench } from "lucide-react";
import { Outil } from "../../../adapters/hooks/useApi";

interface OutilsListProps {
  outils: Outil[];
  isLoading: boolean;
  hasError: boolean;
  workshopApi: any;
  onLoadData: () => void;
}

export default function OutilsList({
  outils,
  isLoading,
  hasError,
  workshopApi,
  onLoadData
}: OutilsListProps) {
  
  if (isLoading || hasError || outils.length === 0) return null;

  const handleToggleOutilDisponibilite = async (id: string | number) => {
    try {
      await workshopApi.outils.toggleOutilDisponibilite(id);
      await onLoadData();
    } catch (error) {
      console.error('Erreur lors du changement de disponibilité:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Impossible de changer la disponibilité'}`);
    }
  };

  const OutilCard = ({ outil }: { outil: Outil }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Wrench className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{outil.nom}</h3>
            <p className="text-sm text-gray-600">{outil.type}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          outil.disponible 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {outil.disponible ? '✓ Disponible' : '✗ Indisponible'}
        </span>
      </div>

      {outil.derniereUtilisation && (
        <div className="text-sm text-gray-600 mb-4">
          Dernière utilisation: {new Date(outil.derniereUtilisation).toLocaleDateString('fr-FR')}
        </div>
      )}

      <button
        onClick={() => handleToggleOutilDisponibilite(outil.id || outil._id!)}
        disabled={workshopApi.outils.loading}
        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          outil.disponible
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        }`}
      >
        {workshopApi.outils.loading ? 'Changement...' : 
         outil.disponible ? 'Marquer indisponible' : 'Marquer disponible'}
      </button>
    </div>
  );

  return (
    <>
      {outils.map(outil => (
        <OutilCard key={outil.id || outil._id} outil={outil} />
      ))}
    </>
  );
}