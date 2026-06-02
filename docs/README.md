# Plateforme de Validation de Tickets & Cartes

Une application web sécurisée et réactive (PWA) pour la gestion et la validation de tickets et cartes prépayées.

## 🎯 Architecture

### Stack Technologique
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL via Prisma ORM
- **Authentification:** JWT (JSON Web Tokens)
- **Email:** Nodemailer
- **Cron Jobs:** node-cron

### Infrastructure de Déploiement
- **Frontend:** Vercel
- **Backend:** Vercel (serverless functions) ou Railway/Render
- **Database:** Neon.tech (PostgreSQL)
- **Repository:** GitHub

## 📁 Structure du Projet

```
validateur/
├── backend/
│   ├── src/
│   │   ├── config/        # Configuration et variables d'env
│   │   ├── middleware/    # Middlewares (auth, logging, errors)
│   │   ├── routes/        # Définition des routes API
│   │   ├── controllers/   # Contrôleurs (logique métier)
│   │   ├── services/      # Services (logique applicative)
│   │   ├── utils/         # Utilitaires (encryption, JWT)
│   │   ├── cron/          # Tâches planifiées
│   │   ├── db/            # Seed de la base de données
│   │   └── server.ts      # Point d'entrée
│   ├── prisma/
│   │   └── schema.prisma  # Schéma de base de données
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example       # Exemple de variables d'env
│
├── frontend/
│   ├── pages/             # Pages Next.js (routes)
│   ├── components/        # Composants React réutilisables
│   ├── services/          # Services API
│   ├── stores/            # État global (Zustand)
│   ├── types/             # Types TypeScript
│   ├── styles/            # Styles CSS/Tailwind
│   ├── public/            # Assets statiques
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.js
│
└── docs/
    ├── DATABASE.md        # Schéma de base de données
    ├── API.md             # Documentation API
    ├── SETUP.md           # Guide d'installation
    └── DEPLOYMENT.md      # Guide de déploiement
```

## 🔐 Modèle de Sécurité

### Authentification & Autorisation
- Hachage des mots de passe avec **Bcrypt** (10 rounds)
- JWT avec clé secrète (changement recommandé en production)
- Middleware RBAC (Role-Based Access Control) sur chaque route protégée
- Deux rôles: `USER` et `ADMIN`

### Chiffrement des Données
- **Codes de tickets:** Chiffrement AES-256-CBC
- Hash SHA-256 pour vérifier l'unicité sans révéler le code
- Les codes ne sont jamais visibles en clair en base de données

### Protection
- Protection anti-injection SQL via Prisma
- Validation des entrées avec `express-validator`
- Helmets pour les headers de sécurité
- CORS configuré pour le domaine frontend

## 📋 Modèle de Données

### Tables Principales

#### Users
```sql
- id (PK)
- email (UNIQUE)
- username (UNIQUE)
- password (hashed)
- firstName, lastName
- role (USER | ADMIN)
- isActive
- createdAt, updatedAt, lastLogin
```

#### Brands
```sql
- id (PK)
- name (UNIQUE per productType)
- productType (TICKET_PAIEMENT | CARTE_CADEAU | CARTE_BANCAIRE)
- description, logoUrl
- isActive
- createdBy (FK -> Users)
- createdAt, updatedAt
```

#### ValidationRequests
```sql
- id (PK)
- code (encrypted)
- codeHash (UNIQUE, SHA256)
- status (EN_ATTENTE | VALIDEE | REFUSEE)
- userId (FK -> Users)
- brandId (FK -> Brands)
- productType
- submissionDate, validationDate
- comments, rejectionReason
- expiresAt (pour relances à 48h)
- createdAt, updatedAt
```

#### AuditLogs
```sql
- id (PK)
- action (CREATE, UPDATE, DELETE, VALIDATE, REJECT)
- entityType (USER, VALIDATION_REQUEST, BRAND)
- entityId
- userId (FK -> Users)
- changes (JSON)
- ipAddress, userAgent
- createdAt
```

#### EmailLogs
```sql
- id (PK)
- to, subject, type
- relatedEntityId
- status (SENT | FAILED)
- error
- createdAt
```

## 🚀 Installation & Démarrage

### 1. Cloner le projet
```bash
git clone https://github.com/yourusername/validateur.git
cd validateur
```

### 2. Setup Backend

```bash
cd backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Initialiser la base de données
npx prisma migrate dev --name init

# Seeder les données initiales
npm run db:seed

# Démarrer le serveur
npm run dev
```

### 3. Setup Frontend

```bash
cd ../frontend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
# .env.local est déjà prêt, ajuster si nécessaire

# Démarrer le dev server
npm run dev
```

### 4. Accès
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Demo User: `user@example.com` / `user123!`
- Demo Admin: `admin@validateur.com` / `admin123!`

## 📊 Workflow de Validation

1. **Soumission (User)**
   - L'utilisateur sélectionne Type → Marque
   - Saisit le code unique
   - Clique "Soumettre"
   - Statut: `EN_ATTENTE`

2. **Vérification Unique**
   - Hash du code vérifié contre la base (unicité)
   - Erreur si déjà soumis

3. **Notification Admin**
   - Email aux admins si queue > 0
   - Cron job toutes les 6 heures

4. **Validation Admin**
   - Admin accès à `admin/dashboard`
   - Voit les demandes filtrées par statut
   - Clique "Valider" ou "Refuser"
   - Refus = commentaire obligatoire

5. **Notification User**
   - Email immédiat au user avec le résultat
   - Affichage du statut dans son dashboard

6. **Rappels Automatiques**
   - Cron job toutes les heures
   - Si demande > 48h en attente: email de rappel à l'user

## ⚙️ Tâches Planifiées (Cron)

### Reminder Email (Chaque heure)
- Recherche: demandes `EN_ATTENTE` depuis > 48h
- Envoie email de rappel au user
- Log: nombre d'emails envoyés

### Admin Notification (Toutes les 6 heures)
- Compte les demandes `EN_ATTENTE`
- Si count > 0: envoie email aux admins
- Log: nombre d'admins notifiés

## 📧 Configuration Email

### Gmail (avec App Password)
1. Activer 2FA sur le compte Gmail
2. Créer un [App Password](https://myaccount.google.com/apppasswords)
3. Ajouter les variables:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com
EMAIL_PASSWORD=votre-app-password
```

### SMTP Custom
```env
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=votre-email@example.com
EMAIL_PASSWORD=votre-password
```

## 🌐 Déploiement

### Backend (Vercel / Railway)

**Vercel:**
```bash
npm i -g vercel
vercel --prod
```

**Variables d'env sur Vercel:**
- DATABASE_URL
- JWT_SECRET
- EMAIL_* (credentials)
- ENCRYPTION_KEY
- FRONTEND_URL

### Frontend (Vercel)

```bash
cd frontend
vercel --prod
```

**Variables d'env:**
- NEXT_PUBLIC_API_URL (URL du backend)

### Database (Neon.tech)

1. Créer un projet sur [neon.tech](https://neon.tech)
2. Copier la `DATABASE_URL`
3. Ajouter à `.env` (backend)
4. Lancer les migrations: `npx prisma migrate deploy`

## 🧪 Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Créer un compte
- `POST /api/auth/signin` - Se connecter
- `GET /api/auth/profile` - Récupérer le profil
- `POST /api/auth/change-password` - Changer le mot de passe

### Validation
- `POST /api/validation/submit` - Soumettre une demande
- `GET /api/validation/my-requests` - Mes demandes (USER)
- `GET /api/validation/all` - Toutes les demandes (ADMIN)
- `POST /api/validation/:requestId/validate` - Valider (ADMIN)
- `POST /api/validation/:requestId/reject` - Refuser (ADMIN)

### Brands
- `GET /api/brands` - Toutes les marques
- `GET /api/brands/type/:productType` - Marques par type
- `POST /api/brands` - Créer une marque (ADMIN)
- `PATCH /api/brands/:brandId` - Modifier une marque (ADMIN)
- `DELETE /api/brands/:brandId` - Supprimer une marque (ADMIN)

## 🐛 Troubleshooting

### Problème: Erreur de connexion à la base de données
```bash
# Vérifier DATABASE_URL
echo $DATABASE_URL

# Tester la connexion
npx prisma db push

# Réinitialiser (dev only)
npm run migrate
```

### Problème: Emails non envoyés
- Vérifier les logs: `logs/combined.log`
- Vérifier les credentials EMAIL_*
- Pour Gmail: confirmer l'App Password

### Problème: CORS
- Vérifier FRONTEND_URL dans .env
- Vérifier headers CORS

## 📝 Logs

### Backend
```bash
# Voir les logs
tail -f logs/combined.log

# Erreurs seulement
tail -f logs/error.log
```

### Audit Trail
```sql
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100;
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous la license MIT.

---

**Questions?** Consultez la documentation ou ouvrez une issue sur GitHub.
