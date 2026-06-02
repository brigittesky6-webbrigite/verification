import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiUrl: process.env.API_URL || 'http://localhost:5000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiry: process.env.JWT_EXPIRY || '7d',

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // Email
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@validateur.com',
  },

  // Encryption
  encryptionKey: process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key-12345',

  // Cron
  enableCron: process.env.ENABLE_CRON === 'true',
  reminderEmailThresholdHours: parseInt(process.env.REMINDER_EMAIL_THRESHOLD_HOURS || '48', 10),

  // Features
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Validate required config
const requiredConfig = ['databaseUrl', 'jwtSecret'];
for (const key of requiredConfig) {
  if (!config[key as keyof typeof config]) {
    console.warn(`Warning: ${key} is not set in environment variables`);
  }
}

// Validate email config (warn but don't fail - email is optional for development)
if (!config.email.host || !config.email.user || !config.email.password) {
  console.warn('Warning: Email configuration is incomplete. Email features will be disabled.');
  console.warn('Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD to enable email notifications.');
}
