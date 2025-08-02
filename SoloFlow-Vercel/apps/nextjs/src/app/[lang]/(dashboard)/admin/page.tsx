import { redirect } from 'next/navigation';
import { Users, Shield, Settings, Activity, UserCheck, UserX } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@soloflow/ui/card';
import { Button } from '@soloflow/ui/button';
import { Badge } from '@soloflow/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@soloflow/ui/table';

import { requireAdmin, type SupabaseUser } from '~/utils/supabase/auth-client';
import { createClient } from '~/utils/supabase/server';
import { DashboardHeader } from '~/components/header';
import { DashboardShell } from '~/components/shell';
import { UserManagementActions } from '~/components/admin/user-management-actions';
import type { Locale } from '~/config/i18n-config';
import { getDictionary } from '~/lib/get-dictionary';

interface AdminPageProps {
  params: {
    lang: Locale;
  };
}

interface UserWithProfile {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  full_name: string | null;
  role: 'admin' | 'user';
  permissions: string[];
  profile_created_at: string;
  profile_updated_at: string;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  newUsersThisMonth: number;
}

async function getAdminStats(): Promise<AdminStats> {
  const supabase = createClient();
  
  // Total des utilisateurs
  const { count: totalUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true });

  // Utilisateurs actifs (connectés dans les 30 derniers jours)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: activeUsersData } = await supabase
    .rpc('get_active_users_count', { days_ago: 30 });

  // Administrateurs
  const { count: adminUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'admin');

  // Nouveaux utilisateurs ce mois
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const { count: newUsersThisMonth } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString());

  return {
    totalUsers: totalUsers || 0,
    activeUsers: activeUsersData || 0,
    adminUsers: adminUsers || 0,
    newUsersThisMonth: newUsersThisMonth || 0,
  };
}

async function getAllUsers(): Promise<UserWithProfile[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('admin_users_view')
    .select('*')
    .order('user_created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data || [];
}

function StatsCard({ title, value, description, icon: Icon, trend }: {
  title: string;
  value: string | number;
  description: string;
  icon: any;
  trend?: { value: number; isPositive: boolean };
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className={`text-xs ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? '+' : ''}{trend.value}% par rapport au mois dernier
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Jamais';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case 'admin':
      return 'destructive';
    case 'user':
      return 'secondary';
    default:
      return 'outline';
  }
}

export default async function AdminPage({ params: { lang } }: AdminPageProps) {
  // Vérifier que l'utilisateur est admin
  const currentUser = await requireAdmin();
  const dict = await getDictionary(lang);
  
  // Récupérer les statistiques et utilisateurs
  const [stats, users] = await Promise.all([
    getAdminStats(),
    getAllUsers(),
  ]);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Administration"
        text="Gérez les utilisateurs, les permissions et les paramètres système."
      />
      
      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Utilisateurs"
          value={stats.totalUsers}
          description="Nombre total d'utilisateurs inscrits"
          icon={Users}
        />
        <StatsCard
          title="Utilisateurs Actifs"
          value={stats.activeUsers}
          description="Connectés dans les 30 derniers jours"
          icon={Activity}
        />
        <StatsCard
          title="Administrateurs"
          value={stats.adminUsers}
          description="Utilisateurs avec privilèges admin"
          icon={Shield}
        />
        <StatsCard
          title="Nouveaux ce mois"
          value={stats.newUsersThisMonth}
          description="Inscriptions ce mois-ci"
          icon={UserCheck}
        />
      </div>

      {/* Gestion des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Utilisateurs</CardTitle>
          <CardDescription>
            Gérez les comptes utilisateurs, leurs rôles et permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                  <TableHead>Inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="font-medium">
                          {user.full_name || 'Nom non défini'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.permissions.length > 0 ? (
                          user.permissions.slice(0, 3).map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">Aucune</span>
                        )}
                        {user.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.permissions.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {formatDate(user.last_sign_in_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {formatDate(user.created_at)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <UserManagementActions 
                        user={user} 
                        currentUserId={currentUser.id}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {users.length === 0 && (
            <div className="text-center py-8">
              <UserX className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
                Aucun utilisateur trouvé
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Les utilisateurs apparaîtront ici une fois inscrits.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>
            Accès rapide aux fonctionnalités d'administration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-20 flex-col">
              <Settings className="h-6 w-6 mb-2" />
              Paramètres Système
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Shield className="h-6 w-6 mb-2" />
              Gestion Permissions
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Activity className="h-6 w-6 mb-2" />
              Logs d'Activité
            </Button>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}