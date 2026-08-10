import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { employeesApi } from '@/lib/api/employees';
import { tickOnboardStep } from '@/lib/utils/onboarding';
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '@/lib/types/employee';

export function useEmployees(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ['employees', restaurantId],
    queryFn: () => employeesApi.list(restaurantId!),
    enabled: !!restaurantId,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employee: CreateEmployeeRequest) => employeesApi.create(employee),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees', variables.restaurant_id] });
      toast.success('Employee added');
      tickOnboardStep('staff');
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      toast.error(error.response?.data?.detail ?? 'Failed to add employee');
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateEmployeeRequest }) =>
      employeesApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee updated');
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      toast.error(error.response?.data?.detail ?? 'Failed to update employee');
    },
  });
}

/**
 * Hard-delete an employee. The backend can return 409 when the employee has
 * shift history; callers should catch that specifically and offer to
 * deactivate instead.
 *
 * Toast handling: on 409 the mutation intentionally does NOT toast — the
 * caller shows a scoped modal explaining the situation, so a global toast
 * would double up. Every other error still toasts.
 */
export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeesApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['employees'] });

      const previousData = queryClient.getQueriesData<Employee[]>({ queryKey: ['employees'] });

      queryClient.setQueriesData<Employee[]>(
        { queryKey: ['employees'] },
        (old) => old?.filter((e) => e.id !== id),
      );

      return { previousData };
    },
    onSuccess: () => {
      toast.success('Employee permanently deleted');
    },
    onError: (error: AxiosError<{ detail?: string }>, _, context) => {
      context?.previousData.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      const status = error.response?.status;
      // 409 = has shift history → caller renders the "disable instead" flow.
      if (status !== 409) {
        toast.error(
          error.response?.data?.detail ?? 'Failed to delete employee',
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

/**
 * Soft-delete (deactivate). Optimistically flips `is_active` to false so
 * the roster updates instantly; on error we roll back the row.
 */
export function useDeactivateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeesApi.deactivate(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['employees'] });
      const previousData = queryClient.getQueriesData<Employee[]>({
        queryKey: ['employees'],
      });
      queryClient.setQueriesData<Employee[]>(
        { queryKey: ['employees'] },
        (old) =>
          old?.map((e) => (e.id === id ? { ...e, is_active: false } : e)),
      );
      return { previousData };
    },
    onSuccess: () => {
      toast.success('Employee disabled');
    },
    onError: (error: AxiosError<{ detail?: string }>, _, context) => {
      context?.previousData.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error(
        error.response?.data?.detail ?? 'Failed to disable employee',
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
