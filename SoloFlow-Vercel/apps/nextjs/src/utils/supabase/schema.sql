-- Schema SQL pour l'authentification et les permissions Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Table des permissions disponibles (optionnel, pour référence)
CREATE TABLE IF NOT EXISTS permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer les permissions de base
INSERT INTO permissions (name, description, category) VALUES
  ('dashboard.view', 'Voir le tableau de bord', 'dashboard'),
  ('dashboard.admin', 'Accès admin au tableau de bord', 'dashboard'),
  ('users.view', 'Voir les utilisateurs', 'users'),
  ('users.edit', 'Modifier les utilisateurs', 'users'),
  ('users.delete', 'Supprimer les utilisateurs', 'users'),
  ('clusters.view', 'Voir les clusters', 'clusters'),
  ('clusters.create', 'Créer des clusters', 'clusters'),
  ('clusters.edit', 'Modifier les clusters', 'clusters'),
  ('clusters.delete', 'Supprimer les clusters', 'clusters'),
  ('billing.view', 'Voir la facturation', 'billing'),
  ('billing.manage', 'Gérer la facturation', 'billing'),
  ('settings.view', 'Voir les paramètres', 'settings'),
  ('settings.edit', 'Modifier les paramètres', 'settings')
ON CONFLICT (name) DO NOTHING;

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer automatiquement un profil utilisateur lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil lors de l'inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Politiques RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent modifier leur propre profil (sauf role et permissions)
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND role = OLD.role AND permissions = OLD.permissions);

-- Politique : Les admins peuvent tout voir
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Politique : Les admins peuvent tout modifier
CREATE POLICY "Admins can update all profiles" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Politique : Les admins peuvent supprimer des profils
CREATE POLICY "Admins can delete profiles" ON user_profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Politique pour la table permissions (lecture seule pour tous les utilisateurs authentifiés)
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view permissions" ON permissions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Fonction pour vérifier les permissions
CREATE OR REPLACE FUNCTION public.user_has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  user_permissions TEXT[];
BEGIN
  -- Récupérer le rôle et les permissions de l'utilisateur
  SELECT role, permissions INTO user_role, user_permissions
  FROM user_profiles
  WHERE user_id = auth.uid();
  
  -- Si admin, toutes les permissions sont accordées
  IF user_role = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Vérifier si l'utilisateur a la permission spécifique
  RETURN permission_name = ANY(user_permissions);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les informations utilisateur complètes
CREATE OR REPLACE FUNCTION public.get_user_info()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT,
  permissions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    p.full_name,
    p.avatar_url,
    p.role,
    p.permissions,
    p.created_at,
    p.updated_at
  FROM auth.users u
  LEFT JOIN user_profiles p ON u.id = p.user_id
  WHERE u.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le premier utilisateur admin (à modifier avec votre email)
-- IMPORTANT: Remplacez 'admin@example.com' par votre vraie adresse email
/*
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'admin@example.com',
  crypt('your_password_here', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);

-- Mettre à jour le profil pour en faire un admin
UPDATE user_profiles 
SET role = 'admin', permissions = ARRAY[
  'dashboard.view', 'dashboard.admin', 'users.view', 'users.edit', 'users.delete',
  'clusters.view', 'clusters.create', 'clusters.edit', 'clusters.delete',
  'billing.view', 'billing.manage', 'settings.view', 'settings.edit'
]
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
*/

-- Vues utiles pour l'administration
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
  u.id,
  u.email,
  u.created_at as user_created_at,
  u.last_sign_in_at,
  p.full_name,
  p.avatar_url,
  p.role,
  p.permissions,
  p.created_at as profile_created_at,
  p.updated_at as profile_updated_at
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC;

-- Politique pour la vue admin (seulement les admins peuvent voir)
CREATE POLICY "Only admins can view admin_users_view" ON admin_users_view
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );