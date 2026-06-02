import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import BrandService from '../services/brandService';
import logger from '../middleware/logger';

export class BrandController {
  static async getAllBrands(req: AuthenticatedRequest, res: Response) {
    try {
      const brands = await BrandService.getAllBrands();
      return res.json(brands);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  static async getBrandsByType(req: AuthenticatedRequest, res: Response) {
    try {
      const { productType } = req.params;
      const brands = await BrandService.getBrandsByType(productType);
      return res.json(brands);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  static async createBrand(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { name, productType, description, logoUrl } = req.body;

      if (!name || !productType) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const brand = await BrandService.createBrand(
        name,
        productType,
        req.user.userId,
        description,
        logoUrl,
      );

      return res.status(201).json(brand);
    } catch (error) {
      logger.error('Brand creation error', { error: (error as Error).message });
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  static async updateBrand(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { brandId } = req.params;
      const brand = await BrandService.updateBrand(brandId, req.user.userId, req.body);

      return res.json(brand);
    } catch (error) {
      logger.error('Brand update error', { error: (error as Error).message });
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  static async deleteBrand(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { brandId } = req.params;
      await BrandService.deleteBrand(brandId, req.user.userId);

      return res.json({ message: 'Brand deleted successfully' });
    } catch (error) {
      logger.error('Brand deletion error', { error: (error as Error).message });
      return res.status(400).json({ error: (error as Error).message });
    }
  }
}

export default BrandController;
