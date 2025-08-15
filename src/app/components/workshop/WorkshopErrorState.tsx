"use client";
import { AlertCircle, RefreshCw } from "lucide-react";

interface WorkshopErrorStateProps {
  hasError: boolean;
  errorMessage: string;
  onClearError: () => void;
  onRefresh: () => void;
}

export function WorkshopErrorState({ 
  hasError, 
  errorMessage, 
  onClearError, 
  onRefresh 
}: WorkshopErrorStateProps) {
  if (!hasError) return null;

  return (
    <div className="col-span-full">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-800 mb-2">Erreur de connexion</h3>
        <p className="text-red-600 mb-4">{errorMessage}</p>
        <div className="flex justify-center space-x-3">
          <button
            onClick={onClearError}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Fermer
          </button>
          <button
            onClick={onRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </button>
        </div>
      </div>
    </div>
  );
}