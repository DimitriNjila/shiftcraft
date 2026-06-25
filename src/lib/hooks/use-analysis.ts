import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { analysisApi } from '@/lib/api/analysis';
import type { AnalyzeScheduleResponse } from '@/lib/types/schedule';

export function useAnalyzeSchedule() {
  return useMutation<AnalyzeScheduleResponse, AxiosError<{ detail?: string }>, string>({
    mutationFn: (scheduleId: string) => analysisApi.analyze(scheduleId),
    onError: (error) => {
      // Errors are surfaced in the modal (503/502 get distinct messages).
      // Only log unexpecteds; the modal handles user-facing copy.
      console.error('Schedule analysis failed:', error.response?.data?.detail ?? error.message);
    },
  });
}
