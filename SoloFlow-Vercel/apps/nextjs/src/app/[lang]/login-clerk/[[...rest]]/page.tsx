import { SignIn } from '@clerk/nextjs';
import type { Locale } from '~/config/i18n-config';

interface LoginClerkPageProps {
  params: {
    lang: Locale;
    rest?: string[];
  };
}

export default function LoginClerkPage({ params }: LoginClerkPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Connexion
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connectez-vous à votre compte SoloFlow
          </p>
        </div>
        
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg border-0",
            }
          }}
          redirectUrl={`/${params.lang}/dashboard`}
          signUpUrl={`/${params.lang}/register-clerk`}
        />
      </div>
    </div>
  );
}