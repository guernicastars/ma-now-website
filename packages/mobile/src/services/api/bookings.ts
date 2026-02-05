import apiClient from './client';
import {
  MeetingTypePublic,
  TimeSlot,
  SlotHold,
  Booking,
  BookingWithMeetingType,
  CreateHoldData,
  ConfirmBookingData,
  GetSlotsQuery,
  GetBookingsQuery,
} from '@ma-consultant/shared';

// ============ PUBLIC BOOKING API ============
// For guests booking with hosts

export const publicBookingApi = {
  /**
   * Get meeting type info by slug
   * GET /api/book/:slug
   */
  getMeetingType: async (slug: string): Promise<MeetingTypePublic> => {
    const response = await apiClient.get<MeetingTypePublic>(`/book/${slug}`);
    return response.data;
  },

  /**
   * Get available slots for a meeting type
   * GET /api/book/:slug/slots
   */
  getAvailableSlots: async (slug: string, query: GetSlotsQuery): Promise<TimeSlot[]> => {
    const response = await apiClient.get<{ slots: TimeSlot[] }>(`/book/${slug}/slots`, {
      params: query,
    });
    return response.data.slots;
  },

  /**
   * Create a slot hold (5 min expiration)
   * POST /api/book/:slug/hold
   */
  createHold: async (slug: string, data: CreateHoldData): Promise<SlotHold> => {
    const response = await apiClient.post<{ hold: SlotHold }>(`/book/${slug}/hold`, data);
    return response.data.hold;
  },

  /**
   * Get hold status
   * GET /api/book/:slug/hold/:holdId
   */
  getHoldStatus: async (slug: string, holdId: string): Promise<SlotHold> => {
    const response = await apiClient.get<{ hold: SlotHold }>(`/book/${slug}/hold/${holdId}`);
    return response.data.hold;
  },

  /**
   * Release a slot hold
   * DELETE /api/book/:slug/hold/:holdId
   */
  releaseHold: async (slug: string, holdId: string): Promise<void> => {
    await apiClient.delete(`/book/${slug}/hold/${holdId}`);
  },

  /**
   * Confirm booking from hold
   * POST /api/book/:slug/confirm
   */
  confirmBooking: async (slug: string, data: ConfirmBookingData): Promise<Booking> => {
    const response = await apiClient.post<{ booking: Booking }>(`/book/${slug}/confirm`, data);
    return response.data.booking;
  },
};

// ============ HOST BOOKINGS API ============
// For hosts managing their bookings (requires auth)

export const bookingsApi = {
  /**
   * Get host's bookings
   * GET /api/bookings
   */
  getBookings: async (query?: GetBookingsQuery): Promise<BookingWithMeetingType[]> => {
    const response = await apiClient.get<{ bookings: BookingWithMeetingType[] }>('/bookings', {
      params: query,
    });
    return response.data.bookings;
  },

  /**
   * Get upcoming bookings
   * GET /api/bookings/upcoming
   */
  getUpcomingBookings: async (limit = 10): Promise<BookingWithMeetingType[]> => {
    const response = await apiClient.get<{ bookings: BookingWithMeetingType[] }>(
      '/bookings/upcoming',
      { params: { limit } }
    );
    return response.data.bookings;
  },

  /**
   * Get booking statistics
   * GET /api/bookings/stats
   */
  getBookingStats: async (): Promise<{
    total: number;
    confirmed: number;
    completed: number;
    canceled: number;
    noShow: number;
  }> => {
    const response = await apiClient.get('/bookings/stats');
    return response.data;
  },

  /**
   * Get booking by ID
   * GET /api/bookings/:id
   */
  getBookingById: async (id: string): Promise<BookingWithMeetingType> => {
    const response = await apiClient.get<{ booking: BookingWithMeetingType }>(`/bookings/${id}`);
    return response.data.booking;
  },

  /**
   * Cancel a booking
   * POST /api/bookings/:id/cancel
   */
  cancelBooking: async (id: string, reason?: string): Promise<void> => {
    await apiClient.post(`/bookings/${id}/cancel`, { reason });
  },

  /**
   * Mark booking as completed
   * POST /api/bookings/:id/complete
   */
  completeBooking: async (id: string): Promise<void> => {
    await apiClient.post(`/bookings/${id}/complete`);
  },

  /**
   * Mark booking as no-show
   * POST /api/bookings/:id/no-show
   */
  markNoShow: async (id: string): Promise<void> => {
    await apiClient.post(`/bookings/${id}/no-show`);
  },
};
