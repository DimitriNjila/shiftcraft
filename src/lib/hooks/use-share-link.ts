import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { schedulesApi } from '@/lib/api/schedules';

/**
 * Download the iCal (.ics) file for a schedule as a browser download.
 * Pass `publicToken` when calling from the /shared/:token public view.
 */
export function useDownloadICal() {
  return useMutation({
    mutationFn: (params: {
      scheduleId: string;
      publicToken?: string;
      filename?: string;
    }) =>
      schedulesApi.downloadICal(params.scheduleId, {
        publicToken: params.publicToken,
        filename: params.filename,
      }),
    onSuccess: () => toast.success('Calendar file downloaded'),
    onError: (error: AxiosError<{ detail?: string }>) => {
      toast.error(
        error.response?.data?.detail ?? 'Failed to export calendar',
      );
    },
  });
}

/**
 * Generate (or rotate) a 7-day shareable link for a schedule.
 * Each call issues a fresh token and invalidates any previous one.
 */
export function useGenerateShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleId: string) =>
      schedulesApi.generateShareLink(scheduleId),
    onSuccess: (_, scheduleId) => {
      queryClient.invalidateQueries({
        queryKey: ['share-link', scheduleId],
      });
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      toast.error(
        error.response?.data?.detail ?? 'Failed to generate share link',
      );
    },
  });
}

/**
 * Turn off sharing for a schedule. The token stops working immediately;
 * calling generateShareLink again re-enables sharing with a fresh token.
 */
export function useRevokeShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleId: string) =>
      schedulesApi.revokeShareLink(scheduleId),
    onSuccess: (_, scheduleId) => {
      queryClient.invalidateQueries({
        queryKey: ['share-link', scheduleId],
      });
      toast.success('Share link revoked');
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      toast.error(
        error.response?.data?.detail ?? 'Failed to revoke share link',
      );
    },
  });
}

/**
 * Unauthenticated read of a shared schedule by token. Used by the
 * /shared/:token public route.
 *
 * Never retries — a 404 is authoritative (unknown / disabled / expired) and
 * we shouldn't hammer the endpoint from a public page.
 */
export function usePublicSchedule(token: string | undefined) {
  return useQuery({
    queryKey: ['public-schedule', token],
    queryFn: () => schedulesApi.fetchPublicSchedule(token!),
    enabled: !!token,
    retry: false,
    staleTime: 60_000,
  });
}
