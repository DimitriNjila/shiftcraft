export interface AvailabilityWindow {
  id: string;
  employee_id: string;
  restaurant_id: string;
  day_of_week: number; // 1 = Monday … 7 = Sunday
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  created_at: string;
  updated_at: string;
}

export interface CreateAvailabilityRequest {
  day_of_week: number;
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
}
