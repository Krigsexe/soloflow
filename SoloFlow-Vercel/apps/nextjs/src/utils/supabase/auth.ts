import { createClient, createServerSupabaseClient } from '~/utils/supabase/server';
import { createClient as createClientBrowser } from '~/utils/supabase/client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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
 * Get current user from Supabase session (server-side)
 */
export async function getCurrentSupabaseUser(): Promise<SupabaseUser | null> {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    // Get user profile with role and permissions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      name: profile?.full_name || user.user_metadata?.full_name || null,
      image: profile?.avatar_url || user.user_metadata?.avatar_url || null,
      role: profile?.role || 'user',
      permissions: profile?.permissions || [],
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get current user session (client-side)
 */
export async function getCurrentSupabaseUserClient(): Promise<SupabaseUser | null> {
  try {
    const supabase = createClientBrowser();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    // Get user profile with role and permissions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      name: profile?.full_name || user.user_metadata?.full_name || null,
      image: profile?.avatar_url || user.user_metadata?.avatar_url || null,
      role: profile?.role || 'user',
      permissions: profile?.permissions || [],
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if user has specific permission
 */
export function hasPermission(user: SupabaseUser | null, permission: string): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return user.permissions?.includes(permission) || false;
}

/**
 * Check if user is admin
 */
export function isAdmin(user: SupabaseUser | null): boolean {
  return user?.role === 'admin' || false;
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth(): Promise<SupabaseUser> {
  const user = await getCurrentSupabaseUser();
  if (!user) {
    redirect('/auth/login');
  }
  return user;
}

/**
 * Require admin role - redirect if not admin
 */
export async function requireAdmin(): Promise<SupabaseUser> {
  const user = await requireAuth();
  if (!isAdmin(user)) {
    redirect('/dashboard');
  }
  return user;
}

/**
 * Require specific permission - redirect if not authorized
 */
export async function requirePermission(permission: string): Promise<SupabaseUser> {
  const user = await requireAuth();
  if (!hasPermission(user, permission)) {
    redirect('/dashboard');
  }
  return user;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  const supabase = createClientBrowser();
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email: string, password: string, metadata?: any) {
  const supabase = createClientBrowser();
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = createClientBrowser();
  return await supabase.auth.signOut();
}

/**
 * Update user profile
 */
export async function updateUserProfile(updates: Partial<UserProfile>) {
  const supabase = createClientBrowser();
  const user = await getCurrentSupabaseUserClient();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);
}

/**
 * Create user profile (called after sign up)
 */
export async function createUserProfile(userId: string, data: Partial<UserProfile>) {
  const supabase = createServerSupabaseClient();
  
  return await supabase
    .from('user_profiles')
    .insert({
      user_id: userId,
      full_name: data.full_name || null,
      avatar_url: data.avatar_url || null,
      role: data.role || 'user',
      permissions: data.permissions || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
}