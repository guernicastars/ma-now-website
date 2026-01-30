import { Router } from 'express';
import { ConsultantController } from '../controllers/consultant.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/nearby', ConsultantController.getNearbyConsultants);
router.get('/:id', ConsultantController.getConsultantById);

// Protected routes
router.post('/:id/location', authenticate, ConsultantController.updateLocation);

export default router;
