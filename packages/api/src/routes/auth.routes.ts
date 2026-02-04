import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate, validateBody, authRateLimit } from '../middleware';
import { registerSchema, loginSchema } from '../validation/schemas';

const router = Router();

// POST /api/auth/register - Register new user
router.post(
  '/register',
  authRateLimit,
  validateBody(registerSchema),
  AuthController.register
);

// POST /api/auth/login - Login user
router.post(
  '/login',
  authRateLimit,
  validateBody(loginSchema),
  AuthController.login
);

// GET /api/auth/me - Get current user (protected)
router.get('/me', authenticate, AuthController.getCurrentUser);

export default router;
