'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { LoginForm } from '@/components/forms/LoginForm';
import Logo from '@/components/ui/Logo';

export default function LoginPage() {
  return (
    <div className="w-full max-w-md py-12 px-4 fade-in-up auth-page">
      {/* Logo / Brand */}
      <div className="mb-6 text-center flex flex-col items-center">
        <Link href="/" className="inline-flex items-center mb-3 hover:opacity-90 transition-opacity">
          <Logo size={112} />
        </Link>
        <h1 className="text-2xl font-bold text-amber-950 font-display">Sign In</h1>
        <p className="text-amber-900/70 text-sm mt-0.5">Sign in to continue building</p>
      </div>

      {/* Frosted Glass Autumn Theme Card */}
      <div className="bg-white/35 border border-white/45 rounded-[2rem] p-8 shadow-2xl shadow-orange-950/5 backdrop-blur-xl">
        <Suspense fallback={<div className="text-amber-900/60 text-sm text-center py-4">Loading form...</div>}>
          <LoginForm />
        </Suspense>
      </div>

      {/* Footer Links */}
      <div className="flex justify-between text-sm mt-5 px-2 font-medium">
        <p className="text-amber-900/70">
          No account?{' '}
          <Link href="/register" className="text-red-800 hover:text-red-950 hover:underline transition-all">
            Sign up
          </Link>
        </p>
        <Link href="/forgot-password" className="text-amber-900/70 hover:text-amber-950 hover:underline transition-all">
          Forgot password?
        </Link>
      </div>
    </div>
  );
}
