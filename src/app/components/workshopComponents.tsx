"use client";
import { Plus, Settings, Users, Wrench } from "lucide-react";
import { useState } from "react";
import MachineComponents from "./ouvrierComponents";
import OutilComponents from "./outilsComponents";
import OuvrierComponents from "./ouvrierComponents";

export default function WorkshopComponents() {
    
  const [activeTab, setActiveTab] = useState('machines');

  const machines = [
    { id: 1, nom: "Presse d'assemblage #1", type: "Presse hydraulique", status: "active", utilisation: 75 },
    { id: 2, nom: "Cabine de peinture #1", type: "Cabine automatique", status: "maintenance", utilisation: 0 },
  ];

  const outils = [
    { id: 1, nom: "Clé dynamométrique #3", type: "Outil spécialisé", quantite: 2, disponible: 1 },
    { id: 2, nom: "Pistolet à peinture", type: "Équipement peinture", quantite: 3, disponible: 3 },
  ];

  const operateurs = [
    { id: 1, nom: "Jean Dupont", specialite: "Assemblage", niveau: "Expert", statut: "disponible" },
    { id: 2, nom: "Marie Martin", specialite: "Peinture", niveau: "Confirmé", statut: "occupe", tacheActuelle: "Peinture voiture #142" },
  ]
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interface Atelier Automobile</h1>
          <p className="text-gray-600">Gestion des ressources - Machines, Outils et Main d'œuvre</p>
        </div>

        <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 border border-gray-200">
          <button
            onClick={() => setActiveTab('machines')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'machines' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="w-4 h-4 inline-block mr-2" />
            Machines
          </button>
          <button
            onClick={() => setActiveTab('outils')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'outils' 
                ? 'bg-orange-100 text-orange-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Wrench className="w-4 h-4 inline-block mr-2" />
            Outils
          </button>
          <button
            onClick={() => setActiveTab('operateurs')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'operateurs' 
                ? 'bg-green-100 text-green-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4 inline-block mr-2" />
            Main d'œuvre
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'machines' && machines.map(machine => (
            <MachineComponents 
              key={machine.id} 
              machine={machine}
              onEdit={(m) => console.log('Edit machine:', m)}
              onDelete={(id) => console.log('Delete machine:', id)}
              onToggleStatus={(id) => console.log('Toggle machine status:', id)}
            />
          ))}

          {activeTab === 'outils' && outils.map(outil => (
            <OutilComponents 
              key={outil.id} 
              outil={outil}
              onEdit={(o) => console.log('Edit outil:', o)}
              onDelete={(id) => console.log('Delete outil:', id)}
              onReserver={(id) => console.log('Reserve outil:', id)}
            />
          ))}

          {activeTab === 'operateurs' && operateurs.map(operateur => (
            <OuvrierComponents 
              key={operateur.id} 
              operateur={operateur}
              onEdit={(o) => console.log('Edit operateur:', o)}
              onDelete={(id) => console.log('Delete operateur:', id)}
              onAssigner={(id) => console.log('Assign task to operateur:', id)}
            />
          ))}
        </div>

        <div className="fixed bottom-6 right-6">
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors">
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}