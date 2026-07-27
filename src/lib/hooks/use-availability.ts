import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { availabilityApi } from '@/lib/api/availability';
import type { AvailabilityWindow, CreateAvailabilityRequest } from '@/lib/types/availability';

export function useAvailability(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['availability', employeeId],
    queryFn: () => availabilityApi.list(employeeId!),
    enabled: !!employeeId,
  });
}

export function useAddAvailability(employeeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAvailabilityRequest) =>
      availabilityApi.create(employeeId, payload),
    onSuccess: (created) => {
      // Append the new window to the cache directly so the UI updates
      // without a full refetch round-trip.
      queryClient.setQueryData<AvailabilityWindow[]>(
        ['availability', employeeId],
        (old) => {
          const list = old ?? [];
          return [...list, created].sort(
            (a, b) =>
              a.day_of_week - b.day_of_week ||
              a.start_time.localeCompare(b.start_time),
          );
        },
      );
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      // 409 = duplicate window — surfaced inline by the component, not as a toast.
      if (error.response?.status !== 409) {
        toast.error(error.response?.data?.detail ?? 'Failed to add availability');
      }
    },
  });
}

export function useDeleteAvailability(employeeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (availabilityId: string) =>
      availabilityApi.delete(employeeId, availabilityId),
    onMutate: async (availabilityId) => {
      await queryClient.cancelQueries({ queryKey: ['availability', employeeId] });
      const previous = queryClient.getQueryData<AvailabilityWindow[]>([
        'availability',
        employeeId,
      ]);
      queryClient.setQueryData<AvailabilityWindow[]>(
        ['availability', employeeId],
        (old) => old?.filter((w) => w.id !== availabilityId),
      );
      return { previous };
    },
    onError: (error: AxiosError<{ detail?: string }>, _, context) => {
      queryClient.setQueryData(['availability', employeeId], context?.previous);
      toast.error(error.response?.data?.detail ?? 'Failed to remove availability');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', employeeId] });
    },
  });
}
