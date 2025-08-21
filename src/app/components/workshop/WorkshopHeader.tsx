// src/app/components/workshop/WorkshopHeader.tsx
"use client";
import { RefreshCw } from "lucide-react";

interface WorkshopHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
}

export default function WorkshopHeader({ isLoading, onRefresh }: WorkshopHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interface Atelier
          </h1>
          <p className="text-gray-600">
            Gestion complète - Machines, Outils, Main d'œuvre et Ateliers
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>
    </div>
  );
}