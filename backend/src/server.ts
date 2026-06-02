import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/index';
import { authenticate, auditMiddleware } from './middleware/auth';
import { requestLogger, errorHandler } from './middleware/errorHandler';
import logger from './middleware/logger';

// Import routes
import authRoutes from './routes/auth';
import validationRoutes from './routes/validation';
import brandRoutes from './routes/brands';

const app: Express = express();

// ============ Security Middleware ============

app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

// ============ Compression & Logging ============

app.use(compression());
app.use(requestLogger);

// ============ Body Parser ============

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============ Audit Middleware ============

app.use(auditMiddleware);

// ============ Health Check ============

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ API Routes ============

app.use('/api/auth', authRoutes);
app.use('/api/validation', validationRoutes);
app.use('/api/brands', brandRoutes);

// ============ 404 Handler ============

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// ============ Error Handler ============

app.use(errorHandler);

// ============ Start Server ============

const PORT = config.port;

const server = app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`Frontend URL: ${config.frontendUrl}`);
});

// ============ Graceful Shutdown ============

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;
