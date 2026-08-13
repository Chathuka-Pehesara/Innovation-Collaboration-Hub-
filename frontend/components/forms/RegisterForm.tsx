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
  const [verifying, setVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

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

  const handleVerifyNow = async () => {
    if (!verificationUrl) return;
    setVerifying(true);
    setVerificationError(null);
    setVerificationSuccess(null);
    try {
      const token = verificationUrl.split('/').pop();
      const response = await api.get(`/auth/verify-email/${token}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      setVerificationSuccess(response.data?.message || 'Verification successful!');
      setTimeout(() => {
        router.push('/login?verified=true');
      }, 1500);
    } catch (err: any) {
      setVerificationError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setVerifying(false);
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
            <button 
              type="button"
              onClick={handleVerifyNow}
              disabled={verifying}
              className="w-full text-center text-xs font-semibold bg-[#702224] hover:bg-[#5C1A1C] disabled:opacity-50 text-white px-3 py-2.5 rounded-xl transition-all shadow-md shadow-red-950/15 flex items-center justify-center gap-2"
            >
              {verifying ? 'Verifying...' : 'Verify Account Now'}
            </button>
            {verificationSuccess && (
              <p className="text-green-800 text-xs mt-2 font-medium">✓ {verificationSuccess}</p>
            )}
            {verificationError && (
              <p className="text-red-600 text-xs mt-2 font-medium">✗ {verificationError}</p>
            )}
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
      suppressHydrationWarning
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
          suppressHydrationWarning
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
      <motion.div variants={itemVariants} suppressHydrationWarning>
        <label htmlFor="email" className="block text-sm font-semibold text-amber-950 mb-1">
          Email address
        </label>
        <div className="relative" suppressHydrationWarning>
          <motion.input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
            placeholder="you@opms.edu"
            suppressHydrationWarning
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
      <motion.div variants={itemVariants} suppressHydrationWarning>
        <label htmlFor="password" className="block text-sm font-semibold text-amber-950 mb-1">
          Password
        </label>
        <div className="relative" suppressHydrationWarning>
          <motion.input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
            placeholder="Min 8 chars, uppercase, number, symbol"
            suppressHydrationWarning
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

      {/* 🐱 Walking cat keyframes */}
      <style>{`
        @keyframes ghCatWalk {
          0%   { transform: translateX(-70px); }   /* stroll in from left */
          27%  { transform: translateX(195px); }   /* arrives near center */
          68%  { transform: translateX(210px); }   /* barely moves — purring pause */
          100% { transform: translateX(700px); }   /* trots off to the right */
        }
        @keyframes ghCatBob {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-2px); }
        }
        @keyframes ghTailWag {
          0%, 100% { transform: rotate(-22deg); }
          50%       { transform: rotate(22deg); }
        }
        @keyframes ghLegA {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }
        @keyframes ghLegB {
          0%, 100% { transform: translateY(-5px); }
          50%       { transform: translateY(0px); }
        }
        @keyframes ghPurrPulse {
          0%, 100% { transform: scale(1)     rotate(0deg); }
          25%       { transform: scale(1.016) rotate(0.5deg); }
          75%       { transform: scale(1.016) rotate(-0.5deg); }
        }
      `}</style>

      {/* GitHub Button */}
      <motion.div variants={itemVariants} className="relative group rounded-xl">
        {/* Amber theme glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl blur-md z-0" />

        <motion.a
          id="github-register-btn"
          href={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/auth/github`}
          whileHover={{
            scale: 1.025,
            boxShadow: "0 8px 24px -8px rgba(245, 158, 11, 0.25)"
          }}
          whileTap={{ scale: 0.97 }}
          className="relative z-10 flex items-center justify-center gap-3 w-full py-3 px-4 bg-white/70 dark:bg-white/5 backdrop-blur-md border border-amber-900/10 dark:border-white/10 text-amber-950 dark:text-white font-bold rounded-xl text-sm transition-all duration-300 cursor-pointer overflow-hidden"
        >
          {/* Amber shimmer sweep */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/15 dark:via-white/10 to-transparent z-0"
            animate={{ x: ["0%", "200%"] }}
            transition={{ repeat: Infinity, repeatType: "loop", duration: 2.0, ease: "linear" }}
          />

          {/* Floating code particles */}
          {["</>", "{}", "git", "⭐"].map((char, i) => (
            <motion.span
              key={i}
              className="absolute text-[9px] font-mono text-amber-600/40 dark:text-amber-300/40 select-none pointer-events-none"
              style={{ left: `${15 + i * 20}%`, top: "50%" }}
              animate={{
                y: [0, -14, 0],
                opacity: [0, 0.7, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 2.2,
                delay: i * 0.45,
                ease: "easeInOut",
              }}
            >
              {char}
            </motion.span>
          ))}

          {/* GitHub Octocat icon with spin on hover */}
          <motion.div
            className="relative shrink-0 flex items-center justify-center z-10"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            {/* Amber pulse ring */}
            <span className="absolute inset-0 rounded-full ring-1 ring-amber-400/30 animate-ping" />
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </motion.div>

          <span className="relative z-10 select-none group-hover:text-[#702224] dark:group-hover:text-amber-200 transition-colors duration-300 flex items-center gap-1.5">
            Continue with GitHub
            <motion.span
              animate={{ x: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
              className="text-amber-500 dark:text-amber-300 text-xs"
            >
            →
            </motion.span>
          </span>

          {/* 🐱 Cat walking on hover — strolls to center, purrs, then trots off */}
          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            {/* Outer div: horizontal walk */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, animation: 'ghCatWalk 9s linear infinite' }}>
              {/* Middle div: gentle body bob */}
              <div style={{ animation: 'ghCatBob 0.7s ease-in-out infinite' }}>
                {/* Inner div: purring vibration (scale wobble) */}
                <div style={{ animation: 'ghPurrPulse 0.22s ease-in-out infinite' }}>
                  <svg width="58" height="38" viewBox="0 0 58 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Tail — wags from base */}
                    <g style={{ transformBox: 'fill-box', transformOrigin: 'center bottom', animation: 'ghTailWag 0.6s ease-in-out infinite' }}>
                      <path d="M10 22 Q2 12 6 2" stroke="#222" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                    </g>
                    {/* Body */}
                    <ellipse cx="26" cy="26" rx="15" ry="8" fill="#222"/>
                    {/* Head */}
                    <circle cx="39" cy="14" r="9" fill="#222"/>
                    {/* Ears */}
                    <polygon points="33,7 36,1 39,7" fill="#222"/>
                    <polygon points="39,7 42,1 45,7" fill="#222"/>
                    {/* Inner ear pink */}
                    <polygon points="34,7 36,3.5 38,7" fill="#fda4af" opacity="0.75"/>
                    <polygon points="40,7 42,3.5 44,7" fill="#fda4af" opacity="0.75"/>
                    {/* Eyes — amber to match UI */}
                    <ellipse cx="37" cy="13" rx="2.2" ry="2.8" fill="#f59e0b"/>
                    <ellipse cx="43" cy="13" rx="2.2" ry="2.8" fill="#f59e0b"/>
                    {/* Pupils */}
                    <ellipse cx="37" cy="13.5" rx="0.85" ry="2.1" fill="#111"/>
                    <ellipse cx="43" cy="13.5" rx="0.85" ry="2.1" fill="#111"/>
                    {/* Eye shine */}
                    <circle cx="37.9" cy="12" r="0.65" fill="white"/>
                    <circle cx="43.9" cy="12" r="0.65" fill="white"/>
                    {/* Nose */}
                    <ellipse cx="46" cy="17" rx="1.4" ry="0.9" fill="#fda4af"/>
                    {/* Mouth */}
                    <path d="M45 18.5 Q46 20 47 18.5" stroke="#666" strokeWidth="0.65" strokeLinecap="round" fill="none"/>
                    {/* Whiskers left */}
                    <line x1="30" y1="16" x2="37" y2="17" stroke="#bbb" strokeWidth="0.65"/>
                    <line x1="30" y1="18" x2="37" y2="18" stroke="#bbb" strokeWidth="0.65"/>
                    {/* Whiskers right */}
                    <line x1="46" y1="17" x2="54" y2="15.5" stroke="#bbb" strokeWidth="0.65"/>
                    <line x1="46" y1="18" x2="54" y2="18" stroke="#bbb" strokeWidth="0.65"/>
                    {/* Legs — slow alternating gait (0.68s = lazy walk) */}
                    <rect style={{ animation: 'ghLegA 0.68s ease-in-out infinite' }} x="33" y="32" width="4" height="6" rx="2" fill="#222"/>
                    <rect style={{ animation: 'ghLegB 0.68s ease-in-out infinite' }} x="26" y="32" width="4" height="6" rx="2" fill="#222"/>
                    <rect style={{ animation: 'ghLegB 0.68s ease-in-out infinite' }} x="17" y="32" width="4" height="6" rx="2" fill="#222"/>
                    <rect style={{ animation: 'ghLegA 0.68s ease-in-out infinite' }} x="10" y="32" width="4" height="6" rx="2" fill="#222"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

        </motion.a>
      </motion.div>

      <p className="text-[10px] text-amber-900/60 text-center leading-normal">
        By creating an account, you agree to collaborate responsibly within the OPMS community.
      </p>
    </motion.form>
  );
}
