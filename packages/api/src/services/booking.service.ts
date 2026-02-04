import {
  Booking,
  BookingWithDetails,
  CreateBookingData,
  BookingStatus,
} from '@ma-consultant/shared';
import * as db from '../database';

export class BookingService {
  static async createBooking(
    userId: string,
    data: CreateBookingData
  ): Promise<Booking> {
    // Verify consultant exists
    const consultant = await db.findConsultantById(data.consultantId);
    if (!consultant) {
      throw new Error('Consultant not found');
    }

    // Try to hold the slot (prevents double-booking)
    const holdResult = await db.createSlotHold(
      data.consultantId,
      data.startDate,
      userId,
      10 // 10 minute hold
    );

    if (!holdResult.success) {
      throw new Error('This time slot is no longer available');
    }

    try {
      // Calculate total amount (8 hours per day)
      const totalAmount = consultant.hourlyRate * 8 * data.duration;

      const booking = await db.createBooking({
        clientId: userId,
        consultantId: data.consultantId,
        status: 'pending',
        negotiationType: data.negotiationType,
        locationType: data.locationType,
        startDate: data.startDate,
        duration: data.duration,
        location: data.location,
        ndaDetails: {
          ...data.ndaDetails,
          signedAt: new Date().toISOString(),
        },
        totalAmount,
        notes: data.notes,
      });

      // Log booking created event
      await db.logEvent('booking.created', 'booking', booking.id, userId, {
        consultantId: data.consultantId,
        startDate: data.startDate,
        totalAmount,
      });

      // Release the hold (booking is now confirmed in DB)
      await db.releaseSlotHold(data.consultantId, data.startDate, userId);

      return booking;
    } catch (error) {
      // Release the hold on error
      await db.releaseSlotHold(data.consultantId, data.startDate, userId);
      throw error;
    }
  }

  static async getUserBookings(userId: string): Promise<BookingWithDetails[]> {
    const bookings = await db.findBookingsByClientId(userId);

    const bookingsWithDetails: BookingWithDetails[] = [];

    for (const booking of bookings) {
      const consultant = await db.findConsultantById(booking.consultantId);
      const consultantUser = consultant
        ? await db.findUserById(consultant.userId)
        : null;
      const client = await db.findUserById(booking.clientId);

      if (consultant && consultantUser && client) {
        bookingsWithDetails.push({
          ...booking,
          client,
          consultant: {
            ...consultant,
            user: consultantUser,
          },
        });
      }
    }

    // Sort by date (newest first)
    bookingsWithDetails.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return bookingsWithDetails;
  }

  static async getBookingById(
    bookingId: string,
    userId: string
  ): Promise<BookingWithDetails | null> {
    const booking = await db.findBookingById(bookingId);

    if (!booking || booking.clientId !== userId) {
      return null;
    }

    const consultant = await db.findConsultantById(booking.consultantId);
    const consultantUser = consultant
      ? await db.findUserById(consultant.userId)
      : null;
    const client = await db.findUserById(booking.clientId);

    if (!consultant || !consultantUser || !client) {
      return null;
    }

    return {
      ...booking,
      client,
      consultant: {
        ...consultant,
        user: consultantUser,
      },
    };
  }

  static async updateStatus(
    bookingId: string,
    userId: string,
    status: BookingStatus
  ): Promise<void> {
    const booking = await db.findBookingById(bookingId);

    if (!booking || booking.clientId !== userId) {
      throw new Error('Booking not found');
    }

    await db.updateBookingStatus(bookingId, status);

    // Log status change event
    await db.logEvent('booking.status_changed', 'booking', bookingId, userId, {
      oldStatus: booking.status,
      newStatus: status,
    });
  }

  static async cancelBooking(bookingId: string, userId: string): Promise<void> {
    const booking = await db.findBookingById(bookingId);

    if (!booking || booking.clientId !== userId) {
      throw new Error('Booking not found');
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      throw new Error('Cannot cancel this booking');
    }

    await db.updateBookingStatus(bookingId, 'cancelled');

    // Log cancellation event
    await db.logEvent('booking.cancelled', 'booking', bookingId, userId, {
      previousStatus: booking.status,
    });
  }
}
