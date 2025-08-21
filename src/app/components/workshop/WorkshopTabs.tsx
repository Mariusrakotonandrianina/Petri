"use client";
import { Settings, Users, Building2 } from "lucide-react";
import { Machine, Ouvrier, Atelier } from "../../../adapters/hooks/useApi";

interface WorkshopTabsProps {
  activeTab: 'machines' | 'ouvriers' | 'ateliers';
  onTabChange: (tab: 'machines' | 'ouvriers' | 'ateliers') => void;
  workshopData: {
    machines: Machine[];
    ouvriers: Ouvrier[];
    ateliers: Atelier[];
  };
}

export default function WorkshopTabs({ activeTab, onTabChange, workshopData }: WorkshopTabsProps) {
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'machines':
        return `Machines (${workshopData.machines.length})`;
      case 'ouvriers':
        return `Main d'œuvre (${workshopData.ouvriers.length})`;
      case 'ateliers':
        return `Ateliers (${workshopData.ateliers.length})`;
      default:
        return tab;
    }
  };

  const tabs = [
    {
      id: 'machines' as const,
      icon: Settings,
      title: getTabTitle('machines')
    },
    {
      id: 'ouvriers' as const,
      icon: Users,
      title: getTabTitle('ouvriers')
    },
    {
      id: 'ateliers' as const,
      icon: Building2,
      title: getTabTitle('ateliers')
    }
  ];

  return (
    <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 border border-gray-200">
      {tabs.map(({ id, icon: Icon, title }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === id
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Icon className="w-4 h-4 inline-block mr-2" />
          {title}
        </button>
      ))}
    </div>
  );
}