import { createClient } from '@supabase/supabase-js';
import { User, Project, Service, Activity, UserStats, DashboardData } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Fonctions utilisateur
export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();

  if (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }

  return data;
}

export async function createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return null;
  }

  return data;
}

// Fonctions projets
export async function getUserProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    return [];
  }

  return data || [];
}

export async function createProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .insert([projectData])
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de la création du projet:', error);
    return null;
  }

  return data;
}

// Fonctions services
export async function getProjectServices(projectId: string): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors de la récupération des services:', error);
    return [];
  }

  return data || [];
}

export async function getUserServices(userId: string): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      projects!inner(user_id)
    `)
    .eq('projects.user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors de la récupération des services utilisateur:', error);
    return [];
  }

  return data || [];
}

// Fonctions activité
export async function getUserActivity(userId: string, limit: number = 10): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Erreur lors de la récupération de l\'activité:', error);
    return [];
  }

  return data || [];
}

export async function logActivity(activityData: Omit<Activity, 'id' | 'created_at'>): Promise<Activity | null> {
  const { data, error } = await supabase
    .from('activities')
    .insert([activityData])
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de l\'enregistrement de l\'activité:', error);
    return null;
  }

  return data;
}

// Fonctions statistiques
export async function getUserStats(userId: string): Promise<UserStats> {
  const [projects, services, activity] = await Promise.all([
    getUserProjects(userId),
    getUserServices(userId),
    getUserActivity(userId, 1)
  ]);

  const activeServices = services.filter(s => s.status === 'running').length;
  const totalUsage = services.reduce((acc, service) => {
    // Calcul simulé de l'usage basé sur le type de service
    const usage = service.type === 'database' ? 25 : service.type === 'api' ? 15 : 10;
    return acc + usage;
  }, 0);

  return {
    projectsCount: projects.length,
    activeServices,
    totalUsage,
    lastActivity: activity[0]?.created_at || new Date().toISOString()
  };
}

// Fonction principale pour récupérer toutes les données du dashboard
export async function getDashboardData(clerkId: string): Promise<DashboardData | null> {
  const user = await getUserByClerkId(clerkId);
  if (!user) {
    return null;
  }

  const [stats, recentProjects, recentActivity, services] = await Promise.all([
    getUserStats(user.id),
    getUserProjects(user.id),
    getUserActivity(user.id),
    getUserServices(user.id)
  ]);

  return {
    user,
    stats,
    recentProjects: recentProjects.slice(0, 5),
    recentActivity,
    services: services.slice(0, 10)
  };
}

// Fonctions admin
export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors de la récupération de tous les utilisateurs:', error);
    return [];
  }

  return data || [];
}

export async function getAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      users(email, first_name, last_name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors de la récupération de tous les projets:', error);
    return [];
  }

  return data || [];
}

export async function getSystemStats(): Promise<{
  totalUsers: number;
  totalProjects: number;
  totalServices: number;
  activeServices: number;
}> {
  const [usersCount, projectsCount, servicesData] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact' }),
    supabase.from('projects').select('id', { count: 'exact' }),
    supabase.from('services').select('status')
  ]);

  const totalServices = servicesData.data?.length || 0;
  const activeServices = servicesData.data?.filter(s => s.status === 'running').length || 0;

  return {
    totalUsers: usersCount.count || 0,
    totalProjects: projectsCount.count || 0,
    totalServices,
    activeServices
  };
}