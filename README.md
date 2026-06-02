# Validateur - Plateforme de Validation de Tickets & Cartes

## 🚀 Vue d'ensemble

Une **plateforme web sécurisée et réactive (PWA)** pour gérer et valider des tickets et cartes prépayées. Construite avec Next.js, Node.js, Express et PostgreSQL.

## 🎯 Fonctionnalités Principales

### Pour les Utilisateurs
- ✅ Inscription/Connexion sécurisée
- ✅ Soumettre des demandes de validation avec saisie de code
- ✅ Consulter l'historique et le statut des demandes
- ✅ Notifications par email automatiques
- ✅ Interface mobile-first optimisée
- ✅ Fonctionnement hors-ligne (PWA)

### Pour les Administrateurs
- ✅ Tableau de bord complet des demandes en attente
- ✅ Filtrer par statut, date, type
- ✅ Valider ou refuser avec commentaires
- ✅ Gestion du catalogue de marques
- ✅ Export rapports CSV/Excel
- ✅ Trace d'audit complète de toutes les actions
- ✅ Gestion des utilisateurs

### Sécurité
- ✅ Chiffrement des codes de tickets (AES-256-CBC)
- ✅ Hachage SHA-256 pour vérifier l'unicité
- ✅ Authentification JWT
- ✅ Contrôle d'accès basé sur les rôles (RBAC)
- ✅ Protection anti-injection SQL/XSS
- ✅ Logs immuables pour audit

### Automatisation
- ✅ Relances par email après 48h d'attente
- ✅ Notifications admin des demandes en queue
- ✅ Notifications utilisateur des changements de statut

## 📁 Architecture

```
validateur/
├── backend/          # API Node.js/Express
├── frontend/         # PWA Next.js
└── docs/            # Documentation
```

### Backend Stack
- Node.js + TypeScript
- Express.js (API REST)
- PostgreSQL + Prisma ORM
- JWT + Bcrypt (Sécurité)
- Nodemailer (Emails)
- node-cron (Tâches planifiées)

### Frontend Stack
- Next.js 14 + React 18
- TypeScript
- Tailwind CSS
- Zustand (État global)
- Axios (Requêtes API)
- PWA (Service Workers)

## 🏢 Catalogue Prédéfini

### Tickets de Paiement
Paysafecard, Neosurf, CASHlib

### Cartes Cadeaux
Zalando, Amazon, Netflix, Spotify, Google Play, Apple, Steam, PlayStation, Xbox, Nintendo, Wonderbox

### Cartes Bancaires Prépayées
PCS, Transcash, Toneo First

## 🚀 Démarrage Rapide

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+ (ou Neon.tech)
- npm/yarn

### 2. Backend

```bash
cd backend

# Installer les dépendances
npm install

# Configurer .env
cp .env.example .env
# Éditer .env avec vos valeurs

# Initialiser la base de données
npx prisma migrate dev --name init

# Seeder les données
npm run db:seed

# Démarrer
npm run dev
# Server: http://localhost:5000
```

### 3. Frontend

```bash
cd ../frontend

# Installer les dépendances
npm install

# Démarrer
npm run dev
# App: http://localhost:3000
```

### 4. Credentials de Démo
- **Admin:** admin@validateur.com / admin123!
- **User:** user@example.com / user123!

## 📚 Documentation

Consultez les fichiers dans le dossier `docs/`:

- [README.md](docs/README.md) - Vue d'ensemble complète
- [SETUP.md](docs/SETUP.md) - Guide d'installation détaillé
- [API.md](docs/API.md) - Documentation API complète
- [DATABASE.md](docs/DATABASE.md) - Schéma et optimisations de la base de données

## 🔐 Sécurité

### Points Clés
- **Codes:** Chiffrement AES-256-CBC + Hash SHA-256
- **Mots de passe:** Bcrypt (10 rounds)
- **Authentification:** JWT (7 jours par défaut)
- **Autorisation:** RBAC sur chaque route
- **Audit:** Trace immuable de toutes les actions
- **HTTPS:** Recommandé en production
- **CORS:** Configuré pour le frontend

### Bonnes Pratiques
1. Changer `JWT_SECRET` en production
2. Utiliser des variables d'env sécurisées (Vercel Secrets, etc.)
3. Activer HTTPS
4. Maintenir les dépendances à jour
5. Surveiller les logs pour les anomalies

## 📊 Workflow de Validation

```
1. USER -> Soumission (Type → Marque → Code)
        ↓
2. VERIFY -> Unicité du code (Hash check)
        ↓
3. DATABASE -> Création avec status EN_ATTENTE
        ↓
4. CRON -> Relance admin si queue > 0
        ↓
5. ADMIN -> Validation ou Refus
        ↓
6. EMAIL -> Notification user
        ↓
7. CRON -> Rappel user après 48h d'attente
```

## 🌐 Déploiement

### Production

**Frontend (Vercel):**
```bash
cd frontend
vercel --prod
```

**Backend (Vercel/Railway):**
```bash
cd backend
vercel --prod
```

**Database (Neon.tech):**
1. Créer un projet
2. Copier CONNECTION_URL
3. Lancer migrations: `npx prisma migrate deploy`

Voir [docs/README.md](docs/README.md) pour les détails complets.

## 🧪 Tests

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

## 📧 Configuration Email

### Gmail avec App Password
1. Activer 2FA sur [myaccount.google.com](https://myaccount.google.com)
2. Générer [App Password](https://myaccount.google.com/apppasswords)
3. Ajouter à `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## 🐛 Troubleshooting

### Erreur Database Connection
```bash
# Vérifier DATABASE_URL
echo $DATABASE_URL

# Réinitialiser (dev)
npm run migrate
```

### Emails non envoyés
- Vérifier `logs/combined.log`
- Vérifier les credentials EMAIL_*
- Pour Gmail: confirmer l'App Password

### CORS Issues
- Vérifier `FRONTEND_URL` dans backend `.env`
- S'assurer que le frontend URL est correct

## 📝 Logs

### Backend
```bash
tail -f logs/combined.log        # Tous les logs
tail -f logs/error.log           # Erreurs seulement
```

### Audit Trail
```bash
# Voir l'historique des actions
npm run db:studio
# Consulter la table: audit_logs
```

## 📞 Support

Pour des questions ou des issues:
1. Consultez la [documentation complète](docs/README.md)
2. Vérifiez les logs du serveur
3. Ouvrez une issue sur GitHub

## 📄 License

MIT License - Voir [LICENSE](LICENSE) pour les détails.

---

**Construit avec ❤️ pour la sécurité et la performance**
