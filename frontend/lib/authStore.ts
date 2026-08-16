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
<<<<<<< ours
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
=======
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => {
    set({ user, token });
    if (typeof window !== 'undefined') {
      if (token && user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userId', user.id);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
      }
    }
  },
  logout: () => {
    set({ user: null, token: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
>>>>>>> theirs
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
    }
  },
<<<<<<< ours

  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
=======
  initAuth: async () => {
    if (typeof window === 'undefined') return;

    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`;

    let token = null;
    let user = null;

    try {
      token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      user = userStr ? JSON.parse(userStr) : null;

      if (!token) return;

      // Validate token with backend to avoid stale/expired tokens causing unhandled promise rejections
      await axios.get(`${API_URL}/auth/me`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // If validation succeeds, set auth state
      set({ token, user });
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        // Token invalid or expired: clear local storage and reset state, then redirect to login
        set({ user: null, token: null });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        try {
          window.location.href = '/login?error=session_expired';
        } catch {}
      } else {
        // Non-auth related error: keep current stored values but don't crash
        try {
          if (token && user) set({ token, user });
        } catch {}
      }
    }
>>>>>>> theirs
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
