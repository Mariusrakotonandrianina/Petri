"use client";

interface WorkshopLoadingStateProps {
  isLoading: boolean;
}

export default function WorkshopLoadingState({ isLoading }: WorkshopLoadingStateProps) {
  if (!isLoading) return null;

  return (
    <div className="col-span-full flex justify-center items-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement des données...</p>
      </div>
    </div>
  );
}