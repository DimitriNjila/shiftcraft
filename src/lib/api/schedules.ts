import { apiClient } from './client';
import type { Schedule, CreateScheduleRequest } from '@/lib/types/schedule';

export const schedulesApi = {
  list: async (restaurantId: string): Promise<Schedule[]> => {
    const { data } = await apiClient.get('/schedules', {
      params: { restaurant_id: restaurantId },
    });
    return data;
  },

  create: async (payload: CreateScheduleRequest): Promise<Schedule> => {
    const { data } = await apiClient.post('/schedules', payload);
    return data;
  },

  getById: async (id: string): Promise<Schedule> => {
    const { data } = await apiClient.get(`/schedules/${id}`);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/schedules/${id}`);
  },
};
