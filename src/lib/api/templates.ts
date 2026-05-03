import { apiClient } from './client';
import type { ShiftTemplateRecord, SaveShiftTemplatesRequest } from '@/lib/types/template';

export const templatesApi = {
  get: async (restaurantId: string): Promise<ShiftTemplateRecord> => {
    const { data } = await apiClient.get('/shift-templates', {
      params: { restaurant_id: restaurantId },
    });
    return data;
  },

  save: async (payload: SaveShiftTemplatesRequest): Promise<ShiftTemplateRecord> => {
    const { data } = await apiClient.put('/shift-templates', payload);
    return data;
  },
};
