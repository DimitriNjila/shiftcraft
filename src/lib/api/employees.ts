import { apiClient } from './client';
import type {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from '@/lib/types/employee';

export const employeesApi = {
  list: async (restaurantId: string): Promise<Employee[]> => {
    const { data } = await apiClient.get<Employee[]>('/employees', {
      params: { restaurant_id: restaurantId },
    });
    return data;
  },

  create: async (employee: CreateEmployeeRequest): Promise<Employee> => {
    const { data } = await apiClient.post<Employee>('/employees', employee);
    return data;
  },

  update: async (id: string, updates: UpdateEmployeeRequest): Promise<Employee> => {
    const { data } = await apiClient.patch<Employee>(`/employees/${id}`, updates);
    return data;
  },

  /**
   * Permanent delete. Backend now enforces referential integrity:
   *   200 — row removed (+ availability windows cleaned up)
   *   409 — employee has shift history; caller should offer "disable" instead
   *   404 — no such employee
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/employees/${id}`);
  },

  /**
   * Soft delete — flips `is_active` to false. Reversible via `update`
   * with `{ is_active: true }`. This is the safe default for any
   * employee who's ever been scheduled.
   */
  deactivate: async (id: string): Promise<Employee> => {
    const { data } = await apiClient.post<Employee>(
      `/employees/${id}/deactivate`,
    );
    return data;
  },
};
