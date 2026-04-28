import axios from 'axios';
import { supabase } from '@/lib/supabase';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Supabase JWT to every request
apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Surface API error messages clearly
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Let the auth context handle sign-out on 401
      supabase.auth.signOut();
    }
    return Promise.reject(error);
  }
);
