# Checklist de Déploiement en Production

## ✅ Avant le Déploiement

### 1. Configuration de l'Environnement
- [ ] Copier `.env.example` vers `.env` dans `backend/`
- [ ] Définir `DATABASE_URL` avec une base PostgreSQL de production (ex: Neon.tech)
- [ ] Définir `JWT_SECRET` avec une clé forte et unique (minimum 32 caractères)
- [ ] Définir `ENCRYPTION_KEY` avec une clé de 32 caractères
- [ ] Configurer les variables email:
  - [ ] `EMAIL_HOST` (ex: smtp.sendgrid.net)
  - [ ] `EMAIL_PORT` (465 pour SSL, 587 pour TLS)
  - [ ] `EMAIL_USER`
  - [ ] `EMAIL_PASSWORD`
  - [ ] `EMAIL_FROM` (ex: noreply@votredomaine.com)
- [ ] Définir `NODE_ENV=production`
- [ ] Configurer `API_URL` avec l'URL de production du backend
- [ ] Configurer `FRONTEND_URL` avec l'URL de production du frontend

### 2. Base de Données
- [ ] Créer une base PostgreSQL de production (Neon.tech recommandé)
- [ ] Exécuter les migrations: `npx prisma migrate deploy`
- [ ] Seeder la base: `npm run db:seed`
- [ ] Vérifier la connexion: tester une requête simple

### 3. Tests
- [ ] Exécuter les tests unitaires: `npm test`
- [ ] Vérifier que tous les tests passent (20 tests pour EmailService)
- [ ] Tester manuellement l'envoi d'emails

### 4. Sécurité
- [ ] Vérifier que `JWT_SECRET` n'est pas dans le code source
- [ ] Vérifier que `DATABASE_URL` n'est pas dans le code source
- [ ] S'assurer que `.env` est dans `.gitignore`
- [ ] Configurer HTTPS (automatique avec Vercel/Railway/Render)

## 🚀 Déploiement

### Option 1: Vercel (Recommandé pour Frontend + Backend)

#### Backend
```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer le backend
cd backend
vercel --prod
```

**Variables d'environnement à ajouter dans Vercel Dashboard:**
```
DATABASE_URL=postgresql://...
JWT_SECRET=votre-clé-secrète
ENCRYPTION_KEY=votre-clé-32-caractères
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=votre-email
EMAIL_PASSWORD=votre-mot-de-passe
EMAIL_FROM=noreply@votredomaine.com
NODE_ENV=production
API_URL=https://votre-api.vercel.app
FRONTEND_URL=https://votre-frontend.vercel.app
ENABLE_CRON=true
REMINDER_EMAIL_THRESHOLD_HOURS=48
```

#### Frontend
```bash
cd frontend
vercel --prod
```

**Variables d'environnement frontend:**
```
NEXT_PUBLIC_API_URL=https://votre-api.vercel.app
NEXT_PUBLIC_APP_NAME=Validateur
```

### Option 2: Railway.app (Recommandé pour Backend)

1. **Backend sur Railway:**
   - Connecter le repository GitHub
   - Sélectionner le dossier `/backend`
   - Railway détecte automatiquement Node.js
   - Ajouter les variables d'environnement dans le dashboard

2. **Frontend sur Vercel:**
   - Suivre les étapes Vercel ci-dessus

### Option 3: Render.com

1. **Créer un "Web Service":**
   - Build Command: `npm install && npx prisma migrate deploy`
   - Start Command: `npm start`
   - Ajouter les variables d'environnement

## 📧 Configuration Email Production

