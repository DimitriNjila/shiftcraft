export interface TimeOff {
  id: string;
  employee_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  reason: string | null;
  created_at: string;
}

export interface CreateTimeOffRequest {
  start_date: string;
  end_date: string;
  reason?: string;
}
