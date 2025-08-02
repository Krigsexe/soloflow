"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
// import { Button } from "@soloflow/ui"; // Component not available

interface AuthFallbackProps {
  lang: string;
  dict?: Record<string, string>;
}

export function AuthFallback({ lang, dict }: AuthFallbackProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDemoLogin = async () => {
    setIsLoading(true);
    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Redirect to dashboard
    router.push(`/${lang}/dashboard`);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-800">
          🔧 Mode développement - Clerk non configuré
        </p>
      </div>
      
      <button 
        onClick={handleDemoLogin}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
      >
        {isLoading ? "Connexion..." : "Connexion Demo"}
      </button>
      
      <p className="text-xs text-gray-500 text-center">
        Pour activer Clerk, configurez les clés dans .env.local
      </p>
    </div>
  );
}