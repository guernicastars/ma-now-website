import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';
import { CreateBookingData, BookingStatus } from '@ma-consultant/shared';

export class BookingController {
  static async createBooking(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const data: CreateBookingData = req.body;

      // Validate required fields
      if (
        !data.consultantId ||
        !data.negotiationType ||
        !data.startDate ||
        !data.duration ||
        !data.locationType ||
        !data.ndaDetails
      ) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
        });
      }

      const booking = await BookingService.createBooking(req.user.id, data);

      res.status(201).json({
        success: true,
        data: booking,
      });
    } catch (error: any) {
      console.error('Create booking error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create booking',
      });
    }
  }

  static async getUserBookings(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const bookings = await BookingService.getUserBookings(req.user.id);

      res.json({
        success: true,
        data: bookings,
      });
    } catch (error: any) {
      console.error('Get user bookings error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch bookings',
      });
    }
  }

  static async getBookingById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { id } = req.params;
      const booking = await BookingService.getBookingById(
        String(id),
        req.user.id
      );

      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'Booking not found',
        });
      }

      res.json({
        success: true,
        data: booking,
      });
    } catch (error: any) {
      console.error('Get booking error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch booking',
      });
    }
  }

  static async updateBookingStatus(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { id } = req.params;
      const { status }: { status: BookingStatus } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status is required',
        });
      }

      await BookingService.updateStatus(String(id), req.user.id, status);

      res.json({
        success: true,
        message: 'Booking status updated',
      });
    } catch (error: any) {
      console.error('Update booking status error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update booking',
      });
    }
  }
}
