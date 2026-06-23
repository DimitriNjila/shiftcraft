import { apiClient } from './client';
import type { AvailabilityWindow, CreateAvailabilityRequest } from '@/lib/types/availability';

export const availabilityApi = {
  list: async (employeeId: string): Promise<AvailabilityWindow[]> => {
    const { data } = await apiClient.get<AvailabilityWindow[]>(
      `/v1/employees/${employeeId}/availability`,
    );
    return data;
  },

  create: async (
    employeeId: string,
    payload: CreateAvailabilityRequest,
  ): Promise<AvailabilityWindow> => {
    const { data } = await apiClient.post<AvailabilityWindow>(
      `/v1/employees/${employeeId}/availability`,
      payload,
    );
    return data;
  },

  delete: async (employeeId: string, availabilityId: string): Promise<void> => {
    await apiClient.delete(
      `/v1/employees/${employeeId}/availability/${availabilityId}`,
    );
  },
};
