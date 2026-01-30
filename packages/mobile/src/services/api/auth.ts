import apiClient from './client';
import {
  AuthResponse,
  RegisterUserData,
  UserCredentials,
  User,
  ApiResponse,
} from '@ma-consultant/shared';

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterUserData): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      data
    );
    return response.data.data!;
  },

  /**
   * Login with email and password
   */
  login: async (credentials: UserCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );
    return response.data.data!;
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data!;
  },
};
