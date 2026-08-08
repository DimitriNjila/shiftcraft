import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { shiftsApi } from '@/lib/api/shifts';
import type { Shift, CreateShiftRequest, UpdateShiftRequest } from '@/lib/types/schedule';

export function useCreateShift(scheduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateShiftRequest) => shiftsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', scheduleId] });
      toast.success('Shift added');
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      toast.error(error.response?.data?.detail ?? 'Failed to add shift');
    },
  });
}

export function useUpdateShift(scheduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateShiftRequest }) =>
      shiftsApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', scheduleId] });
      toast.success('Shift updated');
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      toast.error(error.response?.data?.detail ?? 'Failed to update shift');
    },
  });
}

/**
 * Delete every shift in a schedule in parallel. There's no dedicated
 * backend "clear" endpoint, so we fan out DELETE /shifts/:id and rely on
 * Promise.allSettled to collect partial failures. On completion we
 * invalidate the schedule so the grid reflects the actual server state
 * even if a subset failed.
 */
export function useClearScheduleShifts(scheduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shiftIds: string[]) => {
      const results = await Promise.allSettled(
        shiftIds.map((id) => shiftsApi.delete(id)),
      );
      const failed = results.filter((r) => r.status === 'rejected').length;
      return { total: shiftIds.length, failed };
    },
    onMutate: async (shiftIds) => {
      await queryClient.cancelQueries({ queryKey: ['schedule', scheduleId] });
      const previousData = queryClient.getQueryData(['schedule', scheduleId]);
      const removing = new Set(shiftIds);
      queryClient.setQueryData(
        ['schedule', scheduleId],
        (old: { shifts?: Shift[] } | undefined) => {
          if (!old) return old;
          return { ...old, shifts: old.shifts?.filter((s) => !removing.has(s.id)) };
        },
      );
      return { previousData };
    },
    onSuccess: ({ total, failed }) => {
      if (failed === 0) {
        toast.success(`Cleared ${total} shift${total === 1 ? '' : 's'}`);
      } else if (failed < total) {
        toast.warning(
          `Cleared ${total - failed} of ${total} shifts — ${failed} failed`,
        );
      } else {
        toast.error("Couldn't clear the schedule");
      }
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['schedule', scheduleId], context?.previousData);
      toast.error('Failed to clear schedule');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', scheduleId] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
}

export function useDeleteShift(scheduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shiftsApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['schedule', scheduleId] });

      const previousData = queryClient.getQueryData(['schedule', scheduleId]);

      queryClient.setQueryData(['schedule', scheduleId], (old: { shifts?: Shift[] } | undefined) => {
        if (!old) return old;
        return { ...old, shifts: old.shifts?.filter((s) => s.id !== id) };
      });

      return { previousData };
    },
    onSuccess: () => {
      toast.success('Shift removed');
    },
    onError: (error: AxiosError<{ detail?: string }>, _, context) => {
      queryClient.setQueryData(['schedule', scheduleId], context?.previousData);
      toast.error(error.response?.data?.detail ?? 'Failed to remove shift');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', scheduleId] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
}
