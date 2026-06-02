import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import AuthService from '../services/authService';
import logger from '../middleware/logger';

export class AuthController {
  static async signup(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, username, password, firstName, lastName } = req.body;

      if (!email || !username || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      const result = await AuthService.signup({
        email,
        username,
        password,
        firstName,
        lastName,
      });

      return res.status(201).json(result);
    } catch (error) {
      logger.error('Signup error', { error: (error as Error).message });
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  static async signin(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const result = await AuthService.signin({ email, password });
      return res.json(result);
    } catch (error) {
      logger.warn('Signin failed', { email: req.body.email });
      return res.status(401).json({ error: (error as Error).message });
    }
  }

  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await AuthService.getUserById(req.user.userId);
      return res.json(user);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await AuthService.changePassword(req.user.userId, oldPassword, newPassword);
      return res.json({ message: 'Password changed successfully' });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }
}

export default AuthController;
