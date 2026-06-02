# Index du Projet Validateur

## 📁 Structure des Fichiers

### Backend (`/backend`)

```
backend/
├── src/
│   ├── config/
│   │   └── index.ts                   # Configuration et variables d'env
│   ├── middleware/
│   │   ├── auth.ts                    # Authentification & RBAC
│   │   ├── errorHandler.ts            # Gestion des erreurs et audit
│   │   └── logger.ts                  # Logging avec Winston
│   ├── routes/
│   │   ├── auth.ts                    # Routes d'authentification
│   │   ├── validation.ts              # Routes de validation
│   │   └── brands.ts                  # Routes de gestion des marques
│   ├── controllers/
│   │   ├── authController.ts          # Logique d'authentification
│   │   ├── validationController.ts    # Logique de validation
│   │   └── brandController.ts         # Logique de gestion des marques
│   ├── services/
│   │   ├── authService.ts             # Signup, signin, pwd change
│   │   ├── validationService.ts       # Soumission, validation, refus
│   │   ├── emailService.ts            # Envoi d'emails
│   │   ├── auditService.ts            # Logging d'audit
│   │   └── brandService.ts            # Gestion du catalogue
│   ├── utils/
│   │   ├── encryption.ts              # AES-256-CBC & SHA-256
│   │   └── jwt.ts                     # Génération & vérification JWT
│   ├── cron/
│   │   └── jobs.ts                    # Tâches planifiées (relances, notifications)
│   ├── db/
│   │   └── seed.ts                    # Population de la base de données
│   └── server.ts                      # Point d'entrée + Express setup
├── prisma/
│   ├── schema.prisma                  # Schéma ORM Prisma
│   └── README.md                      # Guide des migrations
├── package.json
├── tsconfig.json
├── .env.example                       # Template des variables d'env
└── .gitignore
```

**Points clés:**
- `src/server.ts` initialise Express et charge tous les middlewares
- Les routes importent les controllers
- Les controllers appellent les services
- Les services contiennent la logique métier
- Prisma gère la base de données

### Frontend (`/frontend`)

```
frontend/
├── pages/
│   ├── _app.tsx                       # Initialisation globale + stores
│   ├── _document.tsx                  # HTML template
│   ├── index.tsx                      # Landing page (home)
│   ├── signin.tsx                     # Page de connexion
│   ├── signup.tsx                     # Page d'enregistrement
│   ├── dashboard.tsx                  # Dashboard utilisateur
│   ├── submit-validation.tsx          # Formulaire de soumission
│   └── admin/
│       ├── dashboard.tsx              # Dashboard admin
│       └── brands.tsx                 # Gestion des marques
├── components/
│   └── Layout.tsx                     # Layout wrapper global
├── services/
│   └── api.ts                         # Client Axios + endpoints
├── stores/
│   └── authStore.ts                   # État global Zustand
├── types/
│   └── index.ts                       # Types TypeScript globaux
├── styles/
│   └── globals.css                    # Styles Tailwind personnalisés
├── utils/
│   └── (utilitaires)
├── public/
│   ├── manifest.json                  # Manifest PWA
│   └── (assets)
├── package.json
├── tsconfig.json
├── next.config.js                     # Configuration Next.js + PWA
├── tailwind.config.js                 # Configuration Tailwind
├── postcss.config.js                  # Configuration PostCSS
├── .eslintrc.json                     # Configuration ESLint
├── .env.example                       # Template variables d'env
└── .gitignore
```

**Points clés:**
- `pages/_app.tsx` initialise Zustand et charge l'authentification
- `services/api.ts` centralise toutes les requêtes API
- `stores/authStore.ts` gère l'état utilisateur globalement
- Chaque page route correspond à une URL Next.js

### Documentation (`/docs`)

```
docs/
├── README.md                          # Vue d'ensemble complète
├── SETUP.md                           # Guide d'installation
├── API.md                             # Documentation API détaillée
├── DATABASE.md                        # Schéma et optimisations
└── DEPLOYMENT.md                      # Guide de déploiement
```

### Racine du Projet

```
validateur/
├── README.md                          # Intro du projet
├── package.json                       # Workspaces (monorepo)
├── .gitignore                         # Fichiers à ignorer
├── backend/
├── frontend/
└── docs/
```

## 🔄 Flux de Données

### 1. Authentification

```
User Input (signin.tsx)
    ↓
api.signin() (services/api.ts)
    ↓
POST /api/auth/signin (backend route)
    ↓
authController.signin() (validation entrée)
    ↓
authService.signin() (logique métier)
    ↓
Prisma query + JWT generation
    ↓
Response + Token
    ↓
useAuthStore.signin() (Zustand)
    ↓
localStorage.setItem('auth_token')
    ↓
Dashboard redirect
```

### 2. Soumission de Validation

```
User Submission (submit-validation.tsx)
    ↓
api.submitValidation() (request)
    ↓
POST /api/validation/submit (backend)
    ↓
authenticate middleware (vérifier JWT)
    ↓
validationController.submitValidation()
    ↓
validationService.submitValidation()
    ├── EncryptionService.hashCode() (SHA-256)
    ├── Check unicité
    ├── EncryptionService.encrypt() (AES-256)
    ├── Prisma create request
    └── AuditService.log()
    ↓
Response
    ↓
Dashboard + notification
```

### 3. Validation Admin