### SendGrid (Recommandé)
1. Créer un compte sur [SendGrid](https://sendgrid.com)
2. Générer une API Key
3. Configuration:
   ```
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASSWORD=votre-api-key-sendgrid
   EMAIL_FROM=validateur@votredomaine.com
   ```

### Mailgun
1. Créer un compte sur [Mailgun](https://mailgun.com)
2. Configurer le domaine
3. Configuration:
   ```
   EMAIL_HOST=smtp.mailgun.org
   EMAIL_PORT=587
   EMAIL_USER=postmaster@votredomaine.com
   EMAIL_PASSWORD=votre-mot-de-passe
   EMAIL_FROM=validateur@votredomaine.com
   ```

## 🔍 Vérification Post-Déploiement

### 1. Health Check
```bash
curl https://votre-api.vercel.app/health
# Doit retourner: {"status":"ok","timestamp":"..."}
```

### 2. Test des Routes API
```bash
# Test auth
curl -X POST https://votre-api.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser","password":"password123"}'

# Test validation (avec token)
curl https://votre-api.vercel.app/api/validation/requests \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### 3. Test des Emails
- [ ] Créer un compte utilisateur
- [ ] Soumettre une demande de validation
- [ ] Vérifier la réception de l'email de confirmation
- [ ] En tant qu'admin, valider/refuser la demande
- [ ] Vérifier la réception de l'email de status change

### 4. Test des Cron Jobs
- [ ] Attendre 48h ou modifier `REMINDER_EMAIL_THRESHOLD_HOURS=1`
- [ ] Vérifier la réception des emails de rappel
- [ ] Vérifier les logs de cron jobs

## 📊 Monitoring

### Logs
- **Vercel:** Dashboard → Logs
- **Railway:** Logs tab
- **Render:** Logs tab

### Error Tracking (Optionnel)
1. Créer un compte [Sentry](https://sentry.io)
2. Installer: `npm install @sentry/node @sentry/tracing`
3. Ajouter dans `backend/src/server.ts`:
```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Database Monitoring
- **Neon.tech:** Dashboard → Insights
- Surveiller les connexions actives
- Vérifier les requêtes lentes

## 🔄 Rollback

### Vercel
1. Dashboard → Deployments
2. Cliquer sur un ancien deployment
3. "Promote to Production"

### Railway
- Redéployer une version précédente depuis l'historique

### Render
- Utiliser les "Deploy Hooks" ou redéployer manuellement

## 🛡️ Sécurité Production

### Headers de Sécurité
Déjà configurés via Helmet dans `server.ts`:
- ✅ HTTPS forcé
- ✅ CORS configuré
- ✅ Headers de sécurité activés

### Rate Limiting (Optionnel)
Ajouter express-rate-limit:
```bash
npm install express-rate-limit
```

Dans `server.ts`:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## 📝 Maintenance

### Quotidien
- [ ] Vérifier les logs d'erreurs
- [ ] Surveiller les performances
- [ ] Vérifier les emails échoués dans EmailLog

### Hebdomadaire
- [ ] Backup de la base de données
- [ ] Vérifier les demandes en attente
- [ ] Nettoyer les anciens EmailLogs (> 30 jours)

### Mensuel
- [ ] Mettre à jour les dépendances
- [ ] Réviser les logs de sécurité
- [ ] Tester le processus de rollback

## 🆘 Support

### Problèmes Courants

**Erreur: "Email configuration is incomplete"**
- Solution: Vérifier que EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD sont définis

**Erreur: "Connection refused" (database)**
- Solution: Vérifier DATABASE_URL et que la base est accessible

**Cron jobs ne s'exécutent pas**
- Solution: Vérifier `ENABLE_CRON=true` dans les variables d'environnement

**Emails non envoyés**
- Solution: Vérifier les logs, tester la configuration SMTP localement

## ✅ Checklist Finale

- [ ] Tous les tests passent
- [ ] Variables d'environnement configurées
- [ ] Base de données migrée et seedée
- [ ] HTTPS activé
- [ ] Emails testés et fonctionnels
- [ ] CORS configuré correctement
- [ ] Monitoring en place
- [ ] Backups configurés
- [ ] Documentation mise à jour

---

**Projet prêt pour la production! 🚀**

Pour toute question, consulter la documentation complète dans `docs/DEPLOYMENT.md`.