"use client";
import { AlertCircle } from "lucide-react";
import { Ouvrier } from "../../../adapters/hooks/useApi";

interface WorkshopAlertsProps {
  activeTab: string;
  ouvriers: Ouvrier[];
  isLoading: boolean;
  hasError: boolean;
}

export default function WorkshopAlerts({ activeTab, ouvriers, isLoading, hasError }: WorkshopAlertsProps) {
  if (activeTab !== 'ouvriers' || isLoading || hasError || ouvriers.length === 0) return null;

  // Fonction pour obtenir les alertes concernant les ouvriers
  const getOuvriersAlerts = () => {
    const alerts = [];
    
    const surcharges = ouvriers.filter(o => 
      o.heuresJour && o.heuresMax && 
      (o.heuresJour / o.heuresMax) >= 0.9
    );
    

    
    const sansCompetences = ouvriers.filter(o => 
      !o.competences || o.competences.length === 0
    );
    
    if (surcharges.length > 0) {
      alerts.push({
        type: 'warning',
        icon: '⚠️',
        message: `${surcharges.length} ouvrier${surcharges.length > 1 ? 's' : ''} en surcharge de travail (≥90% capacité)`
      });
    }
    
    if (sansCompetences.length > 0) {
      alerts.push({
        type: 'info',
        icon: '🔧',
        message: `${sansCompetences.length} ouvrier${sansCompetences.length > 1 ? 's' : ''} sans compétences renseignées`
      });
    }
    
    return alerts;
  };

  const getOuvriersStats = () => {
    const total = ouvriers.length;
    const experts = ouvriers.filter(o => o.niveau === 'Expert').length;
    const confirmes = ouvriers.filter(o => o.niveau === 'Confirmé').length;
    const debutants = ouvriers.filter(o => o.niveau === 'Débutant').length;
    
    const moyenneHeuresJour = total > 0 ? 
      Math.round(ouvriers.reduce((sum, o) => sum + (o.heuresJour || 0), 0) / total * 10) / 10 : 0;
    
    return {
      total,
      parNiveau: {
        experts,
        confirmes,
        debutants
      },
      moyenneHeuresJour
    };
  };

  const alerts = getOuvriersAlerts();
  const stats = getOuvriersStats();

  return (
    <div className="mt-6">
      {alerts.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-5 h-5 text-green-600 mr-2">✓</div>
            <h3 className="text-sm font-medium text-green-800">
              Équipe opérationnelle - Aucune alerte
            </h3>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">
              Alertes équipe ({alerts.length})
            </h3>
          </div>
          <div className="space-y-1 text-sm text-yellow-700">
            {alerts.map((alert, index) => (
              <p key={index}>
                {alert.icon} {alert.message}
              </p>
            ))}
          </div>
          
          {/* Statistiques détaillées */}
          {stats.total > 0 && (
            <div className="mt-3 pt-3 border-t border-yellow-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-yellow-600">
                <div>
                  <span className="font-medium">Experts:</span> {stats.parNiveau.experts}
                </div>
                <div>
                  <span className="font-medium">Confirmés:</span> {stats.parNiveau.confirmes}
                </div>
                <div>
                  <span className="font-medium">Débutants:</span> {stats.parNiveau.debutants}
                </div>
                <div>
                  <span className="font-medium">Moy. h/jour:</span> {stats.moyenneHeuresJour}h
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}