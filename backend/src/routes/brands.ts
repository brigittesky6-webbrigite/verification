import { Router } from 'express';
import { authenticate, adminOnly } from '../middleware/auth';
import BrandController from '../controllers/brandController';

const router = Router();

router.get('/', BrandController.getAllBrands);
router.get('/type/:productType', BrandController.getBrandsByType);

// Admin routes
router.post('/', authenticate, adminOnly, BrandController.createBrand);
router.patch('/:brandId', authenticate, adminOnly, BrandController.updateBrand);
router.delete('/:brandId', authenticate, adminOnly, BrandController.deleteBrand);

export default router;
