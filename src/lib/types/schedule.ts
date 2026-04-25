export interface Shift {
  id: string;
  schedule_id: string;
  employee_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  notes: string;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    name: string;
    role: string;
  };
}

export interface Schedule {
  id: string;
  week_start: string;
  restaurant_id: string;
  total_shifts: number;
  total_hours: number;
  shifts?: Shift[];
  created_at?: string;
}

export interface CreateScheduleRequest {
  week_start: string;
  restaurant_id: string;
}

export interface GenerateScheduleRequest {
  week_start: string;
  restaurant_id: string;
  shift_templates?: unknown[];
}

export interface CreateShiftRequest {
  schedule_id: string;
  employee_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

export interface UpdateShiftRequest {
  employee_id?: string;
  shift_date?: string;
  start_time?: string;
  end_time?: string;
  notes?: string;
}
