# 🚀 Quick Start Guide

Commencez en 5 minutes!

## Prérequis

- **Node.js 18+** ([télécharger](https://nodejs.org))
- **PostgreSQL 14+** ou accès à [Neon.tech](https://neon.tech) (gratuit)
- **Git** (optionnel)

## 1️⃣ Cloner/Télécharger le Projet

```bash
git clone https://github.com/yourusername/validateur.git
cd validateur
```

## 2️⃣ Backend - 2 minutes

```bash
cd backend

# Installer
npm install

# Configuration rapide - utiliser PostgreSQL local
# Pour PostgreSQL: créer une base de données d'abord
createdb validateur

# Configurer .env
cp .env.example .env

# Éditer les 3 premières lignes:
# DATABASE_URL="postgresql://localhost/validateur?schema=public"
# JWT_SECRET="dev-key-change-in-production"
# EMAIL_HOST=... (laisser comme c'est pour maintenant)

# Initialiser la base de données
npx prisma migrate dev --name init

# Seeder les données de test
npm run db:seed

# Démarrer le serveur
npm run dev
```

✅ Backend prêt sur `http://localhost:5000`

## 3️⃣ Frontend - 1 minute

**Dans un nouvel onglet terminal:**

```bash
cd frontend

# Installer
npm install

# Démarrer
npm run dev
```

✅ Frontend prêt sur `http://localhost:3000`

## 4️⃣ Accéder à l'App

Ouvrir: **http://localhost:3000**

### Identifiants de Démo

| Rôle | Email | Mot de passe |
|------|-------|---------|
| 👤 User | user@example.com | user123! |
| 👨‍💼 Admin | admin@validateur.com | admin123! |

## ✨ Test du Workflow

### En tant qu'Utilisateur:

1. Aller à http://localhost:3000
2. Cliquer "Sign In"
3. Entrer: `user@example.com` / `user123!`
4. Cliquer "Submit Validation"
5. Sélectionner une marque (ex: Netflix)
6. Entrer un code: `TEST123456789`
7. Soumettre

✅ Vous verrez votre demande créée avec statut `EN_ATTENTE`

### En tant qu'Admin:

1. Aller à http://localhost:3000
2. Cliquer "Sign In"
3. Entrer: `admin@validateur.com` / `admin123!`
4. Aller à `/admin/dashboard` (ou via le menu)
5. Voir la demande en attente
6. Cliquer pour développer
7. Cliquer "Valider" ou entrer une raison et "Refuser"

✅ L'utilisateur recevra une notification par email (check les logs: `tail -f backend/logs/combined.log`)

## 📊 Studio Prisma (Voir la Base de Données)

```bash
cd backend
npm run db:studio
```

Ouvre: **http://localhost:5555** - Interface graphique pour la DB

## 🧹 Commandes Utiles

```bash
# Backend
npm run dev              # Démarrage avec hot-reload
npm run build            # Build pour production
npm run db:seed          # Re-seeder les données
npm run db:studio        # Interface de base de données
npm run lint             # Vérifier le code

# Frontend
npm run dev              # Démarrage avec hot-reload
npm run build            # Build pour production
npm run lint             # Vérifier le code
```

## 🔧 Configuration Email (Optionnel)

Pour tester l'envoi d'emails en développement:

### Avec Gmail

1. [Activer 2FA](https://myaccount.google.com/security)
2. [Générer un App Password](https://myaccount.google.com/apppasswords)
3. Éditer `backend/.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```
4. Redémarrer le backend: `npm run dev`

### Sans Email (Développement)

Laisser les valeurs par défaut - les emails seront loggés dans les logs au lieu d'être envoyés.

## 🐛 Troubleshooting

### Erreur: "Port 5000 déjà utilisé"
```bash
# Trouver le processus
lsof -i :5000

# Tuer le processus (remplacer PID)
kill -9 PID
```

### Erreur: "Cannot find database"
```bash
# Assurez-vous que PostgreSQL tourne
# Créer la base de données
createdb validateur

# Ou utiliser Neon.tech (cloud, gratuit)
```

### Erreur: "Module not found"
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### "API_CONNECTION_ERROR"
- Vérifier que le backend tourne sur `http://localhost:5000`
- Check `NEXT_PUBLIC_API_URL` dans `frontend/.env.local`

## 📚 Documentation Complète

- [README.md](README.md) - Vue d'ensemble
- [docs/SETUP.md](docs/SETUP.md) - Installation détaillée
- [docs/API.md](docs/API.md) - API endpoints
- [docs/DATABASE.md](docs/DATABASE.md) - Schéma de base de données
- [docs/INDEX.md](docs/INDEX.md) - Structure du projet

## 🚀 Prochaines Étapes

1. ✅ App lancée
2. 👉 Lire [docs/INDEX.md](docs/INDEX.md) pour comprendre la structure
3. 👉 Explorer le code et faire des modifications
4. 👉 Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour contribuer

## 🎓 Apprentissage

### Première fois?

1. **Backend:**
   - Lire `src/server.ts` pour comprendre l'architecture
   - Voir `src/services/validationService.ts` pour la logique

2. **Frontend:**
   - Voir `pages/dashboard.tsx` pour une page d'exemple
   - Voir `stores/authStore.ts` pour la gestion d'état

3. **Base de Données:**
   - Voir `prisma/schema.prisma` pour le schéma
   - Ouvrir `npm run db:studio` pour voir les données

### Ajouter une Feature?

1. Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les guidelines
2. Créer une branche: `git checkout -b feature/ma-feature`
3. Coder et tester
4. Faire un commit: `git commit -m "feat: add my feature"`
5. Push et ouvrir une PR

## 💬 Besoin d'Aide?

- Consultez la [documentation](docs/)
- Ouvrez une issue sur GitHub
- Vérifiez les logs: `tail -f backend/logs/combined.log`

---

**Vous êtes prêt! Happy coding! 🎉**
