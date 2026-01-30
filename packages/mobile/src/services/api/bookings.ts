import apiClient from './client';
import {
  CreateBookingData,
  Booking,
  BookingWithDetails,
  Payment,
  PaymentIntentResponse,
  ApiResponse,
} from '@ma-consultant/shared';

export const bookingsApi = {
  /**
   * Create a new booking
   */
  createBooking: async (data: CreateBookingData): Promise<Booking> => {
    const response = await apiClient.post<ApiResponse<Booking>>(
      '/bookings',
      data
    );
    return response.data.data!;
  },

  /**
   * Get user's bookings
   */
  getMyBookings: async (): Promise<BookingWithDetails[]> => {
    const response = await apiClient.get<ApiResponse<BookingWithDetails[]>>(
      '/bookings'
    );
    return response.data.data!;
  },

  /**
   * Get booking by ID
   */
  getBookingById: async (id: string): Promise<BookingWithDetails> => {
    const response = await apiClient.get<ApiResponse<BookingWithDetails>>(
      `/bookings/${id}`
    );
    return response.data.data!;
  },

  /**
   * Create payment intent
   */
  createPaymentIntent: async (bookingId: string): Promise<PaymentIntentResponse> => {
    const response = await apiClient.post<ApiResponse<PaymentIntentResponse>>(
      '/payments/create-intent',
      { bookingId }
    );
    return response.data.data!;
  },

  /**
   * Confirm payment
   */
  confirmPayment: async (paymentIntentId: string): Promise<Payment> => {
    const response = await apiClient.post<ApiResponse<Payment>>(
      '/payments/confirm',
      { paymentIntentId }
    );
    return response.data.data!;
  },
};
