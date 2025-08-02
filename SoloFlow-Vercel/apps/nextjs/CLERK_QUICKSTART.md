# 🚀 Guide de Démarrage Rapide Clerk pour Next.js

## Implémentation de Clerk dans votre application Next.js

### 1. Installer @clerk/nextjs

Exécutez la commande suivante pour installer le SDK :

```bash
npm install @clerk/nextjs
```

### 2. Configurer vos clés API Clerk

Ajoutez ces clés à votre fichier `.env.local` ou créez le fichier s'il n'existe pas. Récupérez ces clés à tout moment depuis la [page des clés API](https://dashboard.clerk.dev).

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_votre_cle_publique_ici
CLERK_SECRET_KEY=sk_test_votre_cle_secrete_ici
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/fr/login-clerk
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/fr/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/fr/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/fr/dashboard
CLERK_WEBHOOK_SECRET=whsec_votre_webhook_secret_ici
```

### 3. Mettre à jour middleware.ts

Mettez à jour votre fichier middleware, ou créez-en un à la racine de votre projet, ou dans le répertoire `src/` si vous utilisez une structure de répertoire `src/`.

L'helper `clerkMiddleware` active l'authentification et c'est là que vous configurerez vos routes protégées.

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/fr',
  '/en',
  '/fr/(.*)',
  '/en/(.*)',
  '/login-clerk(.*)',
  '/register(.*)',
  '/api/webhooks(.*)',
  '/api/trpc(.*)',
]);

export default clerkMiddleware((auth, req: NextRequest) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
```

### 4. Ajouter ClerkProvider à votre app

Le composant `ClerkProvider` fournit le contexte d'authentification de Clerk à votre app. Il est recommandé d'envelopper toute votre app au point d'entrée avec `ClerkProvider` pour rendre l'authentification globalement accessible.

```typescript
// src/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SoloFlow - Clerk Authentication',
  description: 'Application SoloFlow avec authentification Clerk',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### 5. Créer une page de connexion personnalisée

```typescript
// src/app/[lang]/(auth)/login-clerk/page.tsx
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
            card: 'shadow-lg',
          },
        }}
        fallbackRedirectUrl="/fr/dashboard"
        signUpUrl="/fr/register"
      />
    </div>
  );
}
```

### 6. Créer une page d'inscription personnalisée

```typescript
// src/app/[lang]/(auth)/register/page.tsx
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
            card: 'shadow-lg',
          },
        }}
        fallbackRedirectUrl="/fr/dashboard"
        signInUrl="/fr/login-clerk"
      />
    </div>
  );
}
```

### 7. Créer une page de callback SSO

```typescript
// src/app/[lang]/(auth)/login-clerk/sso-callback/page.tsx
import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function SSOCallback() {
  return <AuthenticateWithRedirectCallback />;
}
```

### 8. Composants d'authentification

#### Bouton de connexion modal

```typescript
// src/components/sign-in-modal-clerk.tsx
import { useSignIn } from '@clerk/nextjs';
import { OAuthStrategy } from '@clerk/types';

export const SignInClerkModal = ({ dict }: { dict: Record<string, string> }) => {
  const { signIn } = useSignIn();

  const signInWith = (strategy: OAuthStrategy) => {
    const protocol = window.location.protocol;
    const host = window.location.host;
    const currentPath = window.location.pathname;
    const lang = currentPath.split('/')[1] || 'fr';
    
    return signIn
      .authenticateWithRedirect({
        strategy,
        redirectUrl: `/${lang}/login-clerk/sso-callback`,
        redirectUrlComplete: `${protocol}//${host}/${lang}/dashboard`,
      })
      .catch((err) => {
        console.error('Erreur d\'authentification:', err);
      });
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => signInWith('oauth_google')}
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          {/* Google Icon SVG */}
        </svg>
        {dict?.google || 'Continuer avec Google'}
      </button>
    </div>
  );
};
```

#### Bouton utilisateur

```typescript
// src/components/user-button-clerk.tsx
import { UserButton, useUser } from '@clerk/nextjs';

export const UserButtonClerk = () => {
  const { isSignedIn, user } = useUser();

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-700">
        Bonjour, {user.firstName || user.emailAddresses[0]?.emailAddress}
      </span>
      <UserButton
        appearance={{
          elements: {
            avatarBox: 'w-8 h-8',
          },
        }}
        afterSignOutUrl="/fr"
      />
    </div>
  );
};
```

### 9. Protection des routes

```typescript
// src/components/auth-guard.tsx
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  fallbackUrl?: string;
}

export const AuthGuard = ({ children, fallbackUrl = '/fr/login-clerk' }: AuthGuardProps) => {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push(fallbackUrl);
    }
  }, [isLoaded, isSignedIn, router, fallbackUrl]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return <>{children}</>;
};
```

### 10. Créer votre premier utilisateur

Exécutez votre projet. Ensuite, visitez la page d'accueil de votre app à http://localhost:3000 et inscrivez-vous pour créer votre premier utilisateur.

```bash
npm run dev
```

### Étapes suivantes

1. **Configurez vos vraies clés Clerk** dans `.env.local`
2. **Personnalisez l'apparence** des composants Clerk
3. **Configurez les webhooks** pour synchroniser avec Supabase
4. **Ajoutez des métadonnées utilisateur** personnalisées
5. **Implémentez la gestion des rôles** et permissions

### Ressources utiles

- [Documentation officielle Clerk](https://clerk.dev/docs)
- [Exemples de code](https://github.com/clerkinc/clerk-nextjs-examples)
- [Support Clerk](https://clerk.dev/support)
- [Dashboard Clerk](https://dashboard.clerk.dev)

---

*Guide créé pour le projet SoloFlow - Version 1.0*