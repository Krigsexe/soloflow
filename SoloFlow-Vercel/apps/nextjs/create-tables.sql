-- Script de création des tables pour SoloFlow
-- À exécuter dans l'éditeur SQL de Supabase

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url VARCHAR(255),
  subscription_plan VARCHAR(50) DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,
  is_admin BOOLEAN DEFAULT FALSE,
  clerk_user_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des générations de contenu
CREATE TABLE IF NOT EXISTS content_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  original_image_url VARCHAR(255) NOT NULL,
  extracted_text TEXT,
  user_comment TEXT,
  generated_content JSONB NOT NULL, -- {facebook: '', instagram: '', linkedin: '', telegram: ''}
  status VARCHAR(50) DEFAULT 'completed', -- pending, completed, failed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des publications sur les réseaux sociaux
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_generation_id UUID REFERENCES content_generations(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- facebook, instagram, linkedin, telegram
  status VARCHAR(50) NOT NULL, -- success, failed, pending
  platform_post_id VARCHAR(255),
  error_message TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_content_generations_user_id ON content_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_content_id ON social_posts(content_generation_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform);

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

CREATE TRIGGER update_content_generations_updated_at BEFORE UPDATE ON content_generations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

-- Politique pour les utilisateurs : ils peuvent voir et modifier leurs propres données
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = clerk_user_id);

-- Politique pour les générations de contenu
CREATE POLICY "Users can view own content generations" ON content_generations
    FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

CREATE POLICY "Users can create content generations" ON content_generations
    FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

CREATE POLICY "Users can update own content generations" ON content_generations
    FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

-- Politique pour les publications sociales
CREATE POLICY "Users can view own social posts" ON social_posts
    FOR SELECT USING (content_generation_id IN (
        SELECT id FROM content_generations WHERE user_id IN (
            SELECT id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    ));

CREATE POLICY "Users can create social posts" ON social_posts
    FOR INSERT WITH CHECK (content_generation_id IN (
        SELECT id FROM content_generations WHERE user_id IN (
            SELECT id FROM users WHERE clerk_user_id = auth.uid()::text
        )
    ));

-- Fonction pour créer un utilisateur automatiquement lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (clerk_user_id, email, full_name, avatar_url)
  VALUES (
    NEW.id::text,
    NEW.email_addresses[1]->>'email_address',
    COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''),
    NEW.image_url
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires pour documentation
COMMENT ON TABLE users IS 'Table des utilisateurs de l''application SoloFlow';
COMMENT ON TABLE content_generations IS 'Table des générations de contenu à partir d''images';
COMMENT ON TABLE social_posts IS 'Table des publications sur les réseaux sociaux';

COMMENT ON COLUMN users.clerk_user_id IS 'ID utilisateur Clerk pour l''authentification';
COMMENT ON COLUMN users.subscription_plan IS 'Plan d''abonnement: free, pro, enterprise';
COMMENT ON COLUMN content_generations.generated_content IS 'Contenu généré au format JSON pour chaque plateforme';
COMMENT ON COLUMN social_posts.platform IS 'Plateforme de publication: facebook, instagram, linkedin, telegram';

SELECT 'Tables créées avec succès pour SoloFlow!' as message;