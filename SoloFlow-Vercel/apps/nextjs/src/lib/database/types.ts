// Types pour la base de données
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'client';
  created_at: string;
  updated_at: string;
  clerk_id?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'completed' | 'archived';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  type: 'web' | 'api' | 'database' | 'storage';
  status: 'running' | 'stopped' | 'error';
  project_id: string;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details?: Record<string, any>;
  status: 'success' | 'error' | 'pending';
  created_at: string;
}

export interface UserStats {
  projectsCount: number;
  activeServices: number;
  totalUsage: number;
  lastActivity: string;
}

export interface DashboardData {
  user: User;
  stats: UserStats;
  recentProjects: Project[];
  recentActivity: Activity[];
  services: Service[];
}