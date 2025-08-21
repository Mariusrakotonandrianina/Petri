"use client";
import { RefreshCcw, Building2 } from "lucide-react";

interface WorkshopHeaderProps {
  title?: string;
  subtitle?: string;
  isLoading: boolean;
  onRefresh: () => void;
}

export function WorkshopHeaderAteliers({ 
  title = "Gestion des Ateliers",
  subtitle = "Gérez vos ateliers de production",
  isLoading, 
  onRefresh 
}: WorkshopHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Building2 className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {title}
          </h1>
          <p className="text-gray-600">
            {subtitle}
          </p>
        </div>
      </div>
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCcw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Actualiser
      </button>
    </div>
  );
}
