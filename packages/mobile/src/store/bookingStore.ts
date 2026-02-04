import { create } from 'zustand';
import {
  ConsultantWithDistance,
  NegotiationType,
  LocationType,
  BookingDuration,
  LocationWithAddress,
} from '@ma-consultant/shared';

interface BookingState {
  // Consultant being booked
  consultant: ConsultantWithDistance | null;

  // Booking form data
  negotiationType: NegotiationType | null;
  startDate: Date | null;
  duration: BookingDuration | null;
  locationType: LocationType | null;
  location: LocationWithAddress | null;
  ndaDetails: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;

  // Booking result
  bookingId: string | null;
  totalAmount: number;

  // Actions
  startBooking: (consultant: ConsultantWithDistance) => void;
  setNegotiationType: (type: NegotiationType) => void;
  setDateAndDuration: (date: Date, duration: BookingDuration) => void;
  setLocationType: (type: LocationType) => void;
  setLocation: (location: LocationWithAddress) => void;
  setNDADetails: (details: { firstName: string; lastName: string; email: string }) => void;
  setBookingId: (id: string) => void;
  calculateTotalAmount: () => number;
  resetBooking: () => void;
}

const HOURS_PER_DAY = 8; // Assume 8 hours per day of consultation

export const useBookingStore = create<BookingState>((set, get) => ({
  consultant: null,
  negotiationType: null,
  startDate: null,
  duration: null,
  locationType: null,
  location: null,
  ndaDetails: null,
  bookingId: null,
  totalAmount: 0,

  startBooking: (consultant) => {
    set({
      consultant,
      negotiationType: null,
      startDate: null,
      duration: null,
      locationType: null,
      location: null,
      ndaDetails: null,
      bookingId: null,
      totalAmount: 0,
    });
  },

  setNegotiationType: (type) => {
    set({ negotiationType: type });
  },

  setDateAndDuration: (date, duration) => {
    set({ startDate: date, duration });
    // Recalculate total
    const state = get();
    if (state.consultant && duration) {
      const total = state.consultant.hourlyRate * HOURS_PER_DAY * duration;
      set({ totalAmount: total });
    }
  },

  setLocationType: (type) => {
    set({ locationType: type });
  },

  setLocation: (location) => {
    set({ location });
  },

  setNDADetails: (details) => {
    set({ ndaDetails: details });
  },

  setBookingId: (id) => {
    set({ bookingId: id });
  },

  calculateTotalAmount: () => {
    const state = get();
    if (!state.consultant || !state.duration) return 0;
    return state.consultant.hourlyRate * HOURS_PER_DAY * state.duration;
  },

  resetBooking: () => {
    set({
      consultant: null,
      negotiationType: null,
      startDate: null,
      duration: null,
      locationType: null,
      location: null,
      ndaDetails: null,
      bookingId: null,
      totalAmount: 0,
    });
  },
}));
