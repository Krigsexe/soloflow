/**
 * Wrapper pour les composants Clerk avec configuration centralisée
 * Utilise les URLs officielles du portail Clerk
 */

import { SignIn, SignUp, UserProfile, OrganizationProfile } from '@clerk/nextjs';
import { clerkConfig, getLocalizedRedirectUrls } from '~/config/clerk';
import { GoogleAuthButton } from './google-auth-button';

interface ClerkWrapperProps {
  lang?: string;
  component: 'signin' | 'signup' | 'userprofile' | 'organizationprofile';
  className?: string;
}

export function ClerkWrapper({ 
  lang = 'fr', 
  component, 
  className = '' 
}: ClerkWrapperProps) {
  const redirectUrls = getLocalizedRedirectUrls(lang);
  const commonProps = {
    appearance: clerkConfig.defaultProps.appearance,
    className
  };

  switch (component) {
    case 'signin':
      return (
        <div className="space-y-4">
          <GoogleAuthButton 
            mode="signin" 
            redirectUrl={redirectUrls.afterSignIn}
            className="mb-4"
          />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou continuer avec
              </span>
            </div>
          </div>
          <SignIn 
            {...redirectUrls}
            {...commonProps}
            routing="hash"
          />
        </div>
      );

    case 'signup':
      return (
        <div className="space-y-4">
          <GoogleAuthButton 
            mode="signup" 
            redirectUrl={redirectUrls.afterSignUp}
            className="mb-4"
          />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou s'inscrire avec
              </span>
            </div>
          </div>
          <SignUp 
            afterSignUpUrl={redirectUrls.afterSignUp}
            afterSignInUrl={redirectUrls.afterSignIn}
            signInUrl={redirectUrls.signIn}
            {...commonProps}
            routing="hash"
          />
        </div>
      );

    case 'userprofile':
      return (
        <UserProfile 
          {...commonProps}
        />
      );

    case 'organizationprofile':
      return (
        <OrganizationProfile 
          {...commonProps}
        />
      );

    default:
      return null;
  }
}

/**
 * Composant SignIn avec configuration automatique
 */
export function ClerkSignIn({ lang = 'fr', className }: { lang?: string; className?: string }) {
  return <ClerkWrapper component="signin" lang={lang} className={className} />;
}

/**
 * Composant SignUp avec configuration automatique
 */
export function ClerkSignUp({ lang = 'fr', className }: { lang?: string; className?: string }) {
  return <ClerkWrapper component="signup" lang={lang} className={className} />;
}

/**
 * Composant UserProfile avec configuration automatique
 */
export function ClerkUserProfile({ className }: { className?: string }) {
  return <ClerkWrapper component="userprofile" className={className} />;
}

/**
 * Composant OrganizationProfile avec configuration automatique
 */
export function ClerkOrganizationProfile({ className }: { className?: string }) {
  return <ClerkWrapper component="organizationprofile" className={className} />;
}

export default ClerkWrapper;