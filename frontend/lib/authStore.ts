import { create } from 'zustand';
import axios from 'axios';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  specialization?: string;
  avatarUrl?: string;
  bio?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User | null, token: string | null) => void;
  logout: () => void;
  initializeSession: () => Promise<void>;
}

const getInitialAuth = () => {
  if (typeof window === 'undefined') return { user: null };
  try {
    const userStr = localStorage.getItem('user');
    return {
      user: userStr ? JSON.parse(userStr) : null,
    };
  } catch (e) {
    return { user: null };
  }
};

const initialAuth = getInitialAuth();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialAuth.user,
  token: null, // Token strictly maintained in-memory only (Rule 20 pass)

  setAuth: (user, token) => {
    set({ user, token });
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userId', user.id);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
    }
  },

  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
  },

  initializeSession: async () => {
    // Called once on high-level app wrappers to secure token on reload silently bridging via Secure HttpOnly cookie
    if (typeof window === 'undefined') return;
    try {
      const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`;
      const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
      get().setAuth(get().user, data.accessToken);
    } catch (e) {
      // If silent refresh cookie expired, flush user shell rendering state.
      get().logout();
    }
  }
}));
