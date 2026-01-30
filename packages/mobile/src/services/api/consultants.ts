import apiClient from './client';
import {
  ConsultantWithDistance,
  ConsultantWithUser,
  NearbyConsultantsQuery,
  ApiResponse,
} from '@ma-consultant/shared';

export const consultantsApi = {
  /**
   * Get nearby consultants
   */
  getNearby: async (
    query: NearbyConsultantsQuery
  ): Promise<ConsultantWithDistance[]> => {
    const response = await apiClient.get<
      ApiResponse<ConsultantWithDistance[]>
    >('/consultants/nearby', {
      params: query,
    });
    return response.data.data!;
  },

  /**
   * Get consultant by ID
   */
  getById: async (id: string): Promise<ConsultantWithUser> => {
    const response = await apiClient.get<ApiResponse<ConsultantWithUser>>(
      `/consultants/${id}`
    );
    return response.data.data!;
  },

  /**
   * Update consultant location (consultant only)
   */
  updateLocation: async (
    id: string,
    location: { latitude: number; longitude: number }
  ): Promise<void> => {
    await apiClient.post(`/consultants/${id}/location`, location);
  },
};
