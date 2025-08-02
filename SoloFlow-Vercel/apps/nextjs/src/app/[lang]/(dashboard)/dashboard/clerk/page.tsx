import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@soloflow/ui/card';
import { Badge } from '@soloflow/ui/badge';
import { Button } from '@soloflow/ui/button';
import { Separator } from '@soloflow/ui/separator';
import { 
  User, 
  Settings, 
  CreditCard, 
  Activity, 
  Shield, 
  Clock,
  Database,
  Server,
  BarChart3,
  Plus,
  LogOut
} from 'lucide-react';
import { SignOutButton } from '@clerk/nextjs';

interface UserStats {
  projectsCount: number;
  activeServices: number;
  totalUsage: number;
  lastActivity: string;
}

interface RecentActivity {
  id: string;
  action: string;
  resource: string;
  timestamp: string;
  status: 'success' | 'error' | 'pending';
}

async function getUserStats(): Promise<UserStats> {
  // Simulation des statistiques utilisateur Clerk
  return {
    projectsCount: 2,
    activeServices: 4,
    totalUsage: 65.8,
    lastActivity: new Date().toISOString(),
  };
}

async function getRecentActivity(): Promise<RecentActivity[]> {
  // Simulation de l'activité récente
  return [
    {
      id: '1',
      action: 'Connexion',
      resource: 'Dashboard',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      status: 'success'
    },
    {
      id: '2',
      action: 'Création',
      resource: 'Nouveau projet',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'success'
    },
    {
      id: '3',
      action: 'Mise à jour',
      resource: 'Configuration',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending'
    }
  ];
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `Il y a ${diffInMinutes} min`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `Il y a ${hours}h`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `Il y a ${days}j`;
  }
}

export default async function ClerkDashboardPage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect('/fr/login-clerk');
  }

  const user = await currentUser();

  const stats = await getUserStats();
  const recentActivity = await getRecentActivity();

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Bienvenue, {user.firstName || user.emailAddresses[0]?.emailAddress}
          </h2>
          <p className="text-muted-foreground">
            Voici un aperçu de votre activité récente.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <SignOutButton>
            <Button variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </SignOutButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Projets
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projectsCount}</div>
            <p className="text-xs text-muted-foreground">
              +2 depuis le mois dernier
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Services Actifs
            </CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeServices}</div>
            <p className="text-xs text-muted-foreground">
              +1 depuis la semaine dernière
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Utilisation
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsage}%</div>
            <p className="text-xs text-muted-foreground">
              +5.2% depuis hier
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dernière Activité
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTimeAgo(stats.lastActivity)}
            </div>
            <p className="text-xs text-muted-foreground">
              Connexion au dashboard
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
            <CardDescription>
              Vos dernières actions sur la plateforme.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {activity.resource}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <Badge 
                      variant={activity.status === 'success' ? 'default' : 
                              activity.status === 'error' ? 'destructive' : 'secondary'}
                    >
                      {activity.status === 'success' ? 'Succès' :
                       activity.status === 'error' ? 'Erreur' : 'En cours'}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
            <CardDescription>
              Accès rapide aux fonctionnalités principales.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Projet
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <CreditCard className="mr-2 h-4 w-4" />
              Facturation
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <User className="mr-2 h-4 w-4" />
              Profil
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du Compte</CardTitle>
          <CardDescription>
            Détails de votre compte Clerk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">
                {user.emailAddresses[0]?.emailAddress}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Nom</p>
              <p className="text-sm text-muted-foreground">
                {user.firstName} {user.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">ID Utilisateur</p>
              <p className="text-sm text-muted-foreground font-mono">
                {user.id}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Dernière Connexion</p>
              <p className="text-sm text-muted-foreground">
                {formatTimeAgo(stats.lastActivity)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}