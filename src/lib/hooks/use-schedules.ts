import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { schedulesApi } from '@/lib/api/schedules';
import type { Schedule, CreateScheduleRequest } from '@/lib/types/schedule';

export function useSchedules(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ['schedules', restaurantId],
    queryFn: () => schedulesApi.list(restaurantId!),
    enabled: !!restaurantId,
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateScheduleRequest) => schedulesApi.create(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['schedules', variables.restaurant_id] });
      toast.success('Schedule created');
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      toast.error(error.response?.data?.detail ?? 'Failed to create schedule');
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => schedulesApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['schedules'] });

      const previousData = queryClient.getQueriesData<Schedule[]>({ queryKey: ['schedules'] });

      queryClient.setQueriesData<Schedule[]>(
        { queryKey: ['schedules'] },
        (old) => old?.filter((s) => s.id !== id),
      );

      return { previousData };
    },
    onSuccess: () => {
      toast.success('Schedule deleted');
    },
    onError: (error: AxiosError<{ detail?: string }>, _, context) => {
      context?.previousData.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error(error.response?.data?.detail ?? 'Failed to delete schedule');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
}
