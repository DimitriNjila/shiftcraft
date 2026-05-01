import { useEffect, useRef } from 'react';
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

export function useScheduleDetail(scheduleId: string | undefined) {
  return useQuery({
    queryKey: ['schedule', scheduleId],
    queryFn: () => schedulesApi.getById(scheduleId!),
    enabled: !!scheduleId,
  });
}

export function useWeekSchedule(restaurantId: string | undefined, weekStart: string) {
  const queryClient = useQueryClient();
  const { data: schedules, status: schedulesStatus } = useSchedules(restaurantId);

  const provision = useMutation({
    mutationFn: (payload: CreateScheduleRequest) => schedulesApi.create(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['schedules', variables.restaurant_id] });
    },
  });

  const scheduleId = schedules?.find((s) => s.week_start === weekStart)?.id;
  const provisionKey = useRef<string | null>(null);

  useEffect(() => {
    if (
      schedulesStatus === 'success' &&
      !scheduleId &&
      !provision.isPending &&
      provisionKey.current !== `${restaurantId}:${weekStart}` &&
      restaurantId
    ) {
      provisionKey.current = `${restaurantId}:${weekStart}`;
      provision.mutate({ week_start: weekStart, restaurant_id: restaurantId });
    }
    // provision.mutate is stable; omitting from deps intentionally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedulesStatus, scheduleId, weekStart, restaurantId, provision.isPending]);

  const resolvedId = scheduleId ?? provision.data?.id;
  const detailQuery = useScheduleDetail(resolvedId);

  const isLoading =
    schedulesStatus === 'pending' ||
    provision.isPending ||
    (!!resolvedId && detailQuery.status === 'pending');

  return {
    scheduleId: resolvedId,
    schedule: detailQuery.data,
    isLoading,
    error: provision.isError ? provision.error : detailQuery.error,
    refetch: detailQuery.refetch,
  };
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
