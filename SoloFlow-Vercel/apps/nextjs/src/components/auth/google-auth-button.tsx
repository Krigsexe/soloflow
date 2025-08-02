"use client";

import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "@soloflow/ui/button";
import * as Icons from "@soloflow/ui/icons";
import { toast } from "@soloflow/ui/use-toast";

interface GoogleAuthButtonProps {
  mode: "signin" | "signup";
  redirectUrl?: string;
  className?: string;
}

export function GoogleAuthButton({ 
  mode, 
  redirectUrl = "/dashboard", 
  className = "" 
}: GoogleAuthButtonProps) {
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const [isLoading, setIsLoading] = useState(false);

  const isLoaded = mode === "signin" ? signInLoaded : signUpLoaded;

  const handleGoogleAuth = async () => {
    if (!isLoaded) {
      toast({
        title: "Erreur",
        description: "Authentification en cours de chargement...",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const authMethod = mode === "signin" ? signIn : signUp;
      
      await authMethod.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: redirectUrl,
        redirectUrlComplete: redirectUrl,
      });
    } catch (error: any) {
      console.error("Erreur d'authentification Google:", error);
      
      // Messages d'erreur personnalisés
      let errorMessage = "Erreur lors de la connexion avec Google";
      
      if (error.errors && error.errors[0]) {
        const clerkError = error.errors[0];
        switch (clerkError.code) {
          case "oauth_access_denied":
            errorMessage = "Accès refusé. Veuillez autoriser l'application.";
            break;
          case "oauth_email_domain_reserved_by_saml":
            errorMessage = "Ce domaine email utilise une authentification d'entreprise.";
            break;
          case "identifier_already_signed_in":
            errorMessage = "Vous êtes déjà connecté avec ce compte.";
            break;
          default:
            errorMessage = clerkError.longMessage || clerkError.message || errorMessage;
        }
      }
      
      toast({
        title: "Erreur d'authentification",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      type="button"
      disabled={!isLoaded || isLoading}
      onClick={handleGoogleAuth}
      className={`w-full ${className}`}
    >
      {isLoading ? (
        <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icons.Google className="mr-2 h-4 w-4" />
      )}
      {isLoading
        ? "Connexion en cours..."
        : mode === "signin"
        ? "Continuer avec Google"
        : "S'inscrire avec Google"
      }
    </Button>
  );
}

// Composant pour la page de callback OAuth
export function GoogleAuthCallback() {
  const { handleRedirectCallback } = useSignIn();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useState(() => {
    const processCallback = async () => {
      try {
        await handleRedirectCallback();
        // La redirection sera gérée automatiquement par Clerk
      } catch (err: any) {
        console.error("Erreur lors du traitement du callback:", err);
        setError("Erreur lors de la finalisation de l'authentification");
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  });

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Icons.Spinner className="h-8 w-8 animate-spin mb-4" />
        <p className="text-muted-foreground">Finalisation de la connexion...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <Icons.AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Erreur d'authentification</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.href = "/login"}>Retour à la connexion</Button>
        </div>
      </div>
    );
  }

  return null;
}

// Hook personnalisé pour gérer l'état d'authentification Google
export function useGoogleAuth() {
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const [isLoading, setIsLoading] = useState(false);

  const authenticateWithGoogle = async (mode: "signin" | "signup", redirectUrl = "/dashboard") => {
    const isLoaded = mode === "signin" ? signInLoaded : signUpLoaded;
    
    if (!isLoaded) {
      throw new Error("Authentification non chargée");
    }

    setIsLoading(true);

    try {
      const authMethod = mode === "signin" ? signIn : signUp;
      
      await authMethod.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: redirectUrl,
        redirectUrlComplete: redirectUrl,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    authenticateWithGoogle,
    isLoading,
    isLoaded: signInLoaded && signUpLoaded,
  };
}