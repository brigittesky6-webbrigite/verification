import { Router } from 'express';
import { authenticate, authorize, adminOnly } from '../middleware/auth';
import AuthController from '../controllers/authController';

const router = Router();

router.post('/signup', AuthController.signup);
router.post('/signin', AuthController.signin);
router.get('/profile', authenticate, AuthController.getProfile);
router.post('/change-password', authenticate, AuthController.changePassword);

export default router;
