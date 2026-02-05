import apiClient from './client';
import { MeetingType, CreateMeetingTypeData } from '@ma-consultant/shared';

export const meetingTypesApi = {
  /**
   * Get all user's meeting types
   * GET /api/meeting-types
   */
  getMeetingTypes: async (): Promise<MeetingType[]> => {
    const response = await apiClient.get<{ meetingTypes: MeetingType[] }>('/meeting-types');
    return response.data.meetingTypes;
  },

  /**
   * Get active meeting types only
   * GET /api/meeting-types/active
   */
  getActiveMeetingTypes: async (): Promise<MeetingType[]> => {
    const response = await apiClient.get<{ meetingTypes: MeetingType[] }>('/meeting-types/active');
    return response.data.meetingTypes;
  },

  /**
   * Create a new meeting type
   * POST /api/meeting-types
   */
  createMeetingType: async (data: CreateMeetingTypeData): Promise<MeetingType> => {
    const response = await apiClient.post<{ meetingType: MeetingType }>('/meeting-types', data);
    return response.data.meetingType;
  },

  /**
   * Get meeting type by ID
   * GET /api/meeting-types/:id
   */
  getMeetingTypeById: async (id: string): Promise<MeetingType> => {
    const response = await apiClient.get<{ meetingType: MeetingType }>(`/meeting-types/${id}`);
    return response.data.meetingType;
  },

  /**
   * Update a meeting type
   * PATCH /api/meeting-types/:id
   */
  updateMeetingType: async (
    id: string,
    data: Partial<CreateMeetingTypeData> & { isActive?: boolean }
  ): Promise<MeetingType> => {
    const response = await apiClient.patch<{ meetingType: MeetingType }>(
      `/meeting-types/${id}`,
      data
    );
    return response.data.meetingType;
  },

  /**
   * Delete a meeting type
   * DELETE /api/meeting-types/:id
   */
  deleteMeetingType: async (id: string): Promise<void> => {
    await apiClient.delete(`/meeting-types/${id}`);
  },
};
