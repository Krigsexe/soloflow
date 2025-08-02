import { auth } from '@clerk/nextjs/server'

import { env } from "./env.mjs";

export async function getSessionUser() {
  // Temporarily disable Clerk if no valid publishable key is configured
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith('pk_test_your_key_here')) {
    return null;
  }
  
  try {
    // Check if we're in a context where auth() can be called
    if (typeof window !== 'undefined') {
      // Client-side, return null for now
      return null;
    }
    
    const { sessionClaims } = await auth();
    if (env.ADMIN_EMAIL) {
      const adminEmails = env.ADMIN_EMAIL.split(",");
      if (sessionClaims?.user?.email) {
        sessionClaims.user.isAdmin = adminEmails.includes(sessionClaims?.user?.email);
      }
    }
    return sessionClaims?.user;
  } catch (error) {
    // Silently return null instead of logging errors during development
    return null;
  }
}
