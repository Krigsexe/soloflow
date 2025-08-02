-- Configuration pour l'authentification Google avec Clerk
-- À exécuter dans l'éditeur SQL de Supabase

-- Extension pour UUID si pas déjà créée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table pour stocker les informations d'authentification OAuth
CREATE TABLE IF NOT EXISTS user_oauth_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'google', 'github', etc.
  provider_account_id VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  token_type VARCHAR(50),
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, provider_account_id)
);

-- Table pour les sessions utilisateur
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  clerk_session_id VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les tentatives de connexion (sécurité)
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255),
  ip_address INET,
  success BOOLEAN DEFAULT FALSE,
  provider VARCHAR(50), -- 'email', 'google', 'github'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Amélioration de la table users pour Google Auth
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Index pour les nouvelles tables
CREATE INDEX IF NOT EXISTS idx_oauth_accounts_user_id ON user_oauth_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_accounts_provider ON user_oauth_accounts(provider, provider_account_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_clerk_id ON user_sessions(clerk_session_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Triggers pour updated_at sur les nouvelles tables
CREATE TRIGGER update_oauth_accounts_updated_at BEFORE UPDATE ON user_oauth_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS pour les nouvelles tables
ALTER TABLE user_oauth_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Politique pour les comptes OAuth (utilisateurs peuvent voir leurs propres comptes)
CREATE POLICY "Users can view own oauth accounts" ON user_oauth_accounts
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE clerk_id = auth.uid()::text
        )
    );

-- Politique pour les sessions (utilisateurs peuvent voir leurs propres sessions)
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE clerk_id = auth.uid()::text
        )
    );

-- Fonction pour nettoyer les sessions expirées
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour les statistiques de connexion
CREATE OR REPLACE FUNCTION update_user_login_stats(user_clerk_id TEXT)
RETURNS void AS $$
BEGIN
    UPDATE users 
    SET 
        last_login = NOW(),
        login_count = login_count + 1
    WHERE clerk_id = user_clerk_id;
END;
$$ LANGUAGE plpgsql;

-- Données de test pour l'admin
INSERT INTO users (email, first_name, last_name, role, clerk_id, email_verified) 
VALUES (
    'admin@soloflow.com', 
    'Admin', 
    'SoloFlow', 
    'admin', 
    'clerk_admin_test',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Commentaires pour la documentation
COMMENT ON TABLE user_oauth_accounts IS 'Stocke les informations des comptes OAuth (Google, GitHub, etc.)';
COMMENT ON TABLE user_sessions IS 'Gère les sessions utilisateur actives';
COMMENT ON TABLE login_attempts IS 'Journal des tentatives de connexion pour la sécurité';
COMMENT ON COLUMN users.google_id IS 'ID Google unique pour l\'authentification OAuth';
COMMENT ON COLUMN users.avatar_url IS 'URL de l\'avatar utilisateur (depuis Google ou uploadé)';
COMMENT ON COLUMN users.email_verified IS 'Indique si l\'email a été vérifié';
COMMENT ON COLUMN users.last_login IS 'Dernière connexion de l\'utilisateur';
COMMENT ON COLUMN users.login_count IS 'Nombre total de connexions';