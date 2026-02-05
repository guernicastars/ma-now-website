import apiClient from './client';
import { AuthResponse, RegisterUserData, UserCredentials, User } from '@ma-consultant/shared';

// manow API returns data directly (not wrapped in ApiResponse)
interface ManowAuthResponse {
  user: User;
  token: string;
}

interface ManowUserResponse {
  user: User;
}

export const authApi = {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  register: async (data: RegisterUserData): Promise<AuthResponse> => {
    const response = await apiClient.post<ManowAuthResponse>('/auth/register', data);
    return {
      user: response.data.user,
      token: response.data.token,
    };
  },

  /**
   * Login with email and password
   * POST /api/auth/login
   */
  login: async (credentials: UserCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<ManowAuthResponse>('/auth/login', credentials);
    return {
      user: response.data.user,
      token: response.data.token,
    };
  },

  /**
   * Get current authenticated user
   * GET /api/auth/me
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ManowUserResponse>('/auth/me');
    return response.data.user;
  },

  /**
   * Logout current user
   * POST /api/auth/logout
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  /**
   * Update current user profile
   * PATCH /api/auth/me
   */
  updateProfile: async (data: { name?: string; timezone?: string }): Promise<User> => {
    const response = await apiClient.patch<ManowUserResponse>('/auth/me', data);
    return response.data.user;
  },

  /**
   * Request magic link for passwordless login
   * POST /api/auth/magic-link
   */
  requestMagicLink: async (email: string): Promise<void> => {
    await apiClient.post('/auth/magic-link', { email });
  },
};
