"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Play, RefreshCw, Zap, Info, Settings } from 'lucide-react';

export default function GraphPage() {
  interface NetworkState {
    places: { id: string; nom: string; type: string; tokens: number }[];
    transitionsActivables: { id: string; nom: string; type: string }[];
    totalTokens: number;
  }

  const [networkState, setNetworkState] = useState<NetworkState | null>(null);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTransition, setSelectedTransition] = useState(null);
  const [error, setError] = useState<string | null>(null);

  // Configuration du backend - à adapter selon votre setup
  const API_BASE_URL = 'http://localhost:5000'; // Changez selon votre configuration

  // Positions fixes pour les éléments du réseau (layout optimisé)
  const positions = {
    // Places Ouvriers
    'OuvriersDisponibles': { x: 100, y: 150 },
    'OuvriersOccupes': { x: 300, y: 150 },
    'OuvriersAbsents': { x: 100, y: 300 },
    
    // Places Machines
    'MachinesActives': { x: 500, y: 100 },
    'MachinesEnPanne': { x: 650, y: 100 },
    'MachinesEnMaintenance': { x: 575, y: 250 },
    
    // Places Ateliers
    'AteliersActifs': { x: 800, y: 150 },
    'AteliersFermes': { x: 800, y: 300 },
    'AteliersEnMaintenance': { x: 950, y: 225 },
    
    // Places Tâches
    'TachesEnAttente': { x: 200, y: 450 },
    'TachesEnCours': { x: 400, y: 450 },
    'TachesTerminees': { x: 600, y: 450 },
    
    // Transitions
    'AffecterOuvrierTache': { x: 200, y: 200 },
    'LibererOuvrier': { x: 200, y: 100 },
    'MarquerOuvrierAbsent': { x: 100, y: 225 },
    'RetourOuvrierDisponible': { x: 50, y: 225 },
    'DemarrerMachine': { x: 525, y: 175 },
    'ArreterMachine': { x: 600, y: 175 },
    'ReparerMachine': { x: 650, y: 175 },
    'CommencerTache': { x: 300, y: 450 },
    'TerminerTache': { x: 500, y: 450 }
  };

  const fetchNetworkState = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/petri-net/state`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      setNetworkState(data.data);
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'état:', err);
      setError('Impossible de récupérer l\'état du réseau. Vérifiez que le backend est démarré.');
      
      // Données de démonstration en cas d'erreur
      setNetworkState({
        places: [
          { id: '1', nom: 'OuvriersDisponibles', type: 'ouvrier', tokens: 5 },
          { id: '2', nom: 'OuvriersOccupes', type: 'ouvrier', tokens: 3 },
          { id: '3', nom: 'OuvriersAbsents', type: 'ouvrier', tokens: 1 },
          { id: '4', nom: 'MachinesActives', type: 'machine', tokens: 4 },
          { id: '5', nom: 'MachinesEnPanne', type: 'machine', tokens: 1 },
          { id: '6', nom: 'MachinesEnMaintenance', type: 'machine', tokens: 0 },
          { id: '7', nom: 'AteliersActifs', type: 'atelier', tokens: 2 },
          { id: '8', nom: 'AteliersFermes', type: 'atelier', tokens: 0 },
          { id: '9', nom: 'AteliersEnMaintenance', type: 'atelier', tokens: 1 },
          { id: '10', nom: 'TachesEnAttente', type: 'tache', tokens: 6 },
          { id: '11', nom: 'TachesEnCours', type: 'tache', tokens: 2 },
          { id: '12', nom: 'TachesTerminees', type: 'tache', tokens: 8 }
        ],
        transitionsActivables: [
          { id: 't1', nom: 'AffecterOuvrierTache', type: 'affectation' },
          { id: 't2', nom: 'LibererOuvrier', type: 'liberation' },
          { id: 't3', nom: 'CommencerTache', type: 'production' }
        ],
        totalTokens: 33
      });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchNetworkInfo = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/petri-net/info`);
      if (response.ok) {
        const data = await response.json();
        setNetworkInfo(data.data);
      }
    } catch (err) {
      console.error('Erreur info réseau:', err);
    }
  }, [API_BASE_URL]);

  const fireTransition = async (transitionId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/petri-net/fire/${transitionId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        await fetchNetworkState(); // Recharger l'état
        setSelectedTransition(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erreur lors du tir de transition');
      }
    } catch (err) {
      setError('Erreur de communication avec le serveur');
    } finally {
      setLoading(false);
    }
  };

  const synchronizeState = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/petri-net/synchronize`, {
        method: 'POST'
      });
      
      if (response.ok) {
        await fetchNetworkState();
      } else {
        setError('Erreur lors de la synchronisation');
      }
    } catch (err) {
      setError('Erreur de communication avec le serveur');
    } finally {
      setLoading(false);
    }
  };

  const initializeNetwork = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/petri-net/initialize`, {
        method: 'POST'
      });
      
      if (response.ok) {
        await fetchNetworkState();
        await fetchNetworkInfo();
      } else {
        setError('Erreur lors de l\'initialisation');
      }
    } catch (err) {
      setError('Erreur de communication avec le serveur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkState();
    fetchNetworkInfo();
  }, [fetchNetworkState, fetchNetworkInfo]);

  const getPlaceColor = (type: 'ouvrier' | 'machine' | 'atelier' | 'tache', tokens: number) => {
    const baseColors = {
      'ouvrier': tokens > 0 ? '#1E40AF' : '#E5E7EB',
      'machine': tokens > 0 ? '#3B82F6' : '#E5E7EB',
      'atelier': tokens > 0 ? '#60A5FA' : '#E5E7EB',
      'tache': tokens > 0 ? '#93C5FD' : '#E5E7EB'
    };
    return baseColors[type as keyof typeof baseColors] || '#6B7280';
  };

  const getTransitionColor = (isEnabled) => {
    return isEnabled ? '#EF4444' : '#9CA3AF';
  };

  if (!networkState) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du réseau de Petri...</p>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
              <button 
                onClick={initializeNetwork}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Initialiser le réseau
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Réseau de Petri - Atelier</h1>
            <p className="text-gray-600 mt-1">
              Visualisation en temps réel de l'état des ressources
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={fetchNetworkState}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            
            <button
              onClick={synchronizeState}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              Synchroniser
            </button>
            
            <button
              onClick={initializeNetwork}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <Settings className="w-4 h-4" />
              Initialiser
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-blue-600 font-semibold">Total Points</p>
            <p className="text-2xl font-bold text-blue-800">{networkState.totalTokens || 0}</p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-green-600 font-semibold">Places Actives</p>
            <p className="text-2xl font-bold text-green-800">
              {networkState.places?.filter(p => p.tokens > 0).length || 0}
            </p>
          </div>
          
          <div className="bg-amber-50 p-3 rounded-lg">
            <p className="text-amber-600 font-semibold">Transitions Activables</p>
            <p className="text-2xl font-bold text-amber-800">
              {networkState.transitionsActivables?.length || 0}
            </p>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-purple-600 font-semibold">Total Places</p>
            <p className="text-2xl font-bold text-purple-800">
              {networkState.places?.length || 0}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-6">
        {/* Graphique principal */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">Graphique du Réseau</h2>
          
          <div className="relative">
            <svg width="1100" height="600" className="border border-gray-200 rounded">
              {/* Grille de fond */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Places (cercles) */}
              {networkState.places?.map((place, index) => {
                const pos = positions[place.nom as keyof typeof positions] || { x: 100 + (index % 5) * 150, y: 100 + Math.floor(index / 5) * 100 };
                return (
                  <g key={place.id || index}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="30"
                      fill={getPlaceColor(place.type as 'ouvrier' | 'machine' | 'atelier' | 'tache', place.tokens)}
                      stroke="#374151"
                      strokeWidth="2"
                      className="hover:opacity-80 cursor-pointer"
                    />
                    
                    {/* Points représentant les jetons */}
                    {place.tokens > 0 && (
                      <>
                        {Array.from({ length: Math.min(place.tokens, 9) }, (_, i) => {
                          const angle = (i * 2 * Math.PI) / Math.min(place.tokens, 8);
                          const radius = place.tokens === 1 ? 0 : 12;
                          const dotX = pos.x + radius * Math.cos(angle);
                          const dotY = pos.y + radius * Math.sin(angle);
                          
                          return (
                            <circle
                              key={i}
                              cx={dotX}
                              cy={dotY}
                              r="3"
                              fill="white"
                              stroke="#374151"
                              strokeWidth="1"
                            />
                          );
                        })}
                        {place.tokens > 9 && (
                          <text
                            x={pos.x}
                            y={pos.y + 5}
                            textAnchor="middle"
                            className="fill-white font-bold text-xs"
                          >
                            {place.tokens}
                          </text>
                        )}
                      </>
                    )}
                    
                    {/* Nom de la place */}
                    <text
                      x={pos.x}
                      y={pos.y + 50}
                      textAnchor="middle"
                      className="fill-gray-700 text-xs font-medium"
                      style={{ maxWidth: '100px' }}
                    >
                      {place.nom}
                    </text>
                  </g>
                );
              })}
              
              {/* Transitions (rectangles) */}
              {networkState.transitionsActivables?.map((transition, index) => {
                const pos = positions[transition.nom] || { x: 200 + (index % 3) * 200, y: 350 };
                const isEnabled = true; // Les transitions dans transitionsActivables sont activables
                
                return (
                  <g key={transition.id || index}>
                    <rect
                      x={pos.x - 20}
                      y={pos.y - 10}
                      width="40"
                      height="20"
                      fill={getTransitionColor(isEnabled)}
                      stroke="#374151"
                      strokeWidth="2"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => setSelectedTransition(transition)}
                    />
                    
                    {/* Nom de la transition */}
                    <text
                      x={pos.x}
                      y={pos.y - 20}
                      textAnchor="middle"
                      className="fill-gray-700 text-xs font-medium"
                    >
                      {transition.nom}
                    </text>
                  </g>
                );
              })}
              
              {/* Légende */}
              <g transform="translate(20, 520)">
                <text x="0" y="0" className="fill-gray-700 font-semibold text-sm">Légende:</text>
                
                <circle cx="10" cy="20" r="8" fill="#1E40AF" />
                <text x="25" y="25" className="fill-gray-600 text-xs">Ouvriers</text>
                
                <circle cx="90" cy="20" r="8" fill="#3B82F6" />
                <text x="105" y="25" className="fill-gray-600 text-xs">Machines</text>
                
                <circle cx="180" cy="20" r="8" fill="#60A5FA" />
                <text x="195" y="25" className="fill-gray-600 text-xs">Ateliers</text>
                
                <circle cx="260" cy="20" r="8" fill="#93C5FD" />
                <text x="275" y="25" className="fill-gray-600 text-xs">Tâches</text>
                
                <rect x="350" y="12" width="16" height="8" fill="#EF4444" />
                <text x="375" y="20" className="fill-gray-600 text-xs">Transition activable</text>
                
                <circle cx="500" cy="20" r="3" fill="white" stroke="#374151" strokeWidth="1" />
                <text x="510" y="25" className="fill-gray-600 text-xs">Point (ressource)</text>
              </g>
            </svg>
          </div>
        </div>

        {/* Panel latéral */}
        <div className="w-80 space-y-4">
          {/* Transitions activables */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Play className="w-5 h-5" />
              Transitions Activables
            </h3>
            
            <div className="space-y-2">
              {networkState.transitionsActivables?.length > 0 ? (
                networkState.transitionsActivables.map((transition, index) => (
                  <button
                    key={transition.id || index}
                    onClick={() => fireTransition(transition.id)}
                    disabled={loading}
                    className="w-full p-2 text-left bg-gray-50 hover:bg-gray-100 rounded-md border transition-colors disabled:opacity-50"
                  >
                    <div className="font-medium text-sm">{transition.nom}</div>
                    <div className="text-xs text-gray-500 capitalize">{transition.type}</div>
                  </button>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Aucune transition activable</p>
              )}
            </div>
          </div>

          {/* État des places par catégorie */}
          {['ouvrier', 'machine', 'atelier', 'tache'].map(type => (
            <div key={type} className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-md font-semibold mb-2 capitalize flex items-center gap-2">
                <Info className="w-4 h-4" />
                {type}s
              </h3>
              
              <div className="space-y-1">
                {networkState.places
                  ?.filter(place => place.type === type)
                  .map((place, index) => (
                    <div key={place.id || index} className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-700">{place.nom.replace(type.charAt(0).toUpperCase() + type.slice(1) + 's', '')}</span>
                      <span className="text-sm font-semibold">{place.tokens}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal pour transition sélectionnée */}
      {selectedTransition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Tirer la Transition</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">Nom:</p>
              <p className="font-medium">{selectedTransition.nom}</p>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600">Type:</p>
              <p className="font-medium capitalize">{selectedTransition.type}</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => fireTransition(selectedTransition.id)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'En cours...' : 'Tirer'}
              </button>
              
              <button
                onClick={() => setSelectedTransition(null)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};