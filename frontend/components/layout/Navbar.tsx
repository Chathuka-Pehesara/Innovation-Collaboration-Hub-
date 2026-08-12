'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);

  // Add scroll listener for dynamic navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header 
      className={`sticky top-0 z-40 w-full transition-all duration-500 border-b ${
        scrolled 
          ? 'bg-[var(--panel-bg)]/80 backdrop-blur-3xl border-[var(--border-color)] shadow-[0_10px_40px_rgba(0,0,0,0.15)] py-3' 
          : 'bg-transparent border-transparent py-5'
      } px-6 flex items-center justify-between`}
    >
      {/* Decorative top edge highlight */}
      <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent transition-opacity duration-500 ${scrolled ? 'opacity-50' : 'opacity-0'}`} />

      {/* Search Bar / Welcome Indicator */}
      <div className="flex items-center gap-4 relative z-10">
        {user ? (
          <h2 className="text-sm md:text-base font-medium text-[var(--text-secondary)]">
            Welcome back, <span className="text-[var(--text-primary)] font-bold tracking-wide drop-shadow-sm">{user.name}</span>
            {user.specialization && (
              <span className="ml-3 text-xs bg-gradient-to-r from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 text-[var(--accent-secondary)] border border-[var(--accent-secondary)]/20 px-3 py-1.5 rounded-full shadow-[0_0_15px_var(--accent-secondary-glow)] tracking-wider uppercase font-bold relative overflow-hidden group">
                <span className="absolute inset-0 bg-[var(--accent-secondary)]/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {user.specialization}
              </span>
            )}
          </h2>
        ) : (
          <h2 className="text-sm md:text-base font-medium text-[var(--text-secondary)] tracking-wide">
            Welcome to <span className="text-[var(--text-primary)] font-bold">Innovation Hub</span>
          </h2>
        )}
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-5 relative z-10">
        {user ? (
          <div className="flex items-center gap-4">
            <Link 
              href={`/profile/${user.id}`} 
              className="relative flex items-center gap-2 group transition-all duration-300"
            >
              {/* Avatar Halo */}
              <div className="absolute inset-[-4px] bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full opacity-50 blur-[8px] group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Avatar */}
              <div className="relative w-10 h-10 rounded-full bg-[var(--surface-elevated)] border-2 border-[var(--border-color)] group-hover:border-[var(--accent-primary)] flex items-center justify-center font-bold text-sm text-[var(--text-primary)] shadow-lg transition-colors overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/20 to-transparent" />
                <span className="relative z-10">{user.name.charAt(0).toUpperCase()}</span>
              </div>
            </Link>
            
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-[var(--text-secondary)] hover:text-white bg-[var(--surface-elevated)] hover:bg-[var(--accent-primary)] px-5 py-2.5 rounded-xl border border-[var(--border-color)] hover:border-transparent transition-all duration-300 active:scale-[0.96] shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_var(--accent-primary-glow)] uppercase tracking-wider overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700" />
              <span className="relative z-10">Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors hover:drop-shadow-[0_0_8px_var(--text-primary)]"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="btn-primary py-2 px-5 text-sm uppercase tracking-wider"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
