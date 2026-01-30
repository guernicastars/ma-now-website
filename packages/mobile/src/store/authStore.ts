import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthResponse } from '@ma-consultant/shared';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setAuth: (data: AuthResponse) => Promise<void>;
  logout: () => Promise<void>;
  loadAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

const TOKEN_KEY = '@ma_consultant_token';
const USER_KEY = '@ma_consultant_user';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: async (data: AuthResponse) => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));

      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  },

  loadAuth: async () => {
    try {
      set({ isLoading: true });

      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const userJson = await AsyncStorage.getItem(USER_KEY);

      if (token && userJson) {
        const user = JSON.parse(userJson);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
