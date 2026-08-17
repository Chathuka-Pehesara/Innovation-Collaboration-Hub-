'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/authStore';

export default function AuthInitializer() {
  useEffect(() => {
    (async () => {
      try {
        await useAuthStore.getState().initializeSession();
      } catch (e) {
        // swallow to avoid unhandled promise rejections; initAuth handles redirect on 401/403
      }
    })();
  }, []);

  return null;
}
