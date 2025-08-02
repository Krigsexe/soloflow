"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@soloflow/ui";
import { AuthFallback } from "./auth-fallback";

type Dictionary = Record<string, string>;

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  lang: string;
  dict?: Dictionary;
  disabled?: boolean;
}

// Separate component for Clerk integration to avoid hook order issues
function ClerkAuthComponent({ lang, className, ...props }: { lang: string; className?: string }) {
  const [SignInComponent, setSignInComponent] = React.useState<React.ComponentType<any> | null>(null);
  const [isClerkReady, setIsClerkReady] = React.useState(false);
  const [clerkError, setClerkError] = React.useState<string | null>(null);
  const router = useRouter();

  // Dynamically import Clerk components to avoid SSR issues
  React.useEffect(() => {
    const loadClerk = async () => {
      try {
        const { SignIn } = await import('@clerk/nextjs');
        setSignInComponent(() => SignIn);
        setIsClerkReady(true);
        setClerkError(null);
      } catch (error) {
        console.error('Failed to load Clerk:', error);
        setClerkError('Failed to load authentication system');
        setIsClerkReady(false);
      }
    };
    
    loadClerk();
  }, []);

  if (clerkError) {
    return (
      <div className={cn("grid gap-6", className)} {...props}>
        <div className="flex items-center justify-center p-8">
          <p className="text-red-500">{clerkError}</p>
        </div>
      </div>
    );
  }

  if (!isClerkReady || !SignInComponent) {
    return (
      <div className={cn("grid gap-6", className)} {...props}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <ClerkSignInWrapper 
      SignInComponent={SignInComponent}
      lang={lang}
      className={className}
      {...props}
    />
  );
}

// Separate wrapper component that safely uses Clerk hooks
function ClerkSignInWrapper({ 
  SignInComponent, 
  lang, 
  className, 
  ...props 
}: { 
  SignInComponent: React.ComponentType<any>;
  lang: string;
  className?: string;
}) {
  const router = useRouter();
  const [isClerkLoaded, setIsClerkLoaded] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const [isUserLoaded, setIsUserLoaded] = React.useState(false);
  
  React.useEffect(() => {
    let mounted = true;
    
    const initializeClerk = async () => {
      try {
        const { useUser } = await import('@clerk/nextjs');
        
        if (!mounted) return;
        
        setIsClerkLoaded(true);
        
        // We can't use the hook here, so we'll use a different approach
        // Check authentication status via Clerk's client-side API
        const checkAuth = () => {
          try {
            // Use window.Clerk if available
            if (typeof window !== 'undefined' && (window as any).Clerk) {
              const clerkUser = (window as any).Clerk.user;
              setUser(clerkUser);
              setIsUserLoaded(true);
            } else {
              // Fallback: assume not loaded yet
              setTimeout(checkAuth, 100);
            }
          } catch (error) {
            console.error('Error checking auth:', error);
            setIsUserLoaded(true);
          }
        };
        
        checkAuth();
      } catch (error) {
        console.error('Failed to load Clerk:', error);
        if (mounted) {
          setIsClerkLoaded(true);
          setIsUserLoaded(true);
        }
      }
    };
    
    initializeClerk();
    
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (isUserLoaded && user) {
      router.push(`/${lang}/dashboard`);
    }
  }, [isUserLoaded, user, router, lang]);

  if (!isClerkLoaded || !isUserLoaded) {
    return (
      <div className={cn("grid gap-6", className)} {...props}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className={cn("grid gap-6", className)} {...props}>
        <div className="flex items-center justify-center p-8">
          <p>Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <SignInComponent 
        routing="hash"
        afterSignInUrl={`/${lang}/dashboard`}
        afterSignUpUrl={`/${lang}/dashboard`}
        redirectUrl={`/${lang}/dashboard`}
      />
    </div>
  );
}

export function UserClerkAuthForm({
  className,
  lang,
  dict,
  ...props
}: UserAuthFormProps) {
  const [shouldUseClerk, setShouldUseClerk] = React.useState(true);

  // Check if Clerk is properly configured
  React.useEffect(() => {
    const checkClerk = () => {
      try {
        // Check if Clerk keys are configured
        const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
        if (!publishableKey || publishableKey.includes('placeholder')) {
          setShouldUseClerk(false);
          return;
        }
        setShouldUseClerk(true);
      } catch (error) {
        console.error('Clerk configuration error:', error);
        setShouldUseClerk(false);
      }
    };
    
    checkClerk();
  }, []);

  // Show fallback if Clerk should not be used
  if (!shouldUseClerk) {
    return (
      <div className={cn("grid gap-6", className)} {...props}>
        <AuthFallback lang={lang} dict={dict} />
      </div>
    );
  }

  // Use Clerk component
  return (
    <ClerkAuthComponent 
      lang={lang} 
      className={className}
      {...props}
    />
  );
}
