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
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-black/20 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
      {/* Search Bar / Welcome Indicator */}
      <div className="flex items-center gap-4">
        {user ? (
          <h2 className="text-sm md:text-base font-medium text-gray-300">
            Welcome back, <span className="text-white font-bold">{user.name}</span>
            {user.specialization && (
              <span className="ml-2 text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                {user.specialization}
              </span>
            )}
          </h2>
        ) : (
          <h2 className="text-sm md:text-base font-medium text-gray-400">Welcome to Innovation Hub</h2>
        )}
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">

        {user ? (
          <div className="flex items-center gap-3">
            <Link href={`/profile/${user.id}`} className="flex items-center gap-2 hover:opacity-85 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-all active:scale-[0.97]"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
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
