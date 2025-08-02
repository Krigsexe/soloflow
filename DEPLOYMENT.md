# 🚀 Guide de Déploiement - SoloFlow

Ce guide vous accompagne dans le déploiement de SoloFlow sur Vercel avec Supabase comme backend.

## 📋 Table des matières

- [Prérequis](#prérequis)
- [Configuration Supabase](#configuration-supabase)
- [Configuration Clerk.dev](#configuration-clerkdev)
- [Déploiement Vercel](#déploiement-vercel)
- [Variables d'environnement](#variables-denvironnement)
- [Post-déploiement](#post-déploiement)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## 🔧 Prérequis

### Comptes requis

- ✅ [GitHub](https://github.com) (pour le code source)
- ✅ [Vercel](https://vercel.com) (pour l'hébergement)
- ✅ [Supabase](https://supabase.com) (pour la base de données)
- ✅ [Clerk.dev](https://clerk.dev) (pour l'authentification)
- ✅ [Stripe](https://stripe.com) (pour les paiements)
- ✅ [OpenAI](https://openai.com) (pour l'IA)

### Outils locaux

```bash
# Vérifiez que vous avez :
node --version  # v18+
bun --version   # latest
git --version   # 2.0+
```

## 🗄️ Configuration Supabase

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez sur "Start your project"
3. Créez une nouvelle organisation si nécessaire
4. Créez un nouveau projet :
   - **Name** : `soloflow-prod`
   - **Database Password** : Générez un mot de passe fort
   - **Region** : Choisissez la région la plus proche

### 2. Configuration de la base de données

#### Schéma de base

```sql
-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table des profils utilisateurs
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due')),
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des posts/contenus
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  platforms JSONB DEFAULT '[]'::jsonb,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  ai_generated BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des intégrations sociales
CREATE TABLE social_integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'instagram')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Index pour les performances
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_scheduled_at ON posts(scheduled_at);
CREATE INDEX idx_social_integrations_user_id ON social_integrations(user_id);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_integrations_updated_at BEFORE UPDATE ON social_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Row Level Security (RLS)

```sql
-- Activer RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_integrations ENABLE ROW LEVEL SECURITY;

-- Politiques pour profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Politiques pour posts
CREATE POLICY "Users can view own posts" ON posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour social_integrations
CREATE POLICY "Users can view own integrations" ON social_integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own integrations" ON social_integrations
  FOR ALL USING (auth.uid() = user_id);
```

### 3. Configuration de l'authentification

1. Allez dans **Authentication > Settings**
2. Configurez l'URL du site :
   - **Site URL** : `https://votre-domaine.vercel.app`
   - **Redirect URLs** : 
     - `https://votre-domaine.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback` (pour le dev)

### 4. Récupérer les clés

1. Allez dans **Settings > API**
2. Notez :
   - **Project URL** : `https://xxx.supabase.co`
   - **anon public** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🔐 Configuration Clerk.dev

### 1. Créer une application

1. Allez sur [clerk.dev](https://clerk.dev)
2. Créez une nouvelle application
3. Choisissez les méthodes d'authentification :
   - ✅ Email/Password
   - ✅ Google OAuth
   - ✅ GitHub OAuth (optionnel)

### 2. Configuration des domaines

1. Dans **Domains**, ajoutez :
   - **Development** : `http://localhost:3000`
   - **Production** : `https://votre-domaine.vercel.app`

### 3. Webhooks (optionnel)

1. Allez dans **Webhooks**
2. Créez un endpoint :
   - **URL** : `https://votre-domaine.vercel.app/api/webhooks/clerk`
   - **Events** : `user.created`, `user.updated`, `user.deleted`

### 4. Récupérer les clés

1. Dans **API Keys** :
   - **Publishable Key** : `pk_test_xxx`
   - **Secret Key** : `sk_test_xxx`

## 🚀 Déploiement Vercel

### 1. Méthode automatique (recommandée)

1. **Fork le repository** sur GitHub
2. Allez sur [vercel.com](https://vercel.com)
3. Cliquez sur "New Project"
4. Importez votre fork GitHub
5. Configurez :
   - **Framework Preset** : Next.js
   - **Root Directory** : `SoloFlow-Vercel`
   - **Build Command** : `bun run build`
   - **Install Command** : `bun install`

### 2. Méthode manuelle

```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Se connecter
vercel login

# 3. Déployer depuis le dossier du projet
cd SoloFlow-Vercel
vercel

# 4. Suivre les instructions
# - Link to existing project? No
# - Project name: soloflow
# - Directory: ./
# - Override settings? Yes
# - Build Command: bun run build
# - Install Command: bun install
```

### 3. Configuration du domaine

1. Dans Vercel Dashboard > **Domains**
2. Ajoutez votre domaine personnalisé
3. Configurez les DNS selon les instructions

## 🔑 Variables d'environnement

### Dans Vercel Dashboard

1. Allez dans **Settings > Environment Variables**
2. Ajoutez toutes les variables :

```bash
# App Configuration
NEXTAUTH_URL=https://votre-domaine.vercel.app
NEXTAUTH_SECRET=votre-secret-nextauth-super-long

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_xxx

# OpenAI
OPENAI_API_KEY=sk-xxx

# Email (Resend)
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@votre-domaine.com

# Analytics (PostHog)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Admin
ADMIN_EMAIL=admin@votre-domaine.com

# Production optimizations
NEXT_TELEMETRY_DISABLED=1
NODE_ENV=production
```

### Environnements

- **Production** : Variables pour le domaine principal
- **Preview** : Variables pour les branches de développement
- **Development** : Variables pour le développement local

## ✅ Post-déploiement

### 1. Vérifications

```bash
# Testez les endpoints critiques
curl https://votre-domaine.vercel.app/api/health
curl https://votre-domaine.vercel.app/api/auth/session
```

### 2. Configuration DNS

```
# Exemple de configuration DNS
Type    Name    Value                           TTL
A       @       76.76.19.61                     300
CNAME   www     votre-domaine.vercel.app        300
CNAME   api     votre-domaine.vercel.app        300
```

### 3. SSL/TLS

Vercel configure automatiquement SSL avec Let's Encrypt.

### 4. Tests de production

- [ ] Inscription/Connexion
- [ ] Création de contenu
- [ ] Intégrations sociales
- [ ] Paiements Stripe
- [ ] Génération IA
- [ ] Responsive design

## 📊 Monitoring

### 1. Vercel Analytics

1. Activez **Vercel Analytics** dans le dashboard
2. Ajoutez le script dans votre app :

```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Monitoring des erreurs

```tsx
// pages/_app.tsx ou app/layout.tsx
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 3. Logs

```bash
# Voir les logs en temps réel
vercel logs votre-domaine.vercel.app

# Logs d'une fonction spécifique
vercel logs votre-domaine.vercel.app --function=api/auth
```

## 🔧 Troubleshooting

### Problèmes courants

#### Build fails

```bash
# Vérifiez les logs de build
vercel logs --build

# Testez localement
bun run build
```

#### Variables d'environnement

```bash
# Vérifiez que toutes les variables sont définies
vercel env ls

# Ajoutez une variable manquante
vercel env add VARIABLE_NAME
```

#### Problèmes de base de données

```sql
-- Vérifiez les connexions
SELECT count(*) FROM pg_stat_activity;

-- Vérifiez les politiques RLS
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

#### Problèmes d'authentification

1. Vérifiez les URLs de redirection dans Clerk
2. Vérifiez les CORS dans Supabase
3. Vérifiez les variables d'environnement

### Support

- 📧 **Email** : support@votre-domaine.com
- 💬 **Discord** : [Lien vers votre Discord]
- 📚 **Documentation** : [Lien vers votre doc]
- 🐛 **Issues** : [GitHub Issues](https://github.com/Krigsexe/SoloFlow/issues)

---

## 🎉 Félicitations !

Votre application SoloFlow est maintenant déployée et prête à être utilisée ! 🚀

### Prochaines étapes

1. **Configurez le monitoring** pour surveiller les performances
2. **Mettez en place les sauvegardes** de base de données
3. **Configurez les alertes** pour les erreurs critiques
4. **Optimisez les performances** avec les métriques Vercel
5. **Planifiez les mises à jour** avec votre pipeline CI/CD

**Bon déploiement ! 🎯**