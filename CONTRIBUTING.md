# 🤝 Guide de Contribution - SoloFlow

Merci de votre intérêt pour contribuer à SoloFlow ! Ce guide vous aidera à démarrer.

## 📋 Table des matières

- [Code de conduite](#code-de-conduite)
- [Comment contribuer](#comment-contribuer)
- [Configuration de l'environnement](#configuration-de-lenvironnement)
- [Processus de développement](#processus-de-développement)
- [Standards de code](#standards-de-code)
- [Tests](#tests)
- [Documentation](#documentation)

## 📜 Code de conduite

En participant à ce projet, vous acceptez de respecter notre [Code de Conduite](CODE_OF_CONDUCT.md).

## 🚀 Comment contribuer

### Types de contributions

- 🐛 **Correction de bugs**
- ✨ **Nouvelles fonctionnalités**
- 📚 **Amélioration de la documentation**
- 🧪 **Ajout de tests**
- 🎨 **Améliorations UI/UX**
- ⚡ **Optimisations de performance**

### Avant de commencer

1. Vérifiez les [issues existantes](https://github.com/Krigsexe/SoloFlow/issues)
2. Créez une issue pour discuter des changements majeurs
3. Assurez-vous que votre contribution s'aligne avec la vision du projet

## 🛠️ Configuration de l'environnement

### Prérequis

- **Node.js** 18+
- **Bun** (recommandé) ou npm/yarn
- **Git**
- Compte **Supabase** (pour les tests)
- Compte **Clerk.dev** (pour l'auth)

### Installation

```bash
# 1. Fork et cloner le repository
git clone https://github.com/VOTRE-USERNAME/SoloFlow.git
cd SoloFlow/SoloFlow-Vercel

# 2. Installer les dépendances
bun install

# 3. Copier et configurer l'environnement
cp .env.example .env.local
# Éditez .env.local avec vos clés de test

# 4. Lancer en mode développement
bun dev
```

## 🔄 Processus de développement

### 1. Créer une branche

```bash
# Créer une branche depuis main
git checkout main
git pull origin main
git checkout -b feature/nom-de-votre-feature

# Ou pour un bugfix
git checkout -b fix/description-du-bug
```

### 2. Développer

- Écrivez du code propre et documenté
- Suivez les conventions de nommage
- Ajoutez des tests pour les nouvelles fonctionnalités
- Testez localement avant de commit

### 3. Commit

Utilisez des messages de commit clairs :

```bash
# Format recommandé
type(scope): description

# Exemples
feat(auth): add Google OAuth integration
fix(ui): resolve mobile navigation issue
docs(readme): update installation instructions
test(api): add unit tests for user service
```

### 4. Push et Pull Request

```bash
# Push votre branche
git push origin feature/nom-de-votre-feature

# Créez une Pull Request sur GitHub
```

## 📏 Standards de code

### TypeScript

- Utilisez TypeScript strict
- Définissez des types explicites
- Évitez `any`, préférez `unknown`

```typescript
// ✅ Bon
interface User {
  id: string;
  email: string;
  name?: string;
}

// ❌ Éviter
const user: any = getData();
```

### React/Next.js

- Utilisez les composants fonctionnels
- Préférez les hooks personnalisés
- Suivez les conventions de nommage

```tsx
// ✅ Bon
const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const { user, loading } = useUser(userId);
  
  if (loading) return <LoadingSpinner />;
  
  return <div>{user?.name}</div>;
};
```

### CSS/Tailwind

- Utilisez Tailwind CSS en priorité
- Créez des composants réutilisables
- Respectez le design system

```tsx
// ✅ Bon
<button className="btn btn-primary">
  Click me
</button>

// ❌ Éviter les styles inline
<button style={{ backgroundColor: 'blue' }}>
  Click me
</button>
```

## 🧪 Tests

### Lancer les tests

```bash
# Tous les tests
bun test

# Tests en mode watch
bun test:watch

# Tests avec coverage
bun test:coverage
```

### Écrire des tests

```typescript
// Exemple de test unitaire
import { render, screen } from '@testing-library/react';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  it('should display user name', () => {
    const user = { id: '1', name: 'John Doe' };
    render(<UserProfile user={user} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

## 📚 Documentation

### Code

- Commentez le code complexe
- Utilisez JSDoc pour les fonctions publiques
- Maintenez le README à jour

```typescript
/**
 * Calcule le score de similarité entre deux textes
 * @param text1 - Premier texte à comparer
 * @param text2 - Deuxième texte à comparer
 * @returns Score entre 0 et 1 (1 = identique)
 */
function calculateSimilarity(text1: string, text2: string): number {
  // Implémentation...
}
```

### Changements

- Documentez les breaking changes
- Mettez à jour le CHANGELOG
- Ajoutez des exemples d'utilisation

## ✅ Checklist avant Pull Request

- [ ] Le code compile sans erreurs
- [ ] Tous les tests passent
- [ ] Le linting passe (`bun lint`)
- [ ] Les types TypeScript sont corrects (`bun typecheck`)
- [ ] La documentation est mise à jour
- [ ] Les changements sont testés localement
- [ ] Le message de commit est clair
- [ ] La PR a une description détaillée

## 🔍 Review Process

1. **Automated checks** : Tests, linting, build
2. **Code review** : Au moins un maintainer doit approuver
3. **Testing** : Vérification manuelle si nécessaire
4. **Merge** : Squash and merge vers main

## 🆘 Besoin d'aide ?

- 💬 [Discussions GitHub](https://github.com/Krigsexe/SoloFlow/discussions)
- 🐛 [Issues](https://github.com/Krigsexe/SoloFlow/issues)
- 📧 Email : dev@soloflow.io

## 🙏 Reconnaissance

Tous les contributeurs seront ajoutés au fichier [CONTRIBUTORS.md](CONTRIBUTORS.md) et mentionnés dans les releases.

---

Merci de contribuer à SoloFlow ! 🚀