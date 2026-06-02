import { Router } from 'express';
import { authenticate, adminOnly } from '../middleware/auth';
import ValidationController from '../controllers/validationController';

const router = Router();

// User routes
router.post('/submit', authenticate, ValidationController.submitValidation);
router.get('/my-requests', authenticate, ValidationController.getUserRequests);

// Admin routes
router.get('/all', authenticate, adminOnly, ValidationController.getAllRequests);
router.post('/:requestId/validate', authenticate, adminOnly, ValidationController.validateRequest);
router.post('/:requestId/reject', authenticate, adminOnly, ValidationController.rejectRequest);

export default router;
