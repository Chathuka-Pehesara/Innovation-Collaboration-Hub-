'use client';

import Link from 'next/link';
import { RegisterForm } from '@/components/forms/RegisterForm';
import Logo from '@/components/ui/Logo';

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md py-12 px-4 fade-in-up auth-page">
      {/* Logo / Brand */}
      <div className="mb-6 text-center flex flex-col items-center">
        <Link href="/" className="inline-flex items-center mb-3 hover:opacity-90 transition-opacity">
          <Logo size={112} />
        </Link>
        <h1 className="text-2xl font-bold text-amber-950 font-display">Create Account</h1>
        <p className="text-amber-900/70 text-sm mt-0.5">Join students across every specialization</p>
      </div>

      {/* Frosted Glass Autumn Theme Card */}
      <div className="bg-white/35 border border-white/45 rounded-[2rem] p-8 shadow-2xl shadow-orange-950/5 backdrop-blur-xl">
        <RegisterForm />
      </div>

      {/* Footer Link */}
      <p className="text-center text-sm text-amber-900/70 mt-5 font-medium">
        Already have an account?{' '}
        <Link href="/login" className="text-red-800 hover:text-red-950 hover:underline transition-all">
          Sign in
        </Link>
      </p>
    </div>
  );
}
