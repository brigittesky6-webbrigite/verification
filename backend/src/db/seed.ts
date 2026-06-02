import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import logger from '../middleware/logger';

const prisma = new PrismaClient();

const BRANDS_DATA = [
  // Tickets de paiement
  { name: 'Paysafecard', productType: 'TICKET_PAIEMENT' },
  { name: 'Neosurf', productType: 'TICKET_PAIEMENT' },
  { name: 'CASHlib', productType: 'TICKET_PAIEMENT' },

  // Cartes cadeaux
  { name: 'Zalando', productType: 'CARTE_CADEAU' },
  { name: 'Amazon', productType: 'CARTE_CADEAU' },
  { name: 'Netflix', productType: 'CARTE_CADEAU' },
  { name: 'Spotify', productType: 'CARTE_CADEAU' },
  { name: 'Google Play', productType: 'CARTE_CADEAU' },
  { name: 'Apple', productType: 'CARTE_CADEAU' },
  { name: 'Steam', productType: 'CARTE_CADEAU' },
  { name: 'PlayStation', productType: 'CARTE_CADEAU' },
  { name: 'Xbox', productType: 'CARTE_CADEAU' },
  { name: 'Nintendo', productType: 'CARTE_CADEAU' },
  { name: 'Wonderbox', productType: 'CARTE_CADEAU' },

  // Cartes bancaires prépayées
  { name: 'PCS', productType: 'CARTE_BANCAIRE' },
  { name: 'Transcash', productType: 'CARTE_BANCAIRE' },
  { name: 'Toneo First', productType: 'CARTE_BANCAIRE' },
];

async function seed() {
  try {
    logger.info('Starting database seed...');

    // Clear existing data (optional, comment out if you want to preserve data)
    // await prisma.brand.deleteMany();
    // await prisma.user.deleteMany();

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123!', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@validateur.com' },
      update: {},
      create: {
        email: 'admin@validateur.com',
        username: 'admin',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'System',
        role: 'ADMIN',
      },
    });

    logger.info('Admin user created', { adminId: admin.id });

    // Create brands
    for (const brandData of BRANDS_DATA) {
      await prisma.brand.upsert({
        where: {
          name_productType: {
            name: brandData.name,
            productType: brandData.productType as any,
          },
        },
        update: {},
        create: {
          name: brandData.name,
          productType: brandData.productType as any,
          createdBy: admin.id,
        },
      });
    }

    logger.info('Brands created', { count: BRANDS_DATA.length });

    // Create demo user
    const userPassword = await bcrypt.hash('user123!', 10);
    const user = await prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        email: 'user@example.com',
        username: 'john_doe',
        password: userPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
      },
    });

    logger.info('Demo user created', { userId: user.id });

    logger.info('Database seed completed successfully');
  } catch (error) {
    logger.error('Database seed failed', {
      error: (error as Error).message,
      stack: (error as Error).stack,
    });
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
