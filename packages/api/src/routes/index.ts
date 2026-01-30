import { Router, Application } from 'express';
import authRoutes from './auth.routes';
import consultantRoutes from './consultant.routes';
import bookingRoutes from './booking.routes';

export const registerRoutes = (app: Application): void => {
  const router = Router();

  // Register route modules
  router.use('/auth', authRoutes);
  router.use('/consultants', consultantRoutes);
  router.use('/bookings', bookingRoutes);

  // Mount all routes under /api prefix
  app.use('/api', router);

  console.log('✅ Routes registered');
};
