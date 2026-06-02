# Configuration de la Base de Données

## Schéma PostgreSQL

### Enums

```sql
-- Rôles utilisateur
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');

-- Statut des demandes de validation
CREATE TYPE request_status AS ENUM ('EN_ATTENTE', 'VALIDEE', 'REFUSEE');

-- Type de produit
CREATE TYPE product_type AS ENUM ('TICKET_PAIEMENT', 'CARTE_CADEAU', 'CARTE_BANCAIRE');
```

### Tables

#### users
Stocke les informations des utilisateurs et administrateurs.

```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,              -- Hashed avec Bcrypt
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(20),
  role user_role DEFAULT 'USER',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  
  INDEX (email),
  INDEX (role)
);
```

#### brands
Catalogue des marques et types de produits.

```sql
CREATE TABLE brands (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  product_type product_type NOT NULL,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  logo_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255) NOT NULL,
  
  UNIQUE (name, product_type),
  INDEX (product_type),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);
```

#### validation_requests
Demandes de validation soumises par les utilisateurs.

```sql
CREATE TABLE validation_requests (
  id VARCHAR(255) PRIMARY KEY,
  code TEXT NOT NULL,                          -- Encrypted
  code_hash VARCHAR(64) UNIQUE NOT NULL,      -- SHA256 hash pour unicité
  status request_status DEFAULT 'EN_ATTENTE',
  user_id VARCHAR(255) NOT NULL,
  brand_id VARCHAR(255) NOT NULL,
  product_type product_type NOT NULL,
  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  validation_date TIMESTAMP,
  comments TEXT,
  rejection_reason TEXT,
  expires_at TIMESTAMP,                        -- Pour relances à 48h
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE RESTRICT,
  INDEX (user_id),
  INDEX (status),
  INDEX (brand_id),
  INDEX (product_type),
  INDEX (submission_date),
  INDEX (expires_at)
);
```

#### audit_logs
Trace immuable de toutes les actions pour conformité et sécurité.

```sql
CREATE TABLE audit_logs (
  id VARCHAR(255) PRIMARY KEY,
  action VARCHAR(50) NOT NULL,                 -- CREATE, UPDATE, DELETE, VALIDATE, REJECT
  entity_type VARCHAR(50) NOT NULL,            -- USER, VALIDATION_REQUEST, BRAND
  entity_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  changes TEXT,                                -- JSON string
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX (user_id),
  INDEX (entity_type),
  INDEX (action),
  INDEX (created_at)
);
```

#### email_logs
Historique des emails envoyés pour debugging et monitoring.

```sql
CREATE TABLE email_logs (
  id VARCHAR(255) PRIMARY KEY,
  to VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  type VARCHAR(50),                            -- STATUS_CHANGE, REMINDER, ADMIN_NOTIFICATION
  related_entity_id VARCHAR(255),
  status VARCHAR(20),                          -- SENT, FAILED
  error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX (to),
  INDEX (type),
  INDEX (status),
  INDEX (created_at)
);
```

## Seed des Données Initiales

### Marques Prédéfinies

#### Tickets de Paiement
- Paysafecard
- Neosurf
- CASHlib

#### Cartes Cadeaux
- Zalando
- Amazon
- Netflix
- Spotify
- Google Play
- Apple
- Steam
- PlayStation
- Xbox
- Nintendo
- Wonderbox

#### Cartes Bancaires Prépayées
- PCS
- Transcash
- Toneo First

### Utilisateurs de Démonstration

```
Admin:
  Email: admin@validateur.com
  Password: admin123!
  Username: admin
  Role: ADMIN

User:
  Email: user@example.com
  Password: user123!
  Username: john_doe
  Role: USER
```

## Migrations

### Initialiser la base de données (développement)
```bash
cd backend
npx prisma migrate dev --name init
```

### Appliquer les migrations (production)
```bash
npx prisma migrate deploy
```

### Rollback la dernière migration
```bash
npx prisma migrate resolve --rolled-back migration_name
```

### Générer les migrations d'un changement de schéma
```bash
# Modifier prisma/schema.prisma
npx prisma migrate dev --name description_of_change
```

## Sauvegardes

### Exporter les données
```bash
pg_dump -U user -h localhost validateur > backup.sql
```

### Importer les données
```bash
psql -U user -h localhost validateur < backup.sql
```

### Neon.tech Backup
Automatiquement géré avec retention policies.

## Optimisations

### Indexes essentiels
Déjà définis dans le schéma pour:
- Recherche par email/username
- Filtrage par statut et date
- Jointures utilisateur

### Partitioning (Optionnel)
Pour de très gros volumes, partitionner `validation_requests` par date:
```sql
CREATE TABLE validation_requests_2024_q1 PARTITION OF validation_requests
  FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
```

### Archivage
Après 6 mois, archiver les demandes complétées:
```sql
-- Dans un job planifié
INSERT INTO validation_requests_archive
SELECT * FROM validation_requests
WHERE updated_at < NOW() - INTERVAL '6 months'
  AND status != 'EN_ATTENTE';

DELETE FROM validation_requests
WHERE id IN (SELECT id FROM validation_requests_archive);
```

## Monitoring

### Requêtes lentes
```sql
-- Activer le logging des slow queries
SET log_min_duration_statement = 1000; -- 1 seconde
```

### Taille de la base
```sql
SELECT pg_size_pretty(pg_database_size('validateur'));
```

### Statistiques des tables
```sql
SELECT relname, n_live_tup, n_dead_tup 
FROM pg_stat_user_tables 
ORDER BY n_live_tup DESC;
```

## Connexion Prisma Studio
```bash
npm run db:studio
```
Accès: http://localhost:5555
