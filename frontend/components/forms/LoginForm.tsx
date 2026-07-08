'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';

interface FieldErrors {
  email?: string;
  password?: string;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get('verified') === 'true';
  const errorParam = searchParams.get('error');
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    if (!email) errors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
    if (!password) errors.password = 'Password is required.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setVerificationUrl(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.user, data.accessToken);
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      const respData = err.response?.data;
      if (respData?.code === 'EMAIL_NOT_VERIFIED') {
        setServerError('Please verify your email address before signing in.');
        if (respData.verificationUrl) {
          setVerificationUrl(respData.verificationUrl);
        }
      } else {
        setServerError(msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Staggered entry animation containers
  const formVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', stiffness: 180, damping: 20 }
    }
  };

  return (
    <motion.form 
      variants={formVariants}
      initial="hidden"
      animate="show"
      onSubmit={handleSubmit} 
      noValidate 
      className="space-y-4"
    >
      {/* Verification alerts */}
      {verified && (
        <motion.div variants={itemVariants} className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
          <svg className="w-4 h-4 text-green-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-green-800 text-xs font-semibold">Email verified successfully! You can now log in.</p>
        </motion.div>
      )}

      {errorParam === 'invalid_verification_token' && (
        <motion.div variants={itemVariants} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <svg className="w-4 h-4 text-red-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-800 text-xs font-semibold">The verification link is invalid or has expired.</p>
        </motion.div>
      )}

      {/* Email */}
      <motion.div variants={itemVariants}>
        <label htmlFor="email" className="block text-sm font-semibold text-amber-950 mb-1">
          Email address
        </label>
        <div className="relative">
          <motion.input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
            placeholder="you@opms.edu"
            whileFocus={{ 
              scale: 1.01,
              boxShadow: "0 10px 20px -5px rgba(112, 34, 36, 0.08)",
            }}
            transition={{ type: 'spring', stiffness: 250, damping: 20 }}
            className={`w-full px-4 py-2.5 bg-white border rounded-xl text-amber-950 placeholder-amber-900/35 shadow-sm
                        focus:outline-none focus:ring-2 focus:ring-[#702224]/15 focus:border-[#702224] text-sm transition-all duration-200
                        ${fieldErrors.email ? 'border-red-500' : 'border-amber-900/15'}`}
          />
        </div>
        {fieldErrors.email && <p className="text-red-600 text-xs mt-1 font-medium">{fieldErrors.email}</p>}
      </motion.div>

      {/* Password */}
      <motion.div variants={itemVariants}>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="password" className="block text-sm font-semibold text-amber-950">
            Password
          </label>
          <Link href="/forgot-password" className="text-xs text-amber-900 hover:text-[#702224] transition-colors font-semibold">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <motion.input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
            placeholder="••••••••"
            whileFocus={{ 
              scale: 1.01,
              boxShadow: "0 10px 20px -5px rgba(112, 34, 36, 0.08)",
            }}
            transition={{ type: 'spring', stiffness: 250, damping: 20 }}
            className={`w-full px-4 py-2.5 pr-10 bg-white border rounded-xl text-amber-950 placeholder-amber-900/35 shadow-sm
                        focus:outline-none focus:ring-2 focus:ring-[#702224]/15 focus:border-[#702224] text-sm transition-all duration-200
                        ${fieldErrors.password ? 'border-red-500' : 'border-amber-900/15'}`}
          />

          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-900/40 hover:text-amber-950 transition-colors z-10"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {fieldErrors.password && <p className="text-red-600 text-xs mt-1 font-medium">{fieldErrors.password}</p>}
      </motion.div>

      {/* Server error */}
      {serverError && (
        <motion.div variants={itemVariants} className="flex flex-col gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-red-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800 text-xs font-semibold">{serverError}</p>
          </div>
          {verificationUrl && (
            <div className="pl-6">
              <a
                href={verificationUrl}
                className="inline-block text-xs font-bold bg-[#702224] hover:bg-[#5C1A1C] text-white px-3 py-1.5 rounded-lg transition-colors shadow-md"
              >
                Verify Account Now (Dev Option)
              </a>
            </div>
          )}
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.button
        variants={itemVariants}
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-2.5 px-4 bg-[#702224] hover:bg-[#5C1A1C] disabled:opacity-50 disabled:cursor-not-allowed
                   text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-red-950/10 flex items-center justify-center gap-2 active:scale-[0.97]"
      >
        {loading && (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {loading ? 'Signing in...' : 'Login'}
      </motion.button>
    </motion.form>
  );
}

export default LoginForm;
