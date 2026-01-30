import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All booking routes require authentication
router.post('/', authenticate, BookingController.createBooking);
router.get('/', authenticate, BookingController.getUserBookings);
router.get('/:id', authenticate, BookingController.getBookingById);
router.patch('/:id/status', authenticate, BookingController.updateBookingStatus);

export default router;
