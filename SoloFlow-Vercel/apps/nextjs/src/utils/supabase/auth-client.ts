import { createClient } from '~/utils/supabase/client';

export interface SupabaseUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role?: 'admin' | 'user' | null;
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  role: 'admin' | 'user';
  permissions: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Get current user from Supabase session (client-side)
 */
export async function getCurrentSupabaseUserClient(): Promise<SupabaseUser | null> {
  try {
    const supabase = createClient();
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      return null;
    }
    
    if (!session?.user) {
      return null;
    }
    
    // Get user profile with role and permissions
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        user_id,
        full_name,
        avatar_url,
        role,
        permissions
      `)
      .eq('user_id', session.user.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      // Return basic user info even if profile fetch fails
      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.full_name || null,
        image: session.user.user_metadata?.avatar_url || null,
        role: 'user',
        permissions: [],
        created_at: session.user.created_at,
        updated_at: session.user.updated_at,
      };
    }
    
    return {
      id: session.user.id,
      email: session.user.email,
      name: profile?.full_name || session.user.user_metadata?.full_name || null,
      image: profile?.avatar_url || session.user.user_metadata?.avatar_url || null,
      role: profile?.role || 'user',
      permissions: profile?.permissions || [],
      created_at: session.user.created_at,
      updated_at: session.user.updated_at,
    };
  } catch (error) {
    console.error('Error in getCurrentSupabaseUserClient:', error);
    return null;
  }
}

/**
 * Check if user has specific permission (client-side)
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const user = await getCurrentSupabaseUserClient();
  return user?.permissions?.includes(permission) || false;
}

/**
 * Check if user is admin (client-side)
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentSupabaseUserClient();
  return user?.role === 'admin';
}

/**
 * Sign in with email and password (client-side)
 */
export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

/**
 * Sign up with email and password (client-side)
 */
export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

/**
 * Sign out (client-side)
 */
export async function signOut() {
  const supabase = createClient();
  
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
}

/**
 * Update user profile (client-side)
 */
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

/**
 * Create user profile (client-side)
 */
export async function createUserProfile(userId: string, profileData: Partial<UserProfile>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      role: 'user',
      permissions: [],
      ...profileData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

/**
 * Require authentication (client-side)
 * Note: This is a simplified version for client-side use
 * For server-side protection, use the server auth functions
 */
export async function requireAuth(): Promise<SupabaseUser> {
  const user = await getCurrentSupabaseUserClient();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

/**
 * Require admin role (client-side)
 * Note: This is a simplified version for client-side use
 * For server-side protection, use the server auth functions
 */
export async function requireAdmin(): Promise<SupabaseUser> {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }
  
  return user;
}

/**
 * Get current user (alias for getCurrentSupabaseUserClient)
 */
export const getCurrentUser = getCurrentSupabaseUserClient;