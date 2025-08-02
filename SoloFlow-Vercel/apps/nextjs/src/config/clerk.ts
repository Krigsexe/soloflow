/**
 * Configuration centralisée pour Clerk Authentication
 * Intègre les URLs officielles du portail Clerk
 * 
 * Application ID: app_30Wu5…MqXQ9u3Ej
 * Instance ID: ins_30Wu5…YGWubaSSL
 */

export const clerkConfig = {
  // URLs de connexion locales
  portal: {
    signIn: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/fr/login-clerk',
    signUp: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/fr/register',
    userProfile: '/fr/dashboard/client',
    organizationProfile: '/fr/dashboard/admin',
    createOrganization: '/fr/dashboard/admin',
    unauthorized: '/fr/login-clerk'
  },

  // URLs de redirection locales
  redirects: {
    afterSignIn: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/fr/dashboard',
    afterSignUp: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || '/fr/dashboard'
  },

  // Clés d'API
  keys: {
    publishable: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
    secret: process.env.CLERK_SECRET_KEY!,
    webhookSecret: process.env.CLERK_WEBHOOK_SECRET
  },

  // Configuration des routes publiques
  publicRoutes: [
    '/',
    '/fr',
    '/en',
    '/fr/login-clerk(.*)',
    '/en/login-clerk(.*)',
    '/fr/register-clerk(.*)',
    '/en/register-clerk(.*)',
    '/fr/sso-callback',
    '/en/sso-callback',
    '/api/webhooks/clerk'
  ],

  // Routes protégées par Clerk
  protectedRoutes: [
    '/fr/dashboard(.*)',
    '/en/dashboard(.*)',
    '/fr/admin(.*)',
    '/en/admin(.*)',
    '/fr/profile(.*)',
    '/en/profile(.*)',
    '/fr/organization(.*)',
    '/en/organization(.*)'
  ],

  // Configuration par défaut pour les composants
  defaultProps: {
    appearance: {
      elements: {
        formButtonPrimary: 'bg-primary hover:bg-primary/90',
        card: 'shadow-lg border',
        headerTitle: 'text-2xl font-semibold',
        headerSubtitle: 'text-muted-foreground'
      }
    }
  },

  // OAuth Configuration
  oauth: {
    google: {
      enabled: true,
      clientId: process.env.CLERK_GOOGLE_CLIENT_ID,
      clientSecret: process.env.CLERK_GOOGLE_CLIENT_SECRET,
      scopes: ["openid", "email", "profile"],
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/oauth/callback/google`,
    },
  }
};

/**
 * Génère les URLs de redirection avec la langue appropriée
 */
export function getLocalizedRedirectUrls(lang: string = 'fr') {
  return {
    afterSignIn: `/${lang}/dashboard`,
    afterSignUp: `/${lang}/dashboard`,
    signUp: `/${lang}/register-clerk`,
    signIn: `/${lang}/login-clerk`
  };
}

/**
 * Vérifie si une route est publique pour Clerk
 */
export function isClerkPublicRoute(pathname: string): boolean {
  return clerkConfig.publicRoutes.some(route => {
    if (route.includes('(.*)')) {
      const baseRoute = route.replace('(.*)', '');
      return pathname === baseRoute || pathname.startsWith(baseRoute + '/');
    }
    return pathname === route;
  });
}

/**
 * Vérifie si une route est protégée par Clerk
 */
export function isClerkProtectedRoute(pathname: string): boolean {
  return clerkConfig.protectedRoutes.some(route => {
    if (route.includes('(.*)')) {
      const baseRoute = route.replace('(.*)', '');
      return pathname === baseRoute || pathname.startsWith(baseRoute + '/');
    }
    return pathname === route;
  });
}

export default clerkConfig;