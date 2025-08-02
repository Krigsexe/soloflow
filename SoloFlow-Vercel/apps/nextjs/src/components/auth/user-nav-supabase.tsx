'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Settings, Shield, User as UserIcon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@soloflow/ui/avatar';
import { Button } from '@soloflow/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@soloflow/ui/dropdown-menu';
import { Badge } from '@soloflow/ui/badge';
import { useToast } from '@soloflow/ui/use-toast';

import { createClient } from '~/utils/supabase/client';
import { signOut } from '~/utils/supabase/auth-client';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
  permissions: string[];
  avatar_url: string | null;
}

interface UserNavSupabaseProps {
  user?: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

export function UserNavSupabase({ user }: UserNavSupabaseProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    async function loadUserProfile() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error loading user profile:', error);
          // Utiliser les données de base si le profil n'existe pas
          setProfile({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || null,
            role: 'user',
            permissions: [],
            avatar_url: user.user_metadata?.avatar_url || null,
          });
        } else {
          setProfile({
            id: data.user_id,
            email: data.email,
            full_name: data.full_name,
            role: data.role,
            permissions: data.permissions || [],
            avatar_url: data.avatar_url,
          });
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserProfile();
  }, [user, supabase]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Déconnexion réussie',
        description: 'Vous avez été déconnecté avec succès.',
      });
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de vous déconnecter.',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'user': return 'Utilisateur';
      default: return 'Utilisateur';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Button variant="outline" onClick={() => router.push('/auth/login')}>
        Se connecter
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={profile.avatar_url || undefined} 
              alt={profile.full_name || profile.email} 
            />
            <AvatarFallback>
              {getInitials(profile.full_name, profile.email)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile.full_name || 'Utilisateur'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {profile.email}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge 
                variant="secondary" 
                className={`text-xs ${getRoleColor(profile.role)}`}
              >
                <Shield className="mr-1 h-3 w-3" />
                {getRoleLabel(profile.role)}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Navigation selon le rôle */}
        {profile.role === 'admin' ? (
          <DropdownMenuItem onClick={() => router.push('/admin')}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Administration</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => router.push('/dashboard/client')}>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Tableau de bord</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Paramètres</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Permissions */}
        {profile.permissions.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Permissions
            </DropdownMenuLabel>
            <div className="px-2 py-1">
              <div className="flex flex-wrap gap-1">
                {profile.permissions.slice(0, 3).map((permission) => (
                  <Badge key={permission} variant="outline" className="text-xs">
                    {permission.split('.')[1] || permission}
                  </Badge>
                ))}
                {profile.permissions.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{profile.permissions.length - 3}
                  </Badge>
                )}
              </div>
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}