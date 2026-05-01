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
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
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
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Shift updated');
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      toast.error(error.response?.data?.detail ?? 'Failed to update shift');
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
