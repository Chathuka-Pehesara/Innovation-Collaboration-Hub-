'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' || 'dark';
    setTheme(saved);
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="p-2.5 rounded-xl bg-white/70 dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-amber-900/10 dark:border-white/10 text-sm shadow-sm transition-all flex items-center justify-center cursor-pointer select-none"
      aria-label="Toggle Theme"
      title="Toggle Theme"
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </motion.button>
  );
}
