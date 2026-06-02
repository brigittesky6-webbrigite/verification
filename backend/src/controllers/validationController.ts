import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import ValidationService from '../services/validationService';
import BrandService from '../services/brandService';
import logger from '../middleware/logger';

export class ValidationController {
  static async submitValidation(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { code, brandId, productType } = req.body;

      if (!code || !brandId || !productType) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (code.length < 8) {
        return res.status(400).json({ error: 'Code must be at least 8 characters' });
      }

      const result = await ValidationService.submitValidation({
        code,
        brandId,
        productType,
        userId: req.user.userId,
      });

      return res.status(201).json(result);
    } catch (error) {
      logger.error('Validation submission error', { error: (error as Error).message });
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  static async getUserRequests(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const requests = await ValidationService.getRequestsByUserId(req.user.userId);
      return res.json(requests);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  // Admin controllers
  static async getAllRequests(req: AuthenticatedRequest, res: Response) {
    try {
      const { status, brandId, startDate, endDate } = req.query;

      const requests = await ValidationService.getAllRequests(
        status as string,
        brandId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      );

      return res.json(requests);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  static async validateRequest(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { requestId } = req.params;
      const { comments } = req.body;

      const result = await ValidationService.validateRequest({
        requestId,
        adminId: req.user.userId,
        comments,
      });

      return res.json(result);
    } catch (error) {
      logger.error('Validation error', { error: (error as Error).message });
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  static async rejectRequest(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { requestId } = req.params;
      const { rejectionReason } = req.body;

      if (!rejectionReason) {
        return res.status(400).json({ error: 'Rejection reason is required' });
      }

      const result = await ValidationService.rejectRequest({
        requestId,
        adminId: req.user.userId,
        rejectionReason,
      });

      return res.json(result);
    } catch (error) {
      logger.error('Rejection error', { error: (error as Error).message });
      return res.status(400).json({ error: (error as Error).message });
    }
  }
}

export default ValidationController;
