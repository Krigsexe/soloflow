-- Schéma de base de données pour SoloFlow Dashboard
-- À exécuter dans Supabase SQL Editor

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  clerk_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des projets
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed', 'archived')),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('web', 'api', 'database', 'storage')),
  status VARCHAR(20) DEFAULT 'stopped' CHECK (status IN ('running', 'stopped', 'error')),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des activités
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),
  details JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'error', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_services_project_id ON services(project_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Politique pour les utilisateurs (peuvent voir leurs propres données)
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = clerk_id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = clerk_id);

-- Politique pour les projets (utilisateurs peuvent voir leurs propres projets)
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE clerk_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can manage own projects" ON projects
    FOR ALL USING (
        user_id IN (
            SELECT id FROM users WHERE clerk_id = auth.uid()::text
        )
    );

-- Politique pour les services (via les projets)
CREATE POLICY "Users can view services of own projects" ON services
    FOR SELECT USING (
        project_id IN (
            SELECT p.id FROM projects p
            JOIN users u ON p.user_id = u.id
            WHERE u.clerk_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can manage services of own projects" ON services
    FOR ALL USING (
        project_id IN (
            SELECT p.id FROM projects p
            JOIN users u ON p.user_id = u.id
            WHERE u.clerk_id = auth.uid()::text
        )
    );

-- Politique pour les activités
CREATE POLICY "Users can view own activities" ON activities
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE clerk_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can create own activities" ON activities
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM users WHERE clerk_id = auth.uid()::text
        )
    );

-- Politiques admin (peuvent tout voir)
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE clerk_id = auth.uid()::text AND role = 'admin'
        )
    );

CREATE POLICY "Admins can view all projects" ON projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE clerk_id = auth.uid()::text AND role = 'admin'
        )
    );

CREATE POLICY "Admins can view all services" ON services
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE clerk_id = auth.uid()::text AND role = 'admin'
        )
    );

CREATE POLICY "Admins can view all activities" ON activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE clerk_id = auth.uid()::text AND role = 'admin'
        )
    );

-- Données de test (optionnel)
INSERT INTO users (email, first_name, last_name, role, clerk_id) VALUES
('admin@soloflow.com', 'Admin', 'SoloFlow', 'admin', 'clerk_admin_test'),
('client@soloflow.com', 'Client', 'Test', 'client', 'clerk_client_test')
ON CONFLICT (email) DO NOTHING;

-- Projets de test
INSERT INTO projects (name, description, status, user_id) 
SELECT 
    'Projet Test 1',
    'Premier projet de test',
    'active',
    u.id
FROM users u WHERE u.email = 'client@soloflow.com'
ON CONFLICT DO NOTHING;

INSERT INTO projects (name, description, status, user_id) 
SELECT 
    'Projet Test 2',
    'Deuxième projet de test',
    'inactive',
    u.id
FROM users u WHERE u.email = 'client@soloflow.com'
ON CONFLICT DO NOTHING;

-- Services de test
INSERT INTO services (name, type, status, project_id, config)
SELECT 
    'API Backend',
    'api',
    'running',
    p.id,
    '{"port": 3001, "env": "development"}'
FROM projects p WHERE p.name = 'Projet Test 1'
ON CONFLICT DO NOTHING;

INSERT INTO services (name, type, status, project_id, config)
SELECT 
    'Base de données',
    'database',
    'running',
    p.id,
    '{"type": "postgresql", "version": "14"}'
FROM projects p WHERE p.name = 'Projet Test 1'
ON CONFLICT DO NOTHING;

-- Activités de test
INSERT INTO activities (user_id, action, resource_type, resource_id, status)
SELECT 
    u.id,
    'Création de projet',
    'project',
    p.id::text,
    'success'
FROM users u, projects p 
WHERE u.email = 'client@soloflow.com' AND p.name = 'Projet Test 1'
ON CONFLICT DO NOTHING;