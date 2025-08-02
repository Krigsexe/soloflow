# 🗄️ Intégration Supabase - SoloFlow

## ✅ Configuration Complète

### 🔑 Variables d'environnement configurées

Les credentials Supabase sont déjà configurées dans `.env.local` :

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://vterkxdfyvhrnottcxhb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_URL=https://vterkxdfyvhrnottcxhb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 📁 Structure des utilitaires Supabase

```
src/utils/supabase/
├── client.ts          # Client Supabase pour les composants côté client
├── server.ts          # Client Supabase pour les Server Components
├── middleware.ts      # Client Supabase pour le middleware
├── index.ts          # Exports centralisés
└── example-usage.tsx # Exemples d'utilisation
```

## 🚀 Utilisation

### 1. Dans un Server Component

```tsx
import { createClient } from '~/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function ServerPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from('your_table')
    .select('*')

  return (
    <div>
      {data?.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
```

### 2. Dans un Client Component

```tsx
'use client'

import { createClient } from '~/utils/supabase/client'
import { useEffect, useState } from 'react'

export function ClientComponent() {
  const [data, setData] = useState([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('your_table')
        .select('*')
      setData(data || [])
    }
    fetchData()
  }, [])

  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
```

### 3. Dans le middleware

```tsx
import { createClient } from '~/utils/supabase/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)
  
  // Vérifier l'authentification
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return response
}
```

## 🔐 Authentification

### Inscription

```tsx
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})
```

### Connexion

```tsx
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})
```

### Déconnexion

```tsx
const { error } = await supabase.auth.signOut()
```

### Écouter les changements d'état

```tsx
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('Utilisateur connecté:', session.user)
  }
  if (event === 'SIGNED_OUT') {
    console.log('Utilisateur déconnecté')
  }
})
```

## 📊 Base de données

### Requêtes de base

```tsx
// SELECT
const { data, error } = await supabase
  .from('users')
  .select('*')

// INSERT
const { data, error } = await supabase
  .from('users')
  .insert({ name: 'John', email: 'john@example.com' })

// UPDATE
const { data, error } = await supabase
  .from('users')
  .update({ name: 'Jane' })
  .eq('id', userId)

// DELETE
const { data, error } = await supabase
  .from('users')
  .delete()
  .eq('id', userId)
```

### Requêtes avancées

```tsx
// Filtres
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('status', 'published')
  .gte('created_at', '2024-01-01')
  .order('created_at', { ascending: false })
  .limit(10)

// Jointures
const { data } = await supabase
  .from('posts')
  .select(`
    *,
    author:users(name, email),
    comments(content, created_at)
  `)
```

## 🔄 Temps réel

```tsx
// Écouter les changements sur une table
const subscription = supabase
  .channel('posts')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'posts'
  }, (payload) => {
    console.log('Changement détecté:', payload)
  })
  .subscribe()

// Se désabonner
subscription.unsubscribe()
```

## 📁 Stockage de fichiers

```tsx
// Upload
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('user-avatar.png', file)

// Download
const { data } = await supabase.storage
  .from('avatars')
  .download('user-avatar.png')

// URL publique
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('user-avatar.png')
```

## 🛠️ Outils de développement

### Scripts disponibles

- `node check-database.js` - Vérifier la connexion à la base de données
- `node setup-database.js` - Configurer les tables automatiquement

### Tables recommandées

Voir le fichier `create-tables.sql` pour les tables de base :
- `users` - Profils utilisateurs
- `content_generations` - Contenus générés
- `social_posts` - Publications sociales

## 🔧 Dépannage

### Erreurs courantes

1. **"Invalid API key"** - Vérifiez vos variables d'environnement
2. **"Row Level Security"** - Configurez les politiques RLS dans Supabase
3. **"CORS errors"** - Ajoutez votre domaine dans les paramètres Supabase

### Logs de débogage

```tsx
// Activer les logs détaillés
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    debug: true
  }
})
```

---

**✅ Intégration Supabase complète et prête à l'emploi !**