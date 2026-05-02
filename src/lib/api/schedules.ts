import { apiClient } from './client';
import type { Schedule, Shift, CreateScheduleRequest } from '@/lib/types/schedule';

function normalizeShift(shift: Shift): Shift {
  return {
    ...shift,
    shift_date: shift.shift_date.slice(0, 10),
    employee_id: shift.employee_id ?? shift.employee?.id ?? '',
  };
}

function normalizeSchedule(schedule: Schedule): Schedule {
  return {
    ...schedule,
    week_start: schedule.week_start.slice(0, 10),
    shifts: schedule.shifts?.map(normalizeShift),
  };
}

export const schedulesApi = {
  list: async (restaurantId: string): Promise<Schedule[]> => {
    const { data } = await apiClient.get('/schedules', {
      params: { restaurant_id: restaurantId },
    });
    return data.map(normalizeSchedule);
  },

  create: async (payload: CreateScheduleRequest): Promise<Schedule> => {
    const { data } = await apiClient.post('/schedules', payload);
    return normalizeSchedule(data);
  },

  getById: async (id: string): Promise<Schedule> => {
    const { data } = await apiClient.get(`/schedules/${id}`);
return normalizeSchedule(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/schedules/${id}`);
  },
};
