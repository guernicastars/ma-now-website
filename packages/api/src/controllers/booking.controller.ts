import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';
import { asyncHandler, NotFoundError } from '../middleware';

export class BookingController {
  /**
   * POST /api/bookings
   * Create a new booking
   */
  static createBooking = asyncHandler(async (req: Request, res: Response) => {
    // Validation is done by middleware
    const booking = await BookingService.createBooking(req.user!.id, req.body);

    res.status(201).json({
      success: true,
      data: booking,
    });
  });

  /**
   * GET /api/bookings
   * Get all bookings for current user
   */
  static getUserBookings = asyncHandler(async (req: Request, res: Response) => {
    const bookings = await BookingService.getUserBookings(req.user!.id);

    res.json({
      success: true,
      data: bookings,
    });
  });

  /**
   * GET /api/bookings/:id
   * Get a specific booking by ID
   */
  static getBookingById = asyncHandler(async (req: Request, res: Response) => {
    const booking = await BookingService.getBookingById(req.params.id, req.user!.id);

    if (!booking) {
      throw NotFoundError('Booking not found');
    }

    res.json({
      success: true,
      data: booking,
    });
  });

  /**
   * PATCH /api/bookings/:id/status
   * Update booking status
   */
  static updateBookingStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;

    await BookingService.updateStatus(req.params.id, req.user!.id, status);

    res.json({
      success: true,
      message: 'Booking status updated',
    });
  });

  /**
   * DELETE /api/bookings/:id
   * Cancel a booking
   */
  static cancelBooking = asyncHandler(async (req: Request, res: Response) => {
    await BookingService.cancelBooking(req.params.id, req.user!.id);

    res.json({
      success: true,
      message: 'Booking cancelled',
    });
  });
}
