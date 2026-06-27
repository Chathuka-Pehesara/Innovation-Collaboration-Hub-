/**
 * @file        register/page.tsx
 * @owner       IT Team
 * @description Registration view — renders RegisterForm, handles success redirect.
 * @depends     components/forms/RegisterForm.tsx
 */

'use client';

import Link from 'next/link';
import { RegisterForm } from '@/components/forms/RegisterForm';

export default function RegisterPage() {
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
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-gray-400 text-sm mt-1">Join students across every specialization</p>
        </div>

        {/* Card */}
        <div className="bg-[#1A1D27] border border-white/10 rounded-2xl p-8 shadow-xl">
          <RegisterForm />
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
