<div align="center">
  <img src="./SoloFlow-Vercel/saasfly-logo.svg" width="128" alt="SoloFlow Logo" />
  <h1>🚀 SoloFlow</h1>
  <p><strong>Automatisateur de présence digitale pour Solopreneurs</strong></p>
</div>

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-DB-green)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-black)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[🚀 Demo Live](https://soloflow.vercel.app) • [📖 Documentation](./docs) • [🐛 Signaler un Bug](https://github.com/Krigsexe/SoloFlow/issues)

</div>

---

## 🎯 Qu'est-ce que SoloFlow ?

SoloFlow est un **SaaS full-stack moderne** qui automatise la création et la diffusion de contenus web pour les **solopreneurs, micro-entrepreneurs et artisans**. 

✨ **Vision** : Prenez une photo, ajoutez un commentaire, et publiez automatiquement sur votre site et vos réseaux sociaux.

## 🌟 Fonctionnalités principales

- 📸 **Upload intelligent** : Drag & drop ou caméra directe
- 🧠 **IA générative** : Contenu optimisé avec GPT-4o
- 🌐 **Multi-réseaux** : Facebook, Instagram, LinkedIn, Telegram
- 🎨 **Design moderne** : Interface élégante avec Tailwind CSS
- 📊 **Dashboard complet** : Gestion et analytics en temps réel
- 🔒 **RGPD compliant** : Anonymisation et sécurité renforcée
- 🚀 **Déploiement facile** : Vercel + Supabase en un clic

## 🛠️ Stack technique

<table>
<tr>
<td><strong>Frontend</strong></td>
<td>Next.js 14, TypeScript, Tailwind CSS, Radix UI</td>
</tr>
<tr>
<td><strong>Backend</strong></td>
<td>Supabase (PostgreSQL), Edge Functions</td>
</tr>
<tr>
<td><strong>Auth</strong></td>
<td>Clerk.dev (OAuth, MFA)</td>
</tr>
<tr>
<td><strong>Paiements</strong></td>
<td>Stripe (Subscriptions)</td>
</tr>
<tr>
<td><strong>IA</strong></td>
<td>OpenAI GPT-4o, Google Vision API</td>
</tr>
<tr>
<td><strong>Déploiement</strong></td>
<td>Vercel (Frontend), Supabase (Backend)</td>
</tr>
<tr>
<td><strong>Monorepo</strong></td>
<td>Turborepo, Bun</td>
</tr>
</table>

## 🚀 Déploiement rapide

### 📋 Prérequis

- **Node.js** 18+ 
- **Bun** (recommandé) ou npm/yarn
- Compte **Vercel**
- Compte **Supabase**
- Compte **Clerk.dev**

### ⚡ Installation en 3 étapes

```bash
# 1. Cloner le repository
git clone https://github.com/Krigsexe/SoloFlow.git
cd SoloFlow/SoloFlow-Vercel

# 2. Installer les dépendances
bun install

# 3. Configurer l'environnement
cp .env.example .env.local

# 4. Lancer en développement
bun dev
```

### 🔧 Configuration des variables d'environnement

Éditez `.env.local` avec vos clés :

```bash
# App
NEXT_PUBLIC_APP_URL='https://votre-app.vercel.app'

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY='pk_test_...'
CLERK_SECRET_KEY='sk_test_...'

# Supabase
NEXT_PUBLIC_SUPABASE_URL='https://xxx.supabase.co'
NEXT_PUBLIC_SUPABASE_ANON_KEY='eyJ...'
SUPABASE_SERVICE_ROLE_KEY='eyJ...'

# Stripe
STRIPE_API_KEY='sk_test_...'
STRIPE_WEBHOOK_SECRET='whsec_...'

# OpenAI
OPENAI_API_KEY='sk-...'
```

## 🚀 Déploiement sur Vercel

### Option 1 : Déploiement automatique

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Krigsexe/SoloFlow&env=NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,CLERK_SECRET_KEY,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&project-name=soloflow&repository-name=soloflow)

### Option 2 : Déploiement manuel

```bash
# 1. Connecter à Vercel
npx vercel login

# 2. Déployer
npx vercel --prod

# 3. Configurer les variables d'environnement dans Vercel Dashboard
```

## 🗄️ Configuration Supabase

### 1. Créer un nouveau projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez l'URL et les clés API

### 2. Configurer la base de données

```sql
-- Activer RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Créer les tables principales
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Configurer l'authentification

1. Dans Supabase Dashboard → Authentication → Settings
2. Ajoutez votre domaine Vercel dans "Site URL"
3. Configurez les providers OAuth si nécessaire

## 🔐 Configuration Clerk.dev

### 1. Créer une application Clerk

1. Allez sur [clerk.dev](https://clerk.dev)
2. Créez une nouvelle application
3. Configurez les méthodes de connexion

### 2. Configurer les webhooks

```bash
# URL du webhook pour synchroniser avec Supabase
https://votre-app.vercel.app/api/webhooks/clerk
```

## 📁 Structure du projet

```
SoloFlow/
├── SoloFlow-Vercel/          # Monorepo principal
│   ├── apps/
│   │   ├── nextjs/           # Application Next.js
│   │   └── auth-proxy/       # Proxy d'authentification
│   ├── packages/
│   │   ├── api/              # API partagée
│   │   ├── auth/             # Logique d'authentification
│   │   ├── db/               # Schémas et migrations
│   │   ├── ui/               # Composants UI
│   │   └── stripe/           # Intégration Stripe
│   ├── tooling/              # Configuration ESLint, Prettier
│   ├── turbo.json            # Configuration Turborepo
│   ├── package.json          # Dépendances workspace
│   └── vercel.json           # Configuration Vercel
├── docs/                     # Documentation
├── .github/                  # GitHub Actions
└── README.md                 # Ce fichier
```

## 🧪 Tests et qualité

```bash
# Lancer les tests
bun test

