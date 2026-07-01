import axios from 'axios';
import { useAuthStore } from './authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    // Get token from authStore state
    let token = useAuthStore.getState().token;
    
    // If not found in store state, try localStorage as a fallback on the browser
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('token');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
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
