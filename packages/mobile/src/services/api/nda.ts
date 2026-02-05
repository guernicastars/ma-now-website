import apiClient from './client';
import { NDADocument, CreateNDAData } from '@ma-consultant/shared';

export const ndaApi = {
  /**
   * Create an NDA envelope for signing
   * POST /api/nda/create
   */
  createNDA: async (data: CreateNDAData): Promise<{ document: NDADocument; signUrl: string }> => {
    const response = await apiClient.post<{ document: NDADocument; signUrl: string }>(
      '/nda/create',
      data
    );
    return response.data;
  },

  /**
   * Get NDA signature status
   * GET /api/nda/:holdId/status
   */
  getNDAStatus: async (holdId: string): Promise<NDADocument> => {
    const response = await apiClient.get<{ document: NDADocument }>(`/nda/${holdId}/status`);
    return response.data.document;
  },

  /**
   * Get signed NDA download URL
   * GET /api/nda/:documentId/download
   */
  getNDADownloadUrl: async (documentId: string): Promise<string> => {
    const response = await apiClient.get<{ url: string }>(`/nda/${documentId}/download`);
    return response.data.url;
  },
};
