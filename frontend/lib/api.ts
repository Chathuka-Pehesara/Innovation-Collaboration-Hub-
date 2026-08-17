import axios from 'axios';
import { useAuthStore } from './authStore';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    // Get token from authStore exclusively (No localStorage fallback)
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          // Try to get a new token using the httpOnly refresh cookie
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
          const newToken = data.accessToken;

          // Update the auth store and local storage
          useAuthStore.getState().setAuth(useAuthStore.getState().user, newToken);

          isRefreshing = false;
          onRefreshed(newToken);

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          refreshSubscribers = [];
          
          // If refresh fails, log the user out
          useAuthStore.getState().logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/login?error=session_expired';
          }
          return Promise.reject(refreshError);
        }
      } else {
        // If already refreshing, wait for the new token
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }
    }

    return Promise.reject(error);
  }
);

export const getCategories = async () => {
  try {
    const { data } = await api.get('/projects/categories');
    return data.categories || data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};
