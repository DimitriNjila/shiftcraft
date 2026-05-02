import axios from 'axios';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

let signingOut = false;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !signingOut) {
      signingOut = true;
      toast.error('Your session has expired. Please sign in again.');
      await supabase.auth.signOut();
      signingOut = false;
    }
    return Promise.reject(error);
  }
);
