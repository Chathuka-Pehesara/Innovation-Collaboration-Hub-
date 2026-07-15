'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

const SPECIALIZATIONS = ['IT', 'Cybersecurity', 'AI', 'Networking'] as const;
type Spec = (typeof SPECIALIZATIONS)[number];

const SPEC_LABELS: Record<Spec, { label: string; icon: string }> = {
  IT: { label: 'IT / Software', icon: '💻' },
  Cybersecurity: { label: 'Cybersecurity', icon: '🔒' },
  AI: { label: 'AI / Data Science', icon: '🤖' },
  Networking: { label: 'Networking', icon: '🌐' },
};

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  specialization?: string;
}

const getPasswordStrength = (p: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  const levels = [
    { label: '', color: '' },
    { label: 'Weak', color: 'bg-red-500' },
    { label: 'Fair', color: 'bg-yellow-500' },
    { label: 'Good', color: 'bg-blue-500' },
    { label: 'Strong', color: 'bg-green-500' },
  ];
  return { score, ...levels[score] };
};

export function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialization, setSpecialization] = useState<Spec | ''>('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);

  const strength = password ? getPasswordStrength(password) : null;

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    if (!name.trim() || name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';
    if (!email) errors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
    if (!specialization) errors.specialization = 'Please select your specialization.';
    if (!password) errors.password = 'Password is required.';
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters.';
    else if (!/[A-Z]/.test(password)) errors.password = 'Include at least one uppercase letter.';
    else if (!/[0-9]/.test(password)) errors.password = 'Include at least one number.';
    else if (!/[^A-Za-z0-9]/.test(password)) errors.password = 'Include at least one special character.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearError = (field: keyof FieldErrors) =>
    setFieldErrors((p) => ({ ...p, [field]: undefined }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password, specialization });
      if (response.data?.verificationUrl) {
        setVerificationUrl(response.data.verificationUrl);
      }
      setSuccess(true);
    } catch (err: any) {
      const respData = err.response?.data;
      if (respData?.errors && Array.isArray(respData.errors) && respData.errors.length > 0) {
        setServerError(respData.errors.map((e: any) => e.message).join(' '));
      } else {
        setServerError(respData?.message || 'Registration failed. Please try again.');
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
        staggerChildren: 0.07,
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

  if (success) {
    return (
      <div className="text-center py-2 space-y-4">
        <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-200 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-[#702224]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-amber-950 font-bold mb-1">Check your inbox</h2>
          <p className="text-amber-900/80 text-sm mb-2">
            We sent a verification link to <span className="text-amber-950 font-bold">{email}</span>.
          </p>
          <p className="text-amber-900/70 text-sm">
            Click it to activate your account.
          </p>
        </div>

        {verificationUrl && (
          <div className="p-4 bg-white/50 border border-amber-900/10 rounded-2xl text-left">
            <p className="text-xs text-amber-950 font-bold uppercase tracking-wider mb-1">Development / Sandbox helper</p>
            <p className="text-xs text-amber-900/70 mb-3">Since real emails are not sent in this environment, you can use the button below to verify this account directly:</p>
            <a 
              href={verificationUrl}
              className="inline-block w-full text-center text-xs font-semibold bg-[#702224] hover:bg-[#5C1A1C] text-white px-3 py-2.5 rounded-xl transition-all shadow-md shadow-red-950/15"
            >
              Verify Account Now
            </a>
          </div>
        )}

        <div>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-2.5 bg-white hover:bg-amber-50/50 text-amber-950 text-sm font-semibold rounded-xl border border-amber-900/15 shadow-sm transition-all"
          >
            Go to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.form 
      variants={formVariants}
      initial="hidden"
      animate="show"
      onSubmit={handleSubmit} 
      noValidate 
      className="space-y-4"
    >
      {/* Name */}
      <motion.div variants={itemVariants}>
        <label htmlFor="name" className="block text-sm font-semibold text-amber-950 mb-1">
          Full name
        </label>
        <motion.input
          id="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => { setName(e.target.value); clearError('name'); }}
          placeholder="Your full name"
          whileFocus={{ 
            scale: 1.01,
            boxShadow: "0 10px 20px -5px rgba(112, 34, 36, 0.08)",
          }}
          transition={{ type: 'spring', stiffness: 250, damping: 20 }}
          className={`w-full px-4 py-2.5 bg-white border rounded-xl text-amber-950 placeholder-amber-900/35 shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-[#702224]/15 focus:border-[#702224] text-sm transition-all duration-200
                      ${fieldErrors.name ? 'border-red-500' : 'border-amber-900/15'}`}
        />
        {fieldErrors.name && <p className="text-red-600 text-xs mt-1 font-medium">{fieldErrors.name}</p>}
      </motion.div>

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
            onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
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

      {/* Specialization */}
      <motion.div variants={itemVariants}>
        <label className="block text-sm font-semibold text-amber-950 mb-1.5">
          Specialization
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SPECIALIZATIONS.map((spec) => (
            <button
              key={spec}
              type="button"
              onClick={() => { setSpecialization(spec); clearError('specialization'); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all
                          ${specialization === spec
                            ? 'bg-[#702224]/15 border-[#702224] text-[#702224]'
                            : 'bg-white border-amber-900/10 text-amber-900/70 hover:border-amber-900/30'
                          }`}
            >
              <span>{SPEC_LABELS[spec].icon}</span>
              <span>{SPEC_LABELS[spec].label}</span>
            </button>
          ))}
        </div>
        {fieldErrors.specialization && (
          <p className="text-red-600 text-xs mt-1 font-medium">{fieldErrors.specialization}</p>
        )}
      </motion.div>

      {/* Password */}
      <motion.div variants={itemVariants}>
        <label htmlFor="password" className="block text-sm font-semibold text-amber-950 mb-1">
          Password
        </label>
        <div className="relative">
          <motion.input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
            placeholder="Min 8 chars, uppercase, number, symbol"
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

        {/* Strength meter */}
        {strength && strength.score > 0 && (
          <div className="mt-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    i <= strength.score ? strength.color : 'bg-amber-900/10'
                  }`}
                />
              ))}
            </div>
            <p className="text-[10px] text-amber-900/60 mt-0.5 font-medium">{strength.label} password</p>
          </div>
        )}
        {fieldErrors.password && <p className="text-red-600 text-xs mt-1 font-medium">{fieldErrors.password}</p>}
      </motion.div>

      {/* Server error */}
      {serverError && (
        <motion.div variants={itemVariants} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <svg className="w-4 h-4 text-red-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-800 text-xs font-semibold">{serverError}</p>
        </motion.div>
      )}

      {/* Submit button */}
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
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {loading ? 'Creating account...' : 'Create Account'}
      </motion.button>

      {/* Divider */}
      <motion.div variants={itemVariants} className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-amber-900/10 dark:border-white/10"></div>
        <span className="flex-shrink mx-4 text-2xs text-amber-900/40 dark:text-white/40 font-bold uppercase tracking-wider">Or</span>
        <div className="flex-grow border-t border-amber-900/10 dark:border-white/10"></div>
      </motion.div>

      {/* Google Button */}
      <motion.div variants={itemVariants} className="relative group rounded-xl">
        {/* Theme-colored hover glowing border background */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl blur-md z-0" />
        
        <motion.a
          href={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/auth/google`}
          whileHover={{ 
            scale: 1.025,
            boxShadow: "0 8px 24px -8px rgba(245, 158, 11, 0.25)"
          }}
          whileTap={{ scale: 0.98 }}
          className="relative z-10 flex items-center justify-center gap-3 w-full py-3 px-4 bg-white/70 dark:bg-white/5 backdrop-blur-md border border-amber-900/10 dark:border-white/10 text-amber-950 dark:text-white font-bold rounded-xl text-sm transition-all duration-300 cursor-pointer overflow-hidden"
        >
          {/* Shimmer Effect */}
          <motion.div
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-500/15 dark:via-white/10 to-transparent z-0"
            animate={{
              x: ["0%", "200%"],
            }}
            transition={{
              repeat: Infinity,
              repeatType: "loop",
              duration: 2.5,
              ease: "linear",
            }}
          />

          {/* Icon Container with hover wiggle animation */}
          <motion.div 
            className="relative shrink-0 flex items-center justify-center z-10"
            whileHover={{ rotate: [0, -10, 10, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </motion.div>

          <span className="relative z-10 select-none group-hover:text-[#702224] dark:group-hover:text-amber-200 transition-colors duration-300">
            Continue with Google
          </span>
        </motion.a>
      </motion.div>

      <p className="text-[10px] text-amber-900/60 text-center leading-normal">
        By creating an account, you agree to collaborate responsibly within the OPMS community.
      </p>
    </motion.form>
  );
}
