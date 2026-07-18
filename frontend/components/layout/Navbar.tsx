'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/5 bg-white/50 backdrop-blur-2xl px-6 py-4 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
      {/* Search Bar / Welcome Indicator */}
      <div className="flex items-center gap-4">
        {user ? (
          <h2 className="text-sm md:text-base font-medium text-gray-300">
            Welcome back, <span className="text-white font-bold">{user.name}</span>
            {user.specialization && (
              <span className="ml-3 text-xs bg-gradient-to-r from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20 text-[var(--accent-secondary)] border border-[var(--accent-secondary)]/30 px-3 py-1 rounded-full shadow-[0_0_10px_var(--accent-secondary-glow)]">
                {user.specialization}
              </span>
            )}
          </h2>
        ) : (
          <h2 className="text-sm md:text-base font-medium text-gray-600">Welcome to Innovation Hub</h2>
        )}
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">

        {user ? (
          <div className="flex items-center gap-3">
            <Link href={`/profile/${user.id}`} className="flex items-center gap-2 hover:scale-105 transition-transform duration-300 ring-2 ring-[var(--accent-primary)]/50 ring-offset-2 ring-offset-white rounded-full shadow-[0_0_15px_var(--accent-primary-glow)]">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center font-bold text-sm text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-gray-600 hover:text-gray-900 bg-black/5 hover:bg-black/10 px-4 py-2 rounded-xl border border-black/5 transition-all duration-300 active:scale-[0.97] shadow-sm"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary py-1.5 px-4 text-xs">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
