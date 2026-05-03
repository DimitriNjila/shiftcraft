import { apiClient } from './client';
import type { AnalyzeScheduleResponse } from '@/lib/types/schedule';

export const analysisApi = {
  analyze: async (scheduleId: string): Promise<AnalyzeScheduleResponse> => {
    const { data } = await apiClient.post(`/schedules/${scheduleId}/analyze`);
    return data;
  },
};
