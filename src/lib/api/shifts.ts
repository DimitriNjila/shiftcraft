import { apiClient } from './client';
import type { Shift, CreateShiftRequest, UpdateShiftRequest } from '@/lib/types/schedule';

export const shiftsApi = {
  create: async (payload: CreateShiftRequest): Promise<Shift> => {
    const { data } = await apiClient.post('/shifts', payload);
    return data;
  },

  update: async (id: string, updates: UpdateShiftRequest): Promise<Shift> => {
    const { data } = await apiClient.patch(`/shifts/${id}`, updates);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/shifts/${id}`);
  },
};
