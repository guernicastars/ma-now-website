import { Router } from 'express';
import { ConsultantController } from '../controllers/consultant.controller';
import {
  authenticate,
  validateBody,
  validateQuery,
  validateParams,
  generalRateLimit,
} from '../middleware';
import {
  nearbyConsultantsQuerySchema,
  updateLocationSchema,
  uuidParamSchema,
} from '../validation/schemas';

const router = Router();

// GET /api/consultants/nearby - Get nearby consultants (public)
router.get(
  '/nearby',
  generalRateLimit,
  validateQuery(nearbyConsultantsQuerySchema),
  ConsultantController.getNearbyConsultants
);

// GET /api/consultants/:id - Get consultant by ID (public)
router.get(
  '/:id',
  generalRateLimit,
  validateParams(uuidParamSchema),
  ConsultantController.getConsultantById
);

// POST /api/consultants/:id/location - Update consultant location (protected)
router.post(
  '/:id/location',
  authenticate,
  validateParams(uuidParamSchema),
  validateBody(updateLocationSchema),
  ConsultantController.updateLocation
);

export default router;
