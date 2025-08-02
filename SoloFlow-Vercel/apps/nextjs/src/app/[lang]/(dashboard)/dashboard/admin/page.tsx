import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@soloflow/ui/card';
import { Badge } from '@soloflow/ui/badge';
import { Button } from '@soloflow/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@soloflow/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@soloflow/ui/avatar';
// Progress component not available in @soloflow/ui
import { 
  Users, 
  FolderOpen, 
  Activity, 
  TrendingUp, 
  Shield, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  UserCheck,
  Database
} from 'lucide-react';
import { getUserByClerkId, createUser, getAllUsers, getAllProjects, getSystemStats } from '~/lib/database/queries';
import { logActivity } from '~/lib/database/queries';
import type { User, Project, SystemStats } from '~/lib/database/types';

interface AdminDashboardData {
  systemStats: SystemStats;
  recentUsers: User[];
  recentProjects: Project[];
  adminUser: User;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
    case 'completed':
      return 'bg-green-500';
    case 'pending':
    case 'in_progress':
      return 'bg-yellow-500';
    case 'inactive':
    case 'cancelled':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
    case 'completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'pending':
    case 'in_progress':
      return <Clock className="h-4 w-4" />;
    case 'inactive':
    case 'cancelled':
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

async function getAdminDashboardData(userId: string): Promise<AdminDashboardData> {
  try {
    // Vérifier si l'utilisateur existe, sinon le créer
    let adminUser = await getUserByClerkId(userId);
    if (!adminUser) {
      const clerkUser = await currentUser();
      if (!clerkUser) throw new Error('Utilisateur Clerk non trouvé');
      
      adminUser = await createUser({
        clerk_id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        role: 'admin' // Assumer que c'est un admin
      });
    }

    // Vérifier que l'utilisateur est bien admin
    if (adminUser.role !== 'admin') {
      throw new Error('Accès non autorisé - Droits administrateur requis');
    }

    // Récupérer les données système
    const [systemStats, recentUsers, recentProjects] = await Promise.all([
      getSystemStats(),
      getAllUsers(10), // 10 utilisateurs les plus récents
      getAllProjects(10) // 10 projets les plus récents
    ]);

    // Logger l'activité admin
    await logActivity({
      user_id: adminUser.id,
      action: 'admin_dashboard_access',
      details: 'Accès au tableau de bord administrateur'
    });

    return {
      systemStats,
      recentUsers,
      recentProjects,
      adminUser
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des données admin:', error);
    throw error;
  }
}

export default async function AdminDashboard() {
  const { userId } = auth();
  
  if (!userId) {
    redirect('/login-clerk');
  }

  try {
    const dashboardData = await getAdminDashboardData(userId);
    const { systemStats, recentUsers, recentProjects, adminUser } = dashboardData;

    return (
      <div className="container mx-auto p-6 space-y-8">
        {/* En-tête Admin */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tableau de Bord Administrateur
              </h1>
              <p className="text-gray-600">
                Bienvenue, {adminUser.name} - Gestion système complète
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <UserCheck className="h-4 w-4 mr-1" />
            Administrateur
          </Badge>
        </div>

        {/* Statistiques Système */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{systemStats.newUsersThisMonth} ce mois
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projets Total</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                +{systemStats.newProjectsThisMonth} ce mois
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Services Actifs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.activeServices}</div>
              <p className="text-xs text-muted-foreground">
                {systemStats.totalServices} services total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus Mensuel</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.monthlyRevenue}€</div>
              <p className="text-xs text-muted-foreground">
                +{systemStats.revenueGrowth}% vs mois dernier
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Onglets de Gestion */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Utilisateurs</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center space-x-2">
              <FolderOpen className="h-4 w-4" />
              <span>Projets</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytiques</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Système</span>
            </TabsTrigger>
          </TabsList>

          {/* Gestion des Utilisateurs */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Utilisateurs Récents</span>
                </CardTitle>
                <CardDescription>
                  Gestion et supervision des comptes utilisateurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
                          <AvatarFallback>
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">
                            Inscrit le {new Date(user.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={user.role === 'admin' ? 'default' : 'secondary'}
                          className={user.role === 'admin' ? 'bg-blue-100 text-blue-800' : ''}
                        >
                          {user.role}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor('active')}`} />
                          <span className="text-xs text-gray-500">Actif</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestion des Projets */}
          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FolderOpen className="h-5 w-5" />
                  <span>Projets Récents</span>
                </CardTitle>
                <CardDescription>
                  Supervision et gestion des projets système
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg ${getStatusColor(project.status)} flex items-center justify-center`}>
                          {getStatusIcon(project.status)}
                        </div>
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-gray-600">{project.description}</p>
                          <p className="text-xs text-gray-500">
                            Créé le {new Date(project.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {project.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytiques */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Croissance Utilisateurs</CardTitle>
                  <CardDescription>Évolution mensuelle</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Nouveaux utilisateurs</span>
                      <span className="font-medium">{systemStats.newUsersThisMonth}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                    <p className="text-xs text-gray-600">
                      +25% par rapport au mois dernier
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Système</CardTitle>
                  <CardDescription>Métriques en temps réel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Utilisation CPU</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '45%'}}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Utilisation Mémoire</span>
                      <span className="font-medium">62%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{width: '62%'}}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Système */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>État Base de Données</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Connexions actives</span>
                      <Badge variant="outline">12/100</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Taille DB</span>
                      <Badge variant="outline">2.4 GB</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Dernière sauvegarde</span>
                      <Badge variant="outline">Il y a 2h</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Actions Système</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Database className="h-4 w-4 mr-2" />
                      Sauvegarder Base de Données
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Activity className="h-4 w-4 mr-2" />
                      Vider Cache Système
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Générer Rapport
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (error) {
    console.error('Erreur dashboard admin:', error);
    
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Erreur d'Accès</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              {error instanceof Error ? error.message : 'Accès non autorisé au tableau de bord administrateur.'}
            </p>
            <p className="text-sm text-red-600 mt-2">
              Veuillez contacter l'administrateur système si vous pensez qu'il s'agit d'une erreur.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
}