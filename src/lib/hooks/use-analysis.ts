import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { analysisApi } from '@/lib/api/analysis';

export function useAnalyzeSchedule() {
  return useMutation({
    mutationFn: (scheduleId: string) => analysisApi.analyze(scheduleId),
    onError: (error: AxiosError<{ detail?: string }>) => {
      // Errors are surfaced via the modal — no global toast needed here.
      console.error('Schedule analysis failed:', error.response?.data?.detail ?? error.message);
    },
  });
}
