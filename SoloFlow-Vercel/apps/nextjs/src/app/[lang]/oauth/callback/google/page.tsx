import { GoogleAuthCallback } from "~/components/auth/google-auth-button";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentification Google - SoloFlow",
  description: "Finalisation de l'authentification avec Google",
};

export default function GoogleCallbackPage() {
  return <GoogleAuthCallback />;
}