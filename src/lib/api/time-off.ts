import { apiClient } from './client';
import type { TimeOff, CreateTimeOffRequest } from '@/lib/types/timeOff';

export const timeOffApi = {
  list: async (employeeId: string): Promise<TimeOff[]> => {
    const { data } = await apiClient.get<TimeOff[]>(
      `/employees/${employeeId}/time-off`,
    );
    return data;
  },

  create: async (
    employeeId: string,
    payload: CreateTimeOffRequest,
  ): Promise<TimeOff> => {
    const { data } = await apiClient.post<TimeOff>(
      `/employees/${employeeId}/time-off`,
      payload,
    );
    return data;
  },

  delete: async (employeeId: string, timeOffId: string): Promise<void> => {
    await apiClient.delete(
      `/employees/${employeeId}/time-off/${timeOffId}`,
    );
  },
};
