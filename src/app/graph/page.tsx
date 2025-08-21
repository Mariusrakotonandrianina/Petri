"use client";
import React, { useState, useEffect } from 'react';
import { Play, RefreshCw, Settings, Activity, AlertCircle, CheckCircle, XCircle, Pause } from 'lucide-react';

const PetriNetSimulator = () => {
  // État initial du réseau basé sur le schéma RDP
  const initialState = {
    places: {
      P1: { id: 'P1', nom: 'Ouvriers Disponibles', tokens: 3, type: 'ouvrier' },
      P2: { id: 'P2', nom: 'Machines Libres', tokens: 2, type: 'machine' },
      P3: { id: 'P3', nom: 'Tâches en Attente', tokens: 0, type: 'tache' },
      P4: { id: 'P4', nom: 'Ouvriers Occupés', tokens: 0, type: 'ouvrier' },
      P5: { id: 'P5', nom: 'Machines Occupées', tokens: 0, type: 'machine' },
      P6: { id: 'P6', nom: 'Production', tokens: 0, type: 'production' },
      P7: { id: 'P7', nom: 'Tâches Terminées', tokens: 0, type: 'tache' },
      P8: { id: 'P8', nom: 'Produits Finis', tokens: 0, type: 'produit' }
    },
    transitions: {
      T1: { 
        id: 'T1', 
        nom: 'Affecter Ouvrier',
        inputs: [{ place: 'P1', weight: 1 }],
        outputs: [{ place: 'P4', weight: 1 }]
      },
      T2: { 
        id: 'T2', 
        nom: 'Affecter Machine',
        inputs: [{ place: 'P2', weight: 1 }],
        outputs: [{ place: 'P5', weight: 1 }]
      },
      T3: { 
        id: 'T3', 
        nom: 'Commencer Production',
        inputs: [
          { place: 'P4', weight: 1 },
          { place: 'P5', weight: 1 },
          { place: 'P3', weight: 1 }
        ],
        outputs: [{ place: 'P6', weight: 1 }]
      },
      T4: { 
        id: 'T4', 
        nom: 'Terminer Production',
        inputs: [{ place: 'P6', weight: 1 }],
        outputs: [
          { place: 'P1', weight: 1 },
          { place: 'P2', weight: 1 },
          { place: 'P7', weight: 1 }
        ]
      },
      T5: { 
        id: 'T5', 
        nom: 'Ajouter Tâche',
        inputs: [],
        outputs: [{ place: 'P3', weight: 1 }]
      },
      T6: { 
        id: 'T6', 
        nom: 'Finaliser Produit',
        inputs: [{ place: 'P7', weight: 1 }],
        outputs: [{ place: 'P8', weight: 1 }]
      }
    },
    historique: []
  };

  const [networkState, setNetworkState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTransition, setSelectedTransition] = useState('');
  const [autoMode, setAutoMode] = useState(false);
  const [speed, setSpeed] = useState(1000);

  // Vérifier si une transition est activable
  const isTransitionEnabled = (transition, places) => {
    return transition.inputs.every(input => 
      places[input.place].tokens >= input.weight
    );
  };

  // Obtenir les transitions activables
  const getEnabledTransitions = () => {
    const enabled = [];
    Object.values(networkState.transitions).forEach(transition => {
      if (isTransitionEnabled(transition, networkState.places)) {
        enabled.push(transition);
      }
    });
    return enabled;
  };

  // Tirer une transition
  const fireTransition = async (transitionId) => {
    setLoading(true);
    setError('');

    try {
      const transition = networkState.transitions[transitionId];
      if (!transition) {
        throw new Error('Transition non trouvée');
      }

      if (!isTransitionEnabled(transition, networkState.places)) {
        throw new Error('Transition non activable');
      }

      // Créer le nouvel état
      const newPlaces = { ...networkState.places };

      // Consommer les jetons des places d'entrée
      transition.inputs.forEach(input => {
        newPlaces[input.place] = {
          ...newPlaces[input.place],
          tokens: newPlaces[input.place].tokens - input.weight
        };
      });

      // Produire les jetons dans les places de sortie
      transition.outputs.forEach(output => {
        newPlaces[output.place] = {
          ...newPlaces[output.place],
          tokens: newPlaces[output.place].tokens + output.weight
        };
      });

      // Mettre à jour l'historique
      const newHistorique = [...networkState.historique, {
        transition: transition.nom,
        timestamp: new Date().toISOString(),
        id: transitionId
      }];

      setNetworkState({
        ...networkState,
        places: newPlaces,
        historique: newHistorique
      });

      setSelectedTransition('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mode automatique
  useEffect(() => {
    let interval;
    if (autoMode) {
      interval = setInterval(() => {
        const enabledTransitions = getEnabledTransitions();
        if (enabledTransitions.length > 0) {
          const randomTransition = enabledTransitions[Math.floor(Math.random() * enabledTransitions.length)];
          fireTransition(randomTransition.id);
        }
      }, speed);
    }
    return () => clearInterval(interval);
  }, [autoMode, speed, networkState]);

  // Réinitialiser le réseau
  const resetNetwork = () => {
    setNetworkState(initialState);
    setError('');
    setAutoMode(false);
  };

  // Ajouter des jetons à une place
  const addToken = (placeId) => {
    const newPlaces = { ...networkState.places };
    newPlaces[placeId] = {
      ...newPlaces[placeId],
      tokens: newPlaces[placeId].tokens + 1
    };
    setNetworkState({ ...networkState, places: newPlaces });
  };

  // Retirer des jetons d'une place
  const removeToken = (placeId) => {
    const newPlaces = { ...networkState.places };
    if (newPlaces[placeId].tokens > 0) {
      newPlaces[placeId] = {
        ...newPlaces[placeId],
        tokens: newPlaces[placeId].tokens - 1
      };
      setNetworkState({ ...networkState, places: newPlaces });
    }
  };

  const PlaceComponent = ({ place, position, onAddToken, onRemoveToken }) => {
    const getPlaceColor = (type, tokens) => {
      const baseColors = {
        'ouvrier': tokens > 0 ? 'bg-blue-100 border-blue-400' : 'bg-blue-50 border-blue-200',
        'machine': tokens > 0 ? 'bg-green-100 border-green-400' : 'bg-green-50 border-green-200',
        'tache': tokens > 0 ? 'bg-yellow-100 border-yellow-400' : 'bg-yellow-50 border-yellow-200',
        'production': tokens > 0 ? 'bg-purple-100 border-purple-400' : 'bg-purple-50 border-purple-200',
        'produit': tokens > 0 ? 'bg-orange-100 border-orange-400' : 'bg-orange-50 border-orange-200',
        'default': tokens > 0 ? 'bg-gray-100 border-gray-400' : 'bg-gray-50 border-gray-200'
      };
      return baseColors[type] || baseColors['default'];
    };

    return (
      <div className="absolute group" style={{ left: position.x, top: position.y }}>
        <div
          className={`w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 ${getPlaceColor(place.type, place.tokens)}`}
          title={`${place.nom} (${place.tokens} jetons)`}
        >
          <div className="text-xs font-medium text-gray-700 text-center leading-tight mb-1">
            {place.id}
          </div>
          <div className="text-xl font-bold text-gray-800">
            {place.tokens}
          </div>
        </div>
        
        {/* Contrôles pour ajouter/retirer des jetons */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 -right-2 flex flex-col gap-1">
          <button
            onClick={() => onAddToken(place.id)}
            className="w-6 h-6 bg-green-500 text-white rounded-full text-xs hover:bg-green-600 flex items-center justify-center"
            title="Ajouter un jeton"
          >
            +
          </button>
          {place.tokens > 0 && (
            <button
              onClick={() => onRemoveToken(place.id)}
              className="w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center"
              title="Retirer un jeton"
            >
              -
            </button>
          )}
        </div>
        
        {/* Nom de la place */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-center text-gray-600 font-medium whitespace-nowrap">
          {place.nom}
        </div>
      </div>
    );
  };

  const TransitionComponent = ({ transition, position, onFire, enabled }) => {
    return (
      <div className="absolute group" style={{ left: position.x, top: position.y }}>
        <div
          className={`w-16 h-10 border-2 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 ${
            enabled ? 'bg-green-200 border-green-500 hover:bg-green-300' : 'bg-red-200 border-red-500'
          }`}
          onClick={() => enabled && onFire(transition.id)}
          title={`${transition.nom} ${enabled ? '(Activable)' : '(Non activable)'}`}
        >
          <div className="text-xs font-bold text-center">
            {transition.id}
          </div>
        </div>
        
        {/* Nom de la transition */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-center text-gray-600 font-medium whitespace-nowrap">
          {transition.nom}
        </div>
      </div>
    );
  };

  // Arc entre place et transition
  const ArcComponent = ({ from, to, weight = 1 }) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    return (
      <div 
        className="absolute border-t-2 border-gray-400"
        style={{
          left: from.x + 40,
          top: from.y + 40,
          width: length - 80,
          transformOrigin: '0 0',
          transform: `rotate(${angle}deg)`
        }}
      >
        {weight > 1 && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-xs bg-white px-1 rounded">
            {weight}
          </div>
        )}
      </div>
    );
  };

  // Positions des places et transitions basées sur le schéma
  const placePositions = {
    'P1': { x: 50, y: 100 },
    'P2': { x: 50, y: 300 },
    'P3': { x: 250, y: 200 },
    'P4': { x: 200, y: 50 },
    'P5': { x: 200, y: 350 },
    'P6': { x: 350, y: 100 },
    'P7': { x: 500, y: 200 },
    'P8': { x: 650, y: 300 }
  };

  const transitionPositions = {
    'T1': { x: 125, y: 75 },
    'T2': { x: 125, y: 325 },
    'T3': { x: 275, y: 150 },
    'T4': { x: 425, y: 150 },
    'T5': { x: 150, y: 200 },
    'T6': { x: 575, y: 250 }
  };

  const enabledTransitions = getEnabledTransitions();
  const totalTokens = Object.values(networkState.places).reduce((sum, place) => sum + place.tokens, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Simulateur de Réseau de Petri - Atelier
          </h1>
          
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Vitesse:</label>
              <select 
                value={speed} 
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="px-3 py-1 border rounded"
              >
                <option value={2000}>Lent (2s)</option>
                <option value={1000}>Normal (1s)</option>
                <option value={500}>Rapide (0.5s)</option>
              </select>
            </div>
            
            <button
              onClick={() => setAutoMode(!autoMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                autoMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {autoMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {autoMode ? 'Arrêter' : 'Auto'}
            </button>
            
            <button
              onClick={resetNetwork}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Réinitialiser
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">{totalTokens}</div>
            <div className="text-sm text-gray-600">Total Jetons</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">{enabledTransitions.length}</div>
            <div className="text-sm text-gray-600">Transitions Activables</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-purple-600">{Object.keys(networkState.places).length}</div>
            <div className="text-sm text-gray-600">Places</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-orange-600">{networkState.historique.length}</div>
            <div className="text-sm text-gray-600">Transitions Exécutées</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Visualisation du réseau */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Réseau de Petri</h2>
              
              <div className="relative bg-blue-50 rounded-lg p-4 overflow-auto" style={{ height: '500px', minWidth: '800px' }}>
                {/* Rendu des arcs */}
                {Object.values(networkState.transitions).map(transition => {
                  const transPos = transitionPositions[transition.id];
                  if (!transPos) return null;
                  
                  return (
                    <div key={`arcs-${transition.id}`}>
                      {transition.inputs.map((input, index) => {
                        const placePos = placePositions[input.place];
                        return placePos ? (
                          <ArcComponent
                            key={`input-${transition.id}-${index}`}
                            from={placePos}
                            to={transPos}
                            weight={input.weight}
                          />
                        ) : null;
                      })}
                      {transition.outputs.map((output, index) => {
                        const placePos = placePositions[output.place];
                        return placePos ? (
                          <ArcComponent
                            key={`output-${transition.id}-${index}`}
                            from={transPos}
                            to={placePos}
                            weight={output.weight}
                          />
                        ) : null;
                      })}
                    </div>
                  );
                })}

                {/* Rendu des places */}
                {Object.values(networkState.places).map((place) => {
                  const position = placePositions[place.id];
                  return position ? (
                    <PlaceComponent
                      key={place.id}
                      place={place}
                      position={position}
                      onAddToken={addToken}
                      onRemoveToken={removeToken}
                    />
                  ) : null;
                })}

                {/* Rendu des transitions */}
                {Object.values(networkState.transitions).map((transition) => {
                  const position = transitionPositions[transition.id];
                  const enabled = enabledTransitions.some(t => t.id === transition.id);
                  return position ? (
                    <TransitionComponent
                      key={transition.id}
                      transition={transition}
                      position={position}
                      onFire={fireTransition}
                      enabled={enabled}
                    />
                  ) : null;
                })}
                
                {loading && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-100 border-blue-400 border-2"></div>
                    <span>Ouvriers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-100 border-green-400 border-2"></div>
                    <span>Machines</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-100 border-yellow-400 border-2"></div>
                    <span>Tâches</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-purple-100 border-purple-400 border-2"></div>
                    <span>Production</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-orange-100 border-orange-400 border-2"></div>
                    <span>Produits</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Cliquez sur les transitions vertes pour les exécuter. Survolez les places pour ajouter/retirer des jetons.
                </div>
              </div>
            </div>
          </div>

          {/* Panneau de contrôle */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Transitions Activables</h2>
              
              {enabledTransitions.length > 0 ? (
                <div className="space-y-2">
                  {enabledTransitions.map((transition) => (
                    <button
                      key={transition.id}
                      onClick={() => fireTransition(transition.id)}
                      disabled={loading || autoMode}
                      className="w-full text-left p-3 bg-green-50 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg border border-green-200 transition-colors flex items-center gap-2"
                    >
                      <Play className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="font-medium">{transition.nom}</div>
                        <div className="text-xs text-gray-500">{transition.id}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  Aucune transition activable
                </div>
              )}
            </div>

            {/* États des places */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">État des Places</h2>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {Object.values(networkState.places).map((place) => (
                  <div key={place.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-sm">{place.nom}</div>
                      <div className="text-xs text-gray-500">{place.id} - {place.type}</div>
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                      {place.tokens}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Historique */}
        {networkState.historique.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Historique des Transitions</h2>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {networkState.historique.slice().reverse().map((entry, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{entry.transition}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PetriNetSimulator;