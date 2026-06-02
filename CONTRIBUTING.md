# Guide de Contribution

## Code de Conduite

Ce projet adhère au [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/).

## Comment Contribuer

### Rapport de Bug

Pour rapporter un bug:
1. Vérifier qu'il n'existe pas déjà une issue
2. Ouvrir une [nouvelle issue](../../issues)
3. Inclure:
   - Description claire du problème
   - Étapes pour reproduire
   - Comportement attendu vs actuel
   - Environnement (OS, Node version, etc.)

### Suggestion de Feature

Pour suggérer une feature:
1. Ouvrir une issue avec le label `enhancement`
2. Décrire la feature et ses bénéfices
3. Fournir des exemples d'utilisation

### Pull Requests

1. **Fork** le repository
2. **Créer une branche** descriptive:
   ```bash
   git checkout -b feature/amazing-feature
   # ou
   git checkout -b fix/critical-bug
   # ou
   git checkout -b docs/improve-readme
   ```

3. **Faire les changements**
   - Respecter le style de code du projet
   - Ajouter des tests si applicable
   - Mettre à jour la documentation

4. **Commit avec message clair:**
   ```bash
   git commit -m "Add amazing feature that does X"
   # Mauvais: git commit -m "fix"
   # Bon: git commit -m "Fix authentication timeout issue"
   ```

5. **Push vers votre fork:**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Ouvrir une Pull Request** avec:
   - Titre descriptif
   - Description des changements
   - Référence aux issues liées (closes #123)
   - Screenshots si applicable

## Style de Code

### Backend (Node.js/TypeScript)

```typescript
// ✅ Bon
const getUserById = async (userId: string): Promise<User> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
};

// ❌ Mauvais
const get_user = async (id) => {
  try {
    const u = await prisma.user.findUnique({ where: { id } });
    return u;
  } catch (e) {
    return null;
  }
};
```

**Conventions:**
- camelCase pour les variables/fonctions
- PascalCase pour les classes/types
- Noms descriptifs et explicites
- Comments pour la logique complexe
- Types strictes avec TypeScript
- Error handling explicite

### Frontend (React/TypeScript)

```typescript
// ✅ Bon
export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<ValidationRequest[]>([]);

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <div className="container">
      <h1>{user?.username}'s Dashboard</h1>
    </div>
  );
};

// ❌ Mauvais
export default function dashboard() {
  const user = useAuthStore().user;
  const [requests, setRequests] = useState([]);
  
  // useEffect manquant - memory leak!
  
  return <div>{user && <h1>{user.username}</h1>}</div>;
}
```

**Conventions:**
- Fonctions composants avec type `React.FC<Props>`
- Destructure props et hooks en haut
- Utiliser Tailwind pour les styles
- Hooks dependencies list complète

### Format du Code

```bash
# Format automatiquement
npm run lint -- --fix

# Ou manuellement
npx prettier --write src/
```

## Tests

### Ajouter des Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Exemple de Test

```typescript
// ✅ Bon
describe('AuthService.signin', () => {
  it('should return user and token on valid credentials', async () => {
    const user = await AuthService.signin({
      email: 'test@example.com',
      password: 'password123',
    });
    
    expect(user).toHaveProperty('token');
    expect(user.user.email).toBe('test@example.com');
  });

  it('should throw error on invalid credentials', async () => {
    await expect(
      AuthService.signin({
        email: 'test@example.com',
        password: 'wrong',
      })
    ).rejects.toThrow('Invalid credentials');
  });
});
```

## Documentation

### READMEs
- Garder la racine [README.md](README.md) à jour
- Ajouter des exemples de code
- Documenter les nouvelles features

### Code Comments
```typescript
// ✅ Bon - Explique le "pourquoi"
// HACK: Workaround for issue #123 until Prisma fixes the join
const users = await getUsers();

// ✅ Bon - Explique le "quoi" pour code complexe
// Generate SHA256 hash of code to check uniqueness
// without exposing the actual code
const codeHash = crypto.createHash('sha256').update(code).digest('hex');

// ❌ Mauvais - Redondant
// Get the user
const user = await getUser(id);
```

### Commits

```bash
# Format: <type>(<scope>): <subject>

# Exemples:
git commit -m "feat(auth): add password reset"
git commit -m "fix(validation): prevent duplicate codes"
git commit -m "docs(setup): add installation guide"
git commit -m "refactor(api): simplify error handling"
git commit -m "test(auth): add signin tests"

# Types: feat, fix, docs, refactor, test, style, chore
```

## Process de Review

1. **Code Review:** Minimum 1 approbation requise
2. **Tests:** Tous les tests doivent passer
3. **CI/CD:** Vérifications automatiques doivent réussir
4. **Merge:** Rebase et squash si nécessaire

## Checklist de PR

Avant de créer une PR, vérifier:

- [ ] Le code suit le style du projet
- [ ] Les tests passent: `npm test`
- [ ] Lint passe: `npm run lint`
- [ ] TypeScript compile: `npm run build`
- [ ] Les commits ont des messages clairs
- [ ] La documentation est mise à jour
- [ ] Les changes sont sur une nouvelle branche
- [ ] Pas de conflits avec `main`

## Questions?

- **Créer une issue** pour les questions
- **Demander de l'aide** dans les discussions GitHub
- **Contacter les mainteneurs** pour les questions urgentes

## License

En contribuant, vous acceptez que vos contributions soient licensées sous la [MIT License](LICENSE).

---

Merci pour votre contribution! 🎉
