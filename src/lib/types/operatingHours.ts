export interface OperatingHour {
  id: string;
  restaurant_id: string;
  day_of_week: number; // 1–7
  is_closed: boolean;
  open_time: string | null;
  close_time: string | null;
}

export interface OperatingHourInput {
  day_of_week: number;
  is_closed: boolean;
  open_time: string | null;
  close_time: string | null;
}

export interface BatchOperatingHoursRequest {
  restaurant_id: string;
  hours: OperatingHourInput[];
}
