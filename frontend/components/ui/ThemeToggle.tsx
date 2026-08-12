'use client';

import { useEffect } from 'react';

export default function ThemeToggle() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark');
      localStorage.removeItem('theme');
    }
  }, []);

  return null;
}
