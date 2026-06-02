import { Request, Response, NextFunction } from 'express';
import logger from './logger';
import { AuthenticatedRequest } from './auth';

// ============ Request Logging Middleware ============

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });

  next();
};

// ============ Error Handling Middleware ============

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err.message === 'Invalid or expired token') {
    return res.status(401).json({ error: err.message });
  }

  if (err.message?.includes('Unique constraint failed')) {
    return res.status(409).json({ error: 'Resource already exists' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
};

// ============ Audit Trail Middleware ============

export const auditMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  
  res.json = function (data: any) {
    // Attach audit data to response for later logging
    (res as any).auditData = {
      userId: req.user?.userId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ip: req.ip,
      timestamp: new Date(),
    };
    
    return originalJson.call(this, data);
  };

  next();
};