# Vérifier le linting
bun lint

# Vérifier les types TypeScript
bun typecheck

# Formater le code
bun format
```

## 📚 Scripts disponibles

| Script | Description |
|--------|-------------|
| `bun dev` | Démarre le serveur de développement |
| `bun build` | Build de production |
| `bun start` | Démarre le serveur de production |
| `bun lint` | Vérifie le code avec ESLint |
| `bun test` | Lance les tests |
| `bun db:push` | Synchronise le schéma de base de données |

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez notre [guide de contribution](CONTRIBUTING.md).

### Processus de développement

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

- 📖 [Documentation complète](./docs)
- 🐛 [Signaler un bug](https://github.com/Krigsexe/SoloFlow/issues)
- 💬 [Discussions](https://github.com/Krigsexe/SoloFlow/discussions)
- 📧 Email : support@soloflow.io

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) pour le framework
- [Supabase](https://supabase.com/) pour le backend
- [Clerk](https://clerk.dev/) pour l'authentification
- [Vercel](https://vercel.com/) pour l'hébergement
- [Tailwind CSS](https://tailwindcss.com/) pour le styling

---

<div align="center">
  <p>Fait avec ❤️ par <a href="https://github.com/Krigsexe">Krigs</a></p>
  <p>⭐ N'oubliez pas de mettre une étoile si ce projet vous aide !</p>
</div>

# 4. Configurer les variables d'environnement
# Remplir les clés API dans .env.local

# 5. Lancer le serveur de développement
npm run dev
```

### Variables d'environnement requises

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Google Vision
GOOGLE_CLOUD_API_KEY=

# Réseaux sociaux
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
INSTAGRAM_ACCESS_TOKEN=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
TELEGRAM_BOT_TOKEN=
```

## 📁 Structure du projet

```
soloflow/
├── src/
│   ├── app/                 # App Router Next.js 14
│   ├── components/          # Composants réutilisables
│   ├── lib/                # Utilitaires et configurations
│   ├── hooks/              # Hooks React personnalisés
│   ├── types/              # Types TypeScript
│   └── styles/             # Styles globaux
├── public/                 # Assets statiques
├── supabase/              # Migrations et seed
├── .env.example           # Variables d'environnement
├── next.config.js         # Configuration Next.js
├── tailwind.config.js     # Configuration Tailwind
└── package.json          # Dépendances
```

## 🎯 Utilisation

### Pour les utilisateurs finaux
1. **Créer un compte** sur soloflow.proxitek.fr
2. **Uploader une image** via drag & drop ou caméra
3. **Ajouter un commentaire** ou laisser l'IA générer
4. **Sélectionner les plateformes** de publication
5. **Publier** en un clic !

### Pour les développeurs
```bash
# Mode développement
npm run dev

# Build pour production
npm run build

# Export statique (pour hébergement FTP)
npm run export

# Tests
npm run test
npm run test:e2e

# Linting
npm run lint
```

## 🎨 Design system

### Neumorphism tokens
```css
--neumorphism-shadow-light: 6px 6px 12px #d1d5db, -6px -6px 12px #ffffff;
--neumorphism-shadow-dark: 6px 6px 12px #1f2937, -6px -6px 12px #374151;
--neumorphism-shadow-inset: inset 6px 6px 12px #d1d5db, inset -6px -6px 12px #ffffff;
```

### Couleurs principales
- Primary: `#3b82f6` (blue-500)
- Secondary: `#8b5cf6` (purple-500)
- Background: `#f3f4f6` (gray-100)
- Text: `#111827` (gray-900)

## 🔐 Sécurité

- **Anonymisation des visages** (option utilisateur)
- **Chiffrement des données sensibles**
- **Validation des entrées utilisateur**
- **Protection CSRF**
- **Rate limiting**
- **Logs d'audit**

## 📊 Monitoring

- **Performance**: Vercel Analytics
- **Erreurs**: Sentry
- **Uptime**: Uptime Robot
- **Analytics**: PostHog

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Équipe

- **Lead Developer**: ODIN AI Assistant
- **Design**: Proxitek Studio
- **Support**: support@proxitek.fr

## 📞 Support

- **Email**: support@proxitek.fr
- **Documentation**: [docs.soloflow.proxitek.fr](https://docs.soloflow.proxitek.fr)
- **Issues**: [GitHub Issues](https://github.com/proxitek/soloflow/issues)

---

<p align="center">
  <i>Built with ❤️ by ODIN AI for Proxitek</i>
</p>