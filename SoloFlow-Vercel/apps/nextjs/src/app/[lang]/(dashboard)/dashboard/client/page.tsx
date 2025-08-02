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
  LogOut,
  Play,
  Square,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { SignOutButton } from '@clerk/nextjs';
import { getDashboardData, getUserByClerkId, createUser, logActivity } from '~/lib/database/queries';
import { DashboardData } from '~/lib/database/types';

interface ClientDashboardPageProps {
  params: {
    lang: string;
  };
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'running':
    case 'active':
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'pending':
    case 'stopped':
    case 'inactive':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    default:
      return <Square className="h-4 w-4 text-gray-500" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'running':
    case 'active':
    case 'success':
      return 'bg-green-100 text-green-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    case 'pending':
    case 'stopped':
    case 'inactive':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default async function ClientDashboardPage({ params }: ClientDashboardPageProps) {
  const { userId } = auth();
  
  if (!userId) {
    redirect(`/${params.lang}/login-clerk`);
  }

  const user = await currentUser();
  if (!user) {
    redirect(`/${params.lang}/login-clerk`);
  }

  // Récupérer ou créer l'utilisateur dans la base de données
  let dbUser = await getUserByClerkId(userId);
  
  if (!dbUser) {
    // Créer l'utilisateur s'il n'existe pas
    dbUser = await createUser({
      email: user.emailAddresses[0]?.emailAddress || '',
      first_name: user.firstName || '',
      last_name: user.lastName || '',
      role: 'client',
      clerk_id: userId
    });
    
    if (dbUser) {
      // Logger l'activité de création de compte
      await logActivity({
        user_id: dbUser.id,
        action: 'Création de compte',
        resource_type: 'user',
        resource_id: dbUser.id,
        status: 'success'
      });
    }
  }

  if (!dbUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Impossible de charger les données utilisateur. Veuillez réessayer.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Récupérer toutes les données du dashboard
  const dashboardData = await getDashboardData(userId);
  
  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Impossible de charger les données du dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { stats, recentProjects, recentActivity, services } = dashboardData;

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Bienvenue, {user.firstName || user.emailAddresses[0]?.emailAddress}
          </h2>
          <p className="text-muted-foreground">
            Voici un aperçu de votre activité et de vos projets.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Projet
          </Button>
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
              {recentProjects.filter(p => p.status === 'active').length} actifs
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
              sur {services.length} total
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
            <div className="text-2xl font-bold">{stats.totalUsage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              de votre quota
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dernière Activité
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(stats.lastActivity).toLocaleDateString('fr-FR')}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(stats.lastActivity).toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Projets Récents */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Projets Récents</CardTitle>
            <CardDescription>
              Vos derniers projets et leur statut
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(project.status)}
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {project.description || 'Aucune description'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Database className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">Aucun projet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Commencez par créer votre premier projet.
                  </p>
                  <div className="mt-6">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nouveau Projet
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Services</CardTitle>
            <CardDescription>
              État de vos services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.length > 0 ? (
                services.slice(0, 5).map((service) => (
                  <div key={service.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <p className="font-medium text-sm">{service.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {service.type}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(service.status)}>
                      {service.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Server className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Aucun service configuré
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activité Récente */}
      <Card>
        <CardHeader>
          <CardTitle>Activité Récente</CardTitle>
          <CardDescription>
            Vos dernières actions sur la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                  {getStatusIcon(activity.status)}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.resource_type} • {new Date(activity.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <Badge className={getStatusColor(activity.status)}>
                    {activity.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">Aucune activité</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Votre activité apparaîtra ici.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}