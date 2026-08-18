import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { timeOffApi } from '@/lib/api/time-off';
import type { TimeOff, CreateTimeOffRequest } from '@/lib/types/timeOff';

export function useTimeOff(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['time-off', employeeId],
    queryFn: () => timeOffApi.list(employeeId!),
    enabled: !!employeeId,
  });
}

/**
 * Fan-out fetch: one query per employee, keyed like `useTimeOff` so cache
 * entries are shared with the per-employee view. Returns a flat map of
 * employee_id → rows plus an aggregate loading flag.
 */
export function useTimeOffForEmployees(employeeIds: string[]) {
  const results = useQueries({
    queries: employeeIds.map((id) => ({
      queryKey: ['time-off', id],
      queryFn: () => timeOffApi.list(id),
    })),
  });

  const byEmployee: Record<string, TimeOff[]> = {};
  employeeIds.forEach((id, i) => {
    byEmployee[id] = results[i]?.data ?? [];
  });

  return {
    byEmployee,
    isLoading: results.some((r) => r.isLoading),
  };
}

export function useAddTimeOff(employeeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTimeOffRequest) =>
      timeOffApi.create(employeeId, payload),
    onSuccess: (created) => {
      queryClient.setQueryData<TimeOff[]>(
        ['time-off', employeeId],
        (old) => [created, ...(old ?? [])],
      );
      toast.success('Time off added');
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      toast.error(error.response?.data?.detail ?? 'Failed to add time off');
    },
  });
}

export function useDeleteTimeOff(employeeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (timeOffId: string) =>
      timeOffApi.delete(employeeId, timeOffId),
    onMutate: async (timeOffId) => {
      await queryClient.cancelQueries({ queryKey: ['time-off', employeeId] });
      const previous = queryClient.getQueryData<TimeOff[]>([
        'time-off',
        employeeId,
      ]);
      queryClient.setQueryData<TimeOff[]>(
        ['time-off', employeeId],
        (old) => old?.filter((t) => t.id !== timeOffId),
      );
      return { previous };
    },
    onError: (error: AxiosError<{ detail?: string }>, _, context) => {
      queryClient.setQueryData(['time-off', employeeId], context?.previous);
      toast.error(error.response?.data?.detail ?? 'Failed to remove time off');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off', employeeId] });
    },
  });
}
