# Prisma Migration

## Setup

```bash
# Install Prisma CLI globally (optional)
npm install -g @prisma/cli

# Or use it via npx
npx prisma --version
```

## First Migration

```bash
# Create initial migration
npx prisma migrate dev --name init

# This will:
# 1. Create migration files
# 2. Run the migration
# 3. Generate Prisma Client
```

## Running Migrations

### Development
```bash
# Apply pending migrations
npx prisma migrate dev

# Reset database (loses data)
npx prisma migrate reset
```

### Production
```bash
# Deploy migrations (no data loss)
npx prisma migrate deploy
```

## Viewing Database

```bash
# Open Prisma Studio (GUI)
npm run db:studio
```

## Creating Migrations

```bash
# After modifying prisma/schema.prisma:
npx prisma migrate dev --name description_of_change
```

This will:
1. Generate migration files
2. Apply the migration
3. Update Prisma Client
