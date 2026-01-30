import { create } from 'zustand';
import { ConsultantWithDistance } from '@ma-consultant/shared';

interface ConsultantState {
  consultants: ConsultantWithDistance[];
  selectedConsultant: ConsultantWithDistance | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setConsultants: (consultants: ConsultantWithDistance[]) => void;
  setSelectedConsultant: (consultant: ConsultantWithDistance | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useConsultantStore = create<ConsultantState>((set) => ({
  consultants: [],
  selectedConsultant: null,
  isLoading: false,
  error: null,

  setConsultants: (consultants) => {
    set({ consultants, error: null });
  },

  setSelectedConsultant: (consultant) => {
    set({ selectedConsultant: consultant });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },
}));
