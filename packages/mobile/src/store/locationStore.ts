import { create } from 'zustand';
import { Location } from '@ma-consultant/shared';

interface LocationState {
  userLocation: Location | null;
  isTracking: boolean;
  error: string | null;

  // Actions
  setUserLocation: (location: Location) => void;
  setTracking: (tracking: boolean) => void;
  setError: (error: string | null) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  userLocation: null,
  isTracking: false,
  error: null,

  setUserLocation: (location: Location) => {
    set({ userLocation: location, error: null });
  },

  setTracking: (tracking: boolean) => {
    set({ isTracking: tracking });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
