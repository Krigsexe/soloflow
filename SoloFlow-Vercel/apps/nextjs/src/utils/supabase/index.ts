// Export all Supabase utilities
export { createClient as createBrowserClient } from './client'
export { createClient as createServerClient } from './server'
export { createClient as createMiddlewareClient } from './middleware'

// Re-export types from Supabase
export type { User, Session } from '@supabase/supabase-js'

// Utility function to check if user is authenticated
export const isAuthenticated = (user: any): boolean => {
  return user && user.id
}

// Utility function to get user role
export const getUserRole = (user: any): string => {
  return user?.user_metadata?.role || 'user'
}