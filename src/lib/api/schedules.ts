import axios from 'axios';
import { apiClient } from './client';
import type {
  Schedule,
  Shift,
  CreateScheduleRequest,
  GenerateScheduleRequest,
  GenerateScheduleResponse,
  ShareLinkResponse,
  PublicScheduleResponse,
} from '@/lib/types/schedule';

const API_BASE =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? 'http://localhost:8000/api/v1' : '');

// Unauthenticated client for public share-link routes. Doesn't send the
// Supabase Bearer token and skips the 401 → /login interceptor.
const publicClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

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

  generate: async (payload: GenerateScheduleRequest): Promise<GenerateScheduleResponse> => {
    const { data } = await apiClient.post('/schedules/generate', payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/schedules/${id}`);
  },

  // ── Share links ──
  //
  // POST rotates the token — calling it a second time issues a fresh
  // 7-day link and invalidates the previous one.
  generateShareLink: async (scheduleId: string): Promise<ShareLinkResponse> => {
    const { data } = await apiClient.post(
      `/schedules/${scheduleId}/share`,
    );
    return data;
  },

  // DELETE disables sharing; the token itself is not removed until the
  // next POST rotates it. Returns 204.
  revokeShareLink: async (scheduleId: string): Promise<void> => {
    await apiClient.delete(`/schedules/${scheduleId}/share`);
  },

  // Unauthenticated read of a shared schedule by token.
  // 404 covers unknown / disabled / expired — treat them all the same.
  fetchPublicSchedule: async (
    token: string,
  ): Promise<PublicScheduleResponse> => {
    const { data } = await publicClient.get(`/public/schedules/${token}`);
    return data;
  },

  // ── iCal export ──
  //
  // Fetches the .ics for a schedule and triggers a browser download. The
  // endpoint accepts either the Bearer header (manager view — apiClient
  // adds it automatically) or a share_token query param (public view).
  //
  // Fetching as a blob rather than pointing an <a href> at the URL is the
  // reliable path: it lets us send the Authorization header (which a plain
  // link cannot) and it survives if the backend later changes the download
  // filename or content-type nuances.
  downloadICal: async (
    scheduleId: string,
    opts?: { publicToken?: string; filename?: string },
  ): Promise<void> => {
    const path = opts?.publicToken
      ? `/schedules/${scheduleId}/export/ical?token=${encodeURIComponent(opts.publicToken)}`
      : `/schedules/${scheduleId}/export/ical`;
    const client = opts?.publicToken ? publicClient : apiClient;
    const response = await client.get(path, { responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const filename = opts?.filename ?? `schedule_${scheduleId}.ics`;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Give the browser a beat to start the download before revoking.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};
