# Guide d'Installation

## Prérequis

- **Node.js** 18+ (télécharger de [nodejs.org](https://nodejs.org))
- **npm** ou **yarn** (inclus avec Node.js)
- **PostgreSQL** 14+ ou accès à **Neon.tech**
- **Git** (optionnel mais recommandé)

## Installation du Backend

### 1. Naviguer dans le dossier backend
```bash
cd backend
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Éditer le fichier `.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/validateur?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRY="7d"

# Email (Gmail avec App Password)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="noreply@validateur.com"

# Server
NODE_ENV="development"
PORT=5000
API_URL="http://localhost:5000"
FRONTEND_URL="http://localhost:3000"

# Encryption
ENCRYPTION_KEY="your-32-character-encryption-key"

# Cron
ENABLE_CRON=true
REMINDER_EMAIL_THRESHOLD_HOURS=48
```

### 4. Initialiser la base de données

```bash
# Créer les tables
npx prisma migrate dev --name init

# Seeder les données initiales (admin, marques, utilisateur demo)
npm run db:seed
```

### 5. Démarrer le serveur

```bash
# Mode développement (avec hot-reload)
npm run dev

# Mode production
npm run build
npm start
```

Le serveur écoute sur `http://localhost:5000`

## Installation du Frontend

### 1. Naviguer dans le dossier frontend
```bash
cd ../frontend
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Variables d'environnement

Le fichier `.env.local` est déjà présent. Vous pouvez le modifier si l'API est sur un port différent:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Validateur
```

### 4. Démarrer le serveur de développement

```bash
npm run dev
```

Accès: `http://localhost:3000`

## Connexion à la Base de Données

### Option 1: PostgreSQL Local

```bash
# Installation (macOS avec Homebrew)
brew install postgresql@15

# Démarrer le service
brew services start postgresql@15

# Créer une base de données
createdb validateur

# Connection string
DATABASE_URL="postgresql://localhost/validateur?schema=public"
```

### Option 2: Neon.tech (Cloud)

1. Créer un compte sur [neon.tech](https://neon.tech)
2. Créer un nouveau projet
3. Copier la connection string PostgreSQL
4. Ajouter à `.env`:
```env
DATABASE_URL="postgresql://user:password@host.neon.tech/validateur?sslmode=require"
```

## Configuration Email

### Gmail

1. Activer l'authentification 2FA: [Paramètres de sécurité](https://myaccount.google.com/security)
2. Générer un [App Password](https://myaccount.google.com/apppasswords)
3. Sélectionner "Mail" et "Windows"
4. Ajouter au `.env`:
```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="votre-email@gmail.com"
EMAIL_PASSWORD="votre-app-password"
```

### SMTP Personnalisé

```env
EMAIL_HOST="smtp.example.com"
EMAIL_PORT=587
EMAIL_USER="user@example.com"
EMAIL_PASSWORD="password"
```

## Test de Connexion

### 1. Vérifier le backend

```bash
curl http://localhost:5000/health
# Réponse attendue:
# {"status":"ok","timestamp":"2024-01-15T10:30:00.000Z"}
```

### 2. Vérifier la base de données

```bash
npm run db:studio
# Ouvre: http://localhost:5555
```

### 3. Test d'authentification

```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "user123!"
  }'
```

## Credentials de Démonstration

Après le seed, ces comptes sont disponibles:

### Administrateur
- **Email:** admin@validateur.com
- **Mot de passe:** admin123!
- **Accès:** http://localhost:3000/admin/dashboard

### Utilisateur Standard
- **Email:** user@example.com
- **Mot de passe:** user123!
- **Accès:** http://localhost:3000/dashboard

## Dépannage

### Erreur: "Cannot find module 'express'"
```bash
npm install
```

### Erreur: "EACCES permission denied"
```bash
sudo chown -R $USER ~/.npm
```

### Port déjà utilisé
```bash
# Trouver le processus sur le port
lsof -i :5000

# Tuer le processus
kill -9 PID
```

### Erreur de base de données
```bash
# Réinitialiser (dev only)
npx prisma migrate reset

# Ou manuellement
npx prisma db push
npm run db:seed
```

## Commandes Utiles

### Backend

```bash
# Développement
npm run dev

# Build
npm run build

# Production
npm start

# Lint
npm run lint

# Tests
npm test

# Migrations
npx prisma migrate dev

# Studio (GUI)
npm run db:studio

# Seed
npm run db:seed
```

### Frontend

```bash
# Développement
npm run dev

# Build
npm run build

# Production
npm start

# Lint
npm run lint

# Export statique
npm run export
```

## Prochaines Étapes

1. ✅ Backend configuré et tournant
2. ✅ Frontend configuré et tournant
3. 📧 Tester l'envoi d'emails
4. 🔐 Tester l'authentification et les rôles
5. 📊 Tester le workflow de validation complet
6. 🚀 Préparer le déploiement

Voir [DEPLOYMENT.md](./DEPLOYMENT.md) pour déployer en production.
