import axios from 'axios';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const API_BASE =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? 'http://localhost:8000/' : (() => { throw new Error('VITE_API_URL is not set') })());

export const apiClient = axios.create({
  baseURL: API_BASE,
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
      // scope: 'local' clears the session from storage without a network request,
      // so it works even when the token is already invalid or the network is degraded.
      await supabase.auth.signOut({ scope: 'local' });
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
