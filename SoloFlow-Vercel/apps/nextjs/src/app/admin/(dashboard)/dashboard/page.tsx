import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  CircleUser,
  CreditCard,
  DollarSign,
  Menu,
  Package2,
  Search,
  Users,
  Server,
  Database,
  Shield,
  AlertTriangle,
  TrendingUp,
  Clock,
  Settings,
  BarChart3,
  Globe,
  Zap,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Eye,
  UserCheck,
  Ban,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@soloflow/ui/avatar";
import { Button } from "@soloflow/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@soloflow/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@soloflow/ui/dropdown-menu";
import { Input } from "@soloflow/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@soloflow/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@soloflow/ui/table";
// Badge et Progress ne sont pas disponibles dans @soloflow/ui
// import { Badge } from "@soloflow/ui/badge";
// import { Progress } from "@soloflow/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@soloflow/ui/tabs";

// Composant pour les métriques admin
function AdminMetricCard({ title, value, description, icon: Icon, trend, status }: {
  title: string;
  value: string;
  description: string;
  icon: any;
  trend?: { value: number; isPositive: boolean };
  status?: 'success' | 'warning' | 'error' | 'info';
}) {
  const statusColors = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    info: 'text-blue-600'
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${status ? statusColors[status] : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className={`flex items-center text-xs mt-1 ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend.isPositive ? '+' : ''}{trend.value}% ce mois
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Composant pour le monitoring système
function SystemMonitoring() {
  const systemMetrics = [
    { name: 'CPU', value: 68, status: 'warning' as const },
    { name: 'RAM', value: 45, status: 'success' as const },
    { name: 'Disque', value: 82, status: 'error' as const },
    { name: 'Réseau', value: 23, status: 'success' as const },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Monitoring Système
        </CardTitle>
        <CardDescription>
          État en temps réel des ressources serveur
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {systemMetrics.map((metric) => (
          <div key={metric.name}>
            <div className="flex justify-between text-sm mb-2">
              <span className="flex items-center gap-2">
                {metric.name}
                {metric.status === 'error' && <AlertTriangle className="h-3 w-3 text-red-500" />}
                {metric.status === 'warning' && <AlertCircle className="h-3 w-3 text-yellow-500" />}
                {metric.status === 'success' && <CheckCircle className="h-3 w-3 text-green-500" />}
              </span>
              <span>{metric.value}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  metric.status === 'error' ? 'bg-red-500' :
                  metric.status === 'warning' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{width: `${metric.value}%`}}
              ></div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Composant pour la gestion des utilisateurs
function UserManagement() {
  const recentUsers = [
    {
      id: 1,
      name: 'Alice Martin',
      email: 'alice@example.com',
      status: 'active',
      lastLogin: '2 heures',
      plan: 'Pro'
    },
    {
      id: 2,
      name: 'Bob Dupont',
      email: 'bob@example.com',
      status: 'inactive',
      lastLogin: '2 jours',
      plan: 'Basic'
    },
    {
      id: 3,
      name: 'Claire Rousseau',
      email: 'claire@example.com',
      status: 'active',
      lastLogin: '1 heure',
      plan: 'Enterprise'
    },
    {
      id: 4,
      name: 'David Moreau',
      email: 'david@example.com',
      status: 'suspended',
      lastLogin: '1 semaine',
      plan: 'Pro'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Gestion des Utilisateurs
        </CardTitle>
        <CardDescription>
          Utilisateurs récents et leur statut
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  user.plan === 'Enterprise' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.plan}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full flex items-center ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' :
                    user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                  {user.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {user.status === 'inactive' && <Clock className="h-3 w-3 mr-1" />}
                  {user.status === 'suspended' && <Ban className="h-3 w-3 mr-1" />}
                  {user.status}
                </span>
                <Button variant="outline" size="sm">
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Composant pour les alertes système
function SystemAlerts() {
  const alerts = [
    {
      id: 1,
      type: 'error',
      title: 'Espace disque faible',
      message: 'Le serveur principal a atteint 85% de capacité',
      time: '5 min'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Charge CPU élevée',
      message: 'CPU à 78% sur le cluster de production',
      time: '12 min'
    },
    {
      id: 3,
      type: 'info',
      title: 'Mise à jour disponible',
      message: 'Nouvelle version du système disponible',
      time: '1 heure'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Alertes Système
        </CardTitle>
        <CardDescription>
          Notifications importantes du système
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg">
              <div className="mt-0.5">
                {alert.type === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                {alert.type === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                {alert.type === 'info' && <CheckCircle className="h-4 w-4 text-blue-500" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{alert.title}</p>
                <p className="text-xs text-muted-foreground">{alert.message}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                {alert.time}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  // Métriques administrateur
  const adminMetrics = [
    {
      title: "Utilisateurs Totaux",
      value: "2,847",
      description: "Utilisateurs actifs sur la plateforme",
      icon: Users,
      trend: { value: 12.5, isPositive: true },
      status: 'success' as const
    },
    {
      title: "Revenus Mensuels",
      value: "€45,231",
      description: "Revenus du mois en cours",
      icon: DollarSign,
      trend: { value: 8.2, isPositive: true },
      status: 'success' as const
    },
    {
      title: "Clusters Actifs",
      value: "127",
      description: "Clusters Kubernetes en fonctionnement",
      icon: Server,
      trend: { value: 3.1, isPositive: true },
      status: 'info' as const
    },
    {
      title: "Incidents",
      value: "3",
      description: "Incidents en cours de résolution",
      icon: AlertTriangle,
      trend: { value: 2.1, isPositive: false },
      status: 'warning' as const
    }
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="#"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Shield className="h-6 w-6" />
            <span className="sr-only">SoloFlow Admin</span>
          </Link>
          <Link
            href="#"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="#"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Utilisateurs
          </Link>
          <Link
            href="#"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Clusters
          </Link>
          <Link
            href="#"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Facturation
          </Link>
          <Link
            href="#"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Analytics
          </Link>
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="#"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Shield className="h-6 w-6" />
                <span className="sr-only">SoloFlow Admin</span>
              </Link>
              <Link href="#" className="hover:text-foreground">
                Dashboard
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Utilisateurs
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Clusters
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Facturation
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Analytics
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <form className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher utilisateurs, clusters..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </div>
          </form>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Paramètres</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Déconnexion</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* En-tête du dashboard */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrateur</h1>
            <p className="text-muted-foreground">
              Vue d'ensemble de la plateforme SoloFlow
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Button>
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {adminMetrics.map((metric, index) => (
            <AdminMetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Contenu principal avec onglets */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="system">Système</TabsTrigger>
            <TabsTrigger value="alerts">Alertes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <SystemMonitoring />
              <SystemAlerts />
            </div>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="system" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <SystemMonitoring />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Base de Données
                  </CardTitle>
                  <CardDescription>
                    Statistiques de la base de données
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Connexions actives</span>
                      <span className="px-2 py-1 text-xs border rounded-full bg-white text-gray-700">24/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Taille de la DB</span>
                      <span className="px-2 py-1 text-xs border rounded-full bg-white text-gray-700">2.4 GB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Requêtes/sec</span>
                      <span className="px-2 py-1 text-xs border rounded-full bg-white text-gray-700">1,247</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Temps de réponse moyen</span>
                      <span className="px-2 py-1 text-xs border rounded-full bg-white text-gray-700">12ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="alerts" className="space-y-4">
            <SystemAlerts />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