```
Admin Action (admin/dashboard.tsx)
    ↓
api.validateRequest() (request)
    ↓
POST /api/validation/:id/validate (backend)
    ↓
authenticate + adminOnly middleware
    ↓
validationController.validateRequest()
    ↓
validationService.validateRequest()
    ├── Update request status
    ├── EmailService.sendStatusChangeEmail()
    └── AuditService.log()
    ↓
User receives email notification
```

## 🔐 Sécurité - Points de Passage

### 1. Authentification
- `middleware/auth.ts` → vérifie le JWT
- `utils/jwt.ts` → génère/vérifie les tokens
- `services/authService.ts` → Bcrypt pour les mots de passe

### 2. Chiffrement
- `utils/encryption.ts` → AES-256-CBC pour les codes
- SHA-256 pour l'unicité (hash non reversible)

### 3. Autorisation (RBAC)
- `middleware/auth.ts` → `authorize(['ADMIN'])` pour les routes
- Vérification du rôle sur chaque endpoint sensible

### 4. Audit
- `services/auditService.ts` → Logs de toutes les actions
- Table `AuditLog` avec userId, action, changement, timestamp

### 5. Validation des Entrées
- Controllers → vérification des champs requis
- `express-validator` pour les validations côté serveur

## 🧪 Processus de Test

### Backend
```bash
cd backend

# Tests unitaires/intégration
npm test

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

### Frontend
```bash
cd frontend

# Tests
npm test

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

## 📊 Modèle de Données (Prisma)

### Tables principales

1. **users** - Authentification et profils
2. **brands** - Catalogue de marques
3. **validation_requests** - Demandes soumises
4. **audit_logs** - Trace d'audit
5. **email_logs** - Historique emails

Relations:
```
users → validation_requests (1-N)
users → audit_logs (1-N)
brands → validation_requests (1-N)
```

Voir `prisma/schema.prisma` pour le détail complet.

## 🚀 Variables d'Environnement

### Backend (.env)
- `DATABASE_URL` - Connection PostgreSQL
- `JWT_SECRET` - Clé de signature JWT
- `EMAIL_*` - Credentials SMTP
- `ENCRYPTION_KEY` - Clé pour AES-256
- `NODE_ENV` - development|production
- `PORT` - Port du serveur (défaut 5000)
- `FRONTEND_URL` - URL du frontend (CORS)
- `ENABLE_CRON` - Activer les tâches planifiées
- `REMINDER_EMAIL_THRESHOLD_HOURS` - Seuil pour relances (défaut 48)

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - URL backend (accessible en client)
- `NEXT_PUBLIC_APP_NAME` - Nom de l'app

## 🌐 Routes API

Voir [docs/API.md](docs/API.md) pour la documentation complète.

Routes principales:
- `POST /api/auth/signup` - S'enregistrer
- `POST /api/auth/signin` - Se connecter
- `POST /api/validation/submit` - Soumettre une demande
- `GET /api/validation/my-requests` - Mes demandes
- `GET /api/validation/all` - Toutes les demandes (Admin)
- `POST /api/validation/:id/validate` - Valider (Admin)
- `POST /api/validation/:id/reject` - Refuser (Admin)
- `GET /api/brands` - Toutes les marques
- `POST /api/brands` - Créer une marque (Admin)

## 📱 Pages Frontend

- `/` - Landing page (public)
- `/signin` - Connexion (public)
- `/signup` - Enregistrement (public)
- `/dashboard` - Dashboard utilisateur (protégé)
- `/submit-validation` - Formulaire soumission (protégé, USER)
- `/admin/dashboard` - Admin panel (protégé, ADMIN)
- `/admin/brands` - Gestion marques (protégé, ADMIN)

## 🎯 Checklist de Développement

- [ ] Clone du projet
- [ ] Installation backend: `cd backend && npm install`
- [ ] Installation frontend: `cd frontend && npm install`
- [ ] Configuration .env backend
- [ ] Configuration .env frontend
- [ ] Init base de données: `npx prisma migrate dev`
- [ ] Seed données: `npm run db:seed`
- [ ] Démarrer backend: `npm run dev`
- [ ] Démarrer frontend: `npm run dev`
- [ ] Tester authentification
- [ ] Tester workflow validation
- [ ] Tester admin panel
- [ ] Vérifier les logs
- [ ] Lancer les tests

## 🤝 Contribution

1. Créer une branche: `git checkout -b feature/amazing`
2. Committer: `git commit -m 'Add amazing feature'`
3. Push: `git push origin feature/amazing`
4. Pull Request

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les guidelines.

## 📚 Ressources Utiles

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## ❓ FAQ

**Q: Comment ajouter un nouvel endpoint?**
A: 
1. Créer la route dans `routes/`
2. Créer le controller dans `controllers/`
3. Appeler le service dans `services/`
4. Ajouter l'endpoint au client API `services/api.ts`

**Q: Comment modifier le schéma de base de données?**
A:
1. Modifier `prisma/schema.prisma`
2. Lancer `npx prisma migrate dev --name description`
3. Prisma génère la migration et met à jour Prisma Client

**Q: Comment ajouter une nouvelle tâche planifiée?**
A:
1. Ajouter la tâche dans `cron/jobs.ts`
2. Utiliser `cron.schedule()` pour définir la fréquence
3. Activer avec `ENABLE_CRON=true` dans .env

**Q: Comment déboguer?**
A:
- Backend: Voir `logs/combined.log`
- Frontend: Console du navigateur (F12)
- Database: `npm run db:studio`
