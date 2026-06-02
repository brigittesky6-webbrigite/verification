import { Request, Response, NextFunction } from 'express';
import { JWTService, JWTPayload } from '../utils/jwt';
import logger from './logger';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
  ip?: string;
}

// ============ Authentication Middleware ============

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const payload = JWTService.verify(token);
    req.user = payload;
    req.ip = req.ip || req.socket.remoteAddress;

    next();
  } catch (error) {
    logger.warn('Authentication failed', { error: (error as Error).message });
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ============ Authorization Middleware (RBAC) ============

export const authorize = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Authorization failed', {
        userId: req.user.userId,
        role: req.user.role,
        requiredRoles: allowedRoles,
      });
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// ============ Admin-only Middleware ============

export const adminOnly = authorize(['ADMIN']);

// ============ User-only Middleware ============

export const userOnly = authorize(['USER']);

// ============ Optional Authentication ============

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      req.user = JWTService.verify(token);
    }
  } catch (error) {
    // Silent fail for optional auth
  }
  next();
};
