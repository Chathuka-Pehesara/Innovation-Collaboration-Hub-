'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/authStore';

export default function AuthInitializer() {
  useEffect(() => {
    useAuthStore.getState().initAuth();
  }, []);

  return null;
}
