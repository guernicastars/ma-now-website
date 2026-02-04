import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import {
  authenticate,
  validateBody,
  validateParams,
  bookingRateLimit,
} from '../middleware';
import {
  createBookingSchema,
  updateBookingStatusSchema,
  uuidParamSchema,
} from '../validation/schemas';

const router = Router();

// All booking routes require authentication

// POST /api/bookings - Create new booking
router.post(
  '/',
  authenticate,
  bookingRateLimit,
  validateBody(createBookingSchema),
  BookingController.createBooking
);

// GET /api/bookings - Get user's bookings
router.get('/', authenticate, BookingController.getUserBookings);

// GET /api/bookings/:id - Get booking by ID
router.get(
  '/:id',
  authenticate,
  validateParams(uuidParamSchema),
  BookingController.getBookingById
);

// PATCH /api/bookings/:id/status - Update booking status
router.patch(
  '/:id/status',
  authenticate,
  validateParams(uuidParamSchema),
  validateBody(updateBookingStatusSchema),
  BookingController.updateBookingStatus
);

export default router;
