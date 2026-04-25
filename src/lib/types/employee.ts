export interface Employee {
  id: string;
  name: string;
  role: 'Server' | 'Cook' | 'Host' | 'Manager';
  is_active: boolean;
  restaurant_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeRequest {
  name: string;
  role: string;
  restaurant_id: string;
  is_active?: boolean;
}

export interface UpdateEmployeeRequest {
  name?: string;
  role?: string;
  is_active?: boolean;
}
