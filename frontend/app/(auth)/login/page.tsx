/**
 * @file        login/page.tsx
 * @owner       IT Team
 * @description Login view — renders LoginForm, handles session redirect.
 * @depends     components/forms/LoginForm.tsx
 */

'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { LoginForm } from '@/components/forms/LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#0F1117] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">Innovation Hub</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to continue building</p>
        </div>

        {/* Card */}
        <div className="bg-[#1A1D27] border border-white/10 rounded-2xl p-8 shadow-xl">
          <Suspense fallback={<div className="text-gray-400 text-sm text-center py-4">Loading form...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        <div className="flex justify-between text-sm mt-6 px-1">
          <p className="text-gray-500">
            No account?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign up
            </Link>
          </p>
          <Link href="/forgot-password" className="text-gray-500 hover:text-gray-300 transition-colors">
            Forgot password?
          </Link>
        </div>
      </div>
    </main>
  );
}
