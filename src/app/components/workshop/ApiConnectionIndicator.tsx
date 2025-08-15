"use client";

interface ApiConnectionIndicatorProps {
  hasError: boolean;
}

export default function ApiConnectionIndicator({ hasError }: ApiConnectionIndicatorProps) {
  return (
    <div className="fixed bottom-6 left-6">
      <div className={`flex items-center px-3 py-2 rounded-lg text-sm ${
        hasError 
          ? 'bg-red-100 text-red-800' 
          : 'bg-green-100 text-green-800'
      }`}>
        <div className={`w-2 h-2 rounded-full mr-2 ${
          hasError ? 'bg-red-600' : 'bg-green-600'
        }`}></div>
        API {hasError ? 'Déconnectée' : 'Connectée'}
      </div>
    </div>
  );
}