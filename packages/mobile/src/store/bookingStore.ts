import { create } from 'zustand';
import {
  MeetingTypePublic,
  TimeSlot,
  SlotHold,
  Booking,
  LocationWithAddress,
} from '@ma-consultant/shared';

interface BookingState {
  // Meeting type being booked
  meetingType: MeetingTypePublic | null;
  meetingTypeSlug: string | null;

  // Selected slot
  selectedSlot: TimeSlot | null;

  // Slot hold (created after selecting slot)
  hold: SlotHold | null;
  holdExpiresAt: Date | null;

  // Guest info
  guestEmail: string | null;
  guestName: string | null;
  guestTimezone: string | null;
  guestNotes: string | null;

  // For onsite meetings
  location: LocationWithAddress | null;

  // NDA status (if required)
  ndaRequired: boolean;
  ndaSigned: boolean;
  ndaSignUrl: string | null;

  // Confirmed booking
  booking: Booking | null;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  startBooking: (meetingType: MeetingTypePublic, slug: string) => void;
  selectSlot: (slot: TimeSlot) => void;
  setHold: (hold: SlotHold) => void;
  setGuestInfo: (info: { email: string; name: string; timezone: string; notes?: string }) => void;
  setLocation: (location: LocationWithAddress) => void;
  setNdaSignUrl: (url: string) => void;
  markNdaSigned: () => void;
  setBooking: (booking: Booking) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetBooking: () => void;
  getHoldTimeRemaining: () => number | null; // seconds remaining
}

export const useBookingStore = create<BookingState>((set, get) => ({
  meetingType: null,
  meetingTypeSlug: null,
  selectedSlot: null,
  hold: null,
  holdExpiresAt: null,
  guestEmail: null,
  guestName: null,
  guestTimezone: null,
  guestNotes: null,
  location: null,
  ndaRequired: false,
  ndaSigned: false,
  ndaSignUrl: null,
  booking: null,
  isLoading: false,
  error: null,

  startBooking: (meetingType, slug) => {
    set({
      meetingType,
      meetingTypeSlug: slug,
      ndaRequired: meetingType.requiresNda,
      // Reset other fields
      selectedSlot: null,
      hold: null,
      holdExpiresAt: null,
      guestEmail: null,
      guestName: null,
      guestTimezone: null,
      guestNotes: null,
      location: null,
      ndaSigned: false,
      ndaSignUrl: null,
      booking: null,
      error: null,
    });
  },

  selectSlot: (slot) => {
    set({ selectedSlot: slot });
  },

  setHold: (hold) => {
    set({
      hold,
      holdExpiresAt: new Date(hold.expiresAt),
    });
  },

  setGuestInfo: ({ email, name, timezone, notes }) => {
    set({
      guestEmail: email,
      guestName: name,
      guestTimezone: timezone,
      guestNotes: notes || null,
    });
  },

  setLocation: (location) => {
    set({ location });
  },

  setNdaSignUrl: (url) => {
    set({ ndaSignUrl: url });
  },

  markNdaSigned: () => {
    set({ ndaSigned: true });
  },

  setBooking: (booking) => {
    set({ booking });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  resetBooking: () => {
    set({
      meetingType: null,
      meetingTypeSlug: null,
      selectedSlot: null,
      hold: null,
      holdExpiresAt: null,
      guestEmail: null,
      guestName: null,
      guestTimezone: null,
      guestNotes: null,
      location: null,
      ndaRequired: false,
      ndaSigned: false,
      ndaSignUrl: null,
      booking: null,
      isLoading: false,
      error: null,
    });
  },

  getHoldTimeRemaining: () => {
    const { holdExpiresAt } = get();
    if (!holdExpiresAt) return null;

    const now = new Date();
    const remaining = Math.floor((holdExpiresAt.getTime() - now.getTime()) / 1000);
    return remaining > 0 ? remaining : 0;
  },
}));
