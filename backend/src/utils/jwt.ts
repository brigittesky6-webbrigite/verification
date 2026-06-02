import jwt from 'jsonwebtoken';
import { config } from '../config/index';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export class JWTService {
  static sign(payload: JWTPayload): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiry,
      algorithm: 'HS256',
    });
  }

  static verify(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.jwtSecret, {
        algorithms: ['HS256'],
      }) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static decode(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }
}

export default JWTService;
