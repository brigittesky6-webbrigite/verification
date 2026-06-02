# Guide de Déploiement

## Déploiement sur Vercel (Recommandé)

### Frontend - Next.js

1. **Créer un compte Vercel:** https://vercel.com/signup
2. **Connecter le repository GitHub**
3. **Configurer les variables d'environnement:**
   - `NEXT_PUBLIC_API_URL`: URL du backend déployé
   - `NEXT_PUBLIC_APP_NAME`: "Validateur"

4. **Deploy automatiquement** lors des pushes sur `main`

### Backend - API Node.js

#### Option 1: Vercel (Serverless)

```bash
cd backend

# Installer Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Configurer les variables d'env sur Vercel:**
- Dans le dashboard: Settings → Environment Variables

Variables à ajouter:
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@validateur.com
ENCRYPTION_KEY=your-32-char-key
NODE_ENV=production
FRONTEND_URL=https://your-domain.vercel.app
API_URL=https://your-api.vercel.app
ENABLE_CRON=true
```

#### Option 2: Railway.app (Recommandé pour les APIs)

1. Créer un compte: https://railway.app
2. Connecter le repository GitHub
3. Sélectionner le dossier `/backend`
4. Railway génère automatiquement un conteneur Docker
5. Ajouter les variables d'env dans le dashboard Railway

#### Option 3: Render.com

1. Créer un compte: https://render.com
2. Créer un "New Web Service"
3. Connecter le repository
4. Configurer:
   - **Build Command:** `npm install && npx prisma migrate deploy`
   - **Start Command:** `npm start`
5. Ajouter les variables d'env

## Base de Données - Neon.tech (PostgreSQL)

1. **Créer un compte:** https://neon.tech
2. **Créer un nouveau projet**
3. **Copier la connection string:**
   ```
   postgresql://user:password@host.neon.tech/validateur?sslmode=require
   ```

4. **Ajouter à vos variables d'env:**
   - Backend: `DATABASE_URL`
   - Assurez-vous que le backend peut se connecter

5. **Initialiser la base de données:**
   ```bash
   DATABASE_URL="your-neon-url" npx prisma migrate deploy
   npm run db:seed
   ```

## Configuration des Emails (Production)

### Gmail (Non recommandé pour production)
1. Créer un compte Gmail dédié
2. Activer 2FA
3. Générer une [App Password](https://myaccount.google.com/apppasswords)
4. Utiliser les credentials

### SendGrid (Recommandé)
1. Créer un compte: https://sendgrid.com
2. Générer une API Key
3. Installer le package: `npm install @sendgrid/mail`
4. Modifier `emailService.ts` pour utiliser SendGrid

### Mailgun
1. Créer un compte: https://mailgun.com
2. Configurer le domaine
3. Utiliser les credentials SMTP

## Configuration Domaine Personnalisé

### Frontend (Vercel)
1. Dashboard Vercel → Project Settings → Domains
2. Ajouter un domaine personnalisé
3. Suivre les instructions DNS

### Backend (Vercel/Railway/Render)
- Chaque plateforme a un processus similaire
- S'assurer que l'API_URL pointe vers le bon domaine

## HTTPS & Sécurité

### Certificat SSL
- Vercel: Automatique avec Let's Encrypt
- Railway/Render: Automatique
- Domaine personnalisé: Automatique (Let's Encrypt gratuit)

### Headers Sécurité
Déjà configurés dans `src/server.ts` avec Helmet:
```typescript
app.use(helmet());
```

### CORS Production
Configurer le frontend URL exact:
```env
FRONTEND_URL=https://validateur.com
```

## Fichier docker-compose pour Local Development

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: validateur
      POSTGRES_PASSWORD: password
      POSTGRES_DB: validateur
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://validateur:password@postgres:5432/validateur?schema=public
      JWT_SECRET: dev-secret-key
      EMAIL_HOST: smtp.gmail.com
      EMAIL_PORT: 587
      EMAIL_USER: your-email@gmail.com
      EMAIL_PASSWORD: your-app-password
      NODE_ENV: development
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:5000
    depends_on:
      - backend

volumes:
  postgres_data:
```

Lancer avec: `docker-compose up`

## Pipeline CI/CD avec GitHub Actions

Créer `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm run setup
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy Frontend
        run: |
          npm install -g vercel
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID_FRONTEND: ${{ secrets.VERCEL_PROJECT_ID_FRONTEND }}
```

## Monitoring & Logs

### Vercel
- Logs en temps réel dans le dashboard
- Erreurs remontées automatiquement

### Railway
- Logs dans "Logs" tab
- Alerts sur les erreurs

### Render
- Logs dans "Logs" tab
- Email notifications

## Rollback

### Frontend (Vercel)
1. Dashboard → Deployments
2. Cliquer sur un ancien deployment
3. Clicker "Promote to Production"

### Backend
Dépend de la plateforme. Générallement:
```bash
vercel rollback
# ou redéployer une version antérieure
```

## Monitoring Production

### Error Tracking (Sentry)

```bash
npm install @sentry/node @sentry/tracing
```

Ajouter dans `src/server.ts`:
```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Analytics

- Vercel Analytics: https://vercel.com/analytics
- Google Analytics: Ajouter au frontend
- Datadog: Pour le monitoring backend

## Backup Database

### Neon.tech
- Backups automatiques (7 jours gratuit)
- Accès via le dashboard

### Exportation manuelle
```bash
pg_dump $DATABASE_URL > backup.sql
```

## Checklist Avant Production

- [ ] Variables d'env configurées
- [ ] Database migrée et seedée
- [ ] HTTPS activé
- [ ] Domaine personnalisé configuré
- [ ] Emails testés
- [ ] CORS configuré correctement
- [ ] Monitoring en place
- [ ] Backups en place
- [ ] Tests de charge réussis
- [ ] Documentation mise à jour
