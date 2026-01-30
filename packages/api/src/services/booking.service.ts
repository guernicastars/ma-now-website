import { v4 as uuidv4 } from 'uuid';
import {
  Booking,
  BookingWithDetails,
  CreateBookingData,
  BookingStatus,
} from '@ma-consultant/shared';
import {
  getBookings,
  createBooking as createBookingInDb,
  findBookingById,
  updateBookingStatus,
  findConsultantById,
  findUserById,
} from '../database/db';

export class BookingService {
  static async createBooking(
    userId: string,
    data: CreateBookingData
  ): Promise<Booking> {
    // Verify consultant exists
    const consultant = findConsultantById(data.consultantId);
    if (!consultant) {
      throw new Error('Consultant not found');
    }

    // Calculate total amount (8 hours per day)
    const totalAmount = consultant.hourlyRate * 8 * data.duration;

    const booking: Booking = {
      id: uuidv4(),
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createBookingInDb(booking);
    return booking;
  }

  static async getUserBookings(userId: string): Promise<BookingWithDetails[]> {
    const bookings = getBookings()
      .filter((b: Booking) => b.clientId === userId)
      .value();

    const bookingsWithDetails: BookingWithDetails[] = [];

    for (const booking of bookings) {
      const consultant = findConsultantById(booking.consultantId);
      const consultantUser = consultant
        ? findUserById(consultant.userId)
        : null;
      const client = findUserById(booking.clientId);

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
    const booking = findBookingById(bookingId);

    if (!booking || booking.clientId !== userId) {
      return null;
    }

    const consultant = findConsultantById(booking.consultantId);
    const consultantUser = consultant
      ? findUserById(consultant.userId)
      : null;
    const client = findUserById(booking.clientId);

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
    const booking = findBookingById(bookingId);

    if (!booking || booking.clientId !== userId) {
      throw new Error('Booking not found');
    }

    updateBookingStatus(bookingId, status);
  }
}
