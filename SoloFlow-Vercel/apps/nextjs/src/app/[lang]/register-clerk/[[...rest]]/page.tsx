import { SignUp } from '@clerk/nextjs';
import type { Locale } from '~/config/i18n-config';

interface RegisterClerkPageProps {
  params: {
    lang: Locale;
    rest?: string[];
  };
}

export default function RegisterClerkPage({ params }: RegisterClerkPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Inscription
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Créez votre compte SoloFlow
          </p>
        </div>
        
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg border-0",
            }
          }}
          redirectUrl={`/${params.lang}/dashboard`}
          signInUrl={`/${params.lang}/login-clerk`}
        />
      </div>
    </div>
  );
}