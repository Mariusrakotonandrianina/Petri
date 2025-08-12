"use client";
import { Plus, Settings, Users, Wrench } from "lucide-react";
import { useState } from "react";
import MachineComponents from "./machineComponents";
import OutilsComponents from "./outilsComponents";
import OuvrierComponents from "./ouvrierComponents";

export default function WorkshopComponents() {
  const [activeTab, setActiveTab] = useState('machines');

  const machines = [
    { id: 1, nom: "Presse d'assemblage #1", type: "Presse hydraulique", status: "active" as const, utilisation: 75, capacite: 2, derniereRevision: "2024-01-15", prochaineMaintenance: "2024-03-15" },
    { id: 2, nom: "Cabine de peinture #1", type: "Cabine automatique", status: "maintenance" as const, utilisation: 0, capacite: 1, derniereRevision: "2024-02-01", prochaineMaintenance: "2024-04-01" },
  ];

  const outils = [
    { id: 1, nom: "Clé dynamométrique #3", type: "Outil spécialisé", quantite: 2, disponible: 1, enUse: 1, etat: "bon" as const, derniereVerification: "2024-02-01", prochaineVerification: "2024-04-01" },
    { id: 2, nom: "Pistolet à peinture", type: "Équipement peinture", quantite: 3, disponible: 3, enUse: 0, etat: "bon" as const, derniereVerification: "2024-01-15", prochaineVerification: "2024-03-15" },
  ];

  const operateurs = [
    { id: 1, nom: "Jean Dupont", specialite: "Assemblage", niveau: "Expert" as const, statut: "disponible" as const, heuresJour: 6.5, heuresMax: 8, competences: ["Assemblage", "Montage moteur", "Contrôle qualité"] },
    { id: 2, nom: "Marie Martin", specialite: "Peinture", niveau: "Confirmé" as const, statut: "occupe" as const, tacheActuelle: "Peinture voiture #142", heuresJour: 7, heuresMax: 8, competences: ["Peinture", "Préparation surface"] },
  ];

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
                  ? 'bg-green-100 text-green-700' 
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
                  ? 'bg-green-100 text-green-700' 
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
            <OutilsComponents 
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