/**
 * @file        RegisterForm.tsx
 * @owner       IT Team
 * @description Registration form: name, email, specialization, password with strength indicator.
 * @depends     lib/api.ts
 */

'use client';
x
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
      await api.post('/auth/register', { name, email, password, specialization });
      setSuccess(true);
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-white font-semibold mb-2">Check your inbox</h2>
        <p className="text-gray-400 text-sm">
          We sent a verification link to <span className="text-gray-200">{email}</span>. 
          Click it to activate your account.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="mt-6 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Go to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
          Full name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => { setName(e.target.value); clearError('name'); }}
          placeholder="Your full name"
          className={`w-full px-4 py-2.5 bg-white/5 border rounded-lg text-white placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition
                      ${fieldErrors.name ? 'border-red-500' : 'border-white/10'}`}
        />
        {fieldErrors.name && <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
          placeholder="you@opms.edu"
          className={`w-full px-4 py-2.5 bg-white/5 border rounded-lg text-white placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition
                      ${fieldErrors.email ? 'border-red-500' : 'border-white/10'}`}
        />
        {fieldErrors.email && <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>}
      </div>

      {/* Specialization */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Specialization
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SPECIALIZATIONS.map((spec) => (
            <button
              key={spec}
              type="button"
              onClick={() => { setSpecialization(spec); clearError('specialization'); }}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all
                          ${specialization === spec
                            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300'
                          }`}
            >
              <span>{SPEC_LABELS[spec].icon}</span>
              <span>{SPEC_LABELS[spec].label}</span>
            </button>
          ))}
        </div>
        {fieldErrors.specialization && (
          <p className="text-red-400 text-xs mt-1">{fieldErrors.specialization}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
            placeholder="Min 8 chars, uppercase, number, symbol"
            className={`w-full px-4 py-2.5 pr-10 bg-white/5 border rounded-lg text-white placeholder-gray-500
                        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition
                        ${fieldErrors.password ? 'border-red-500' : 'border-white/10'}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {showPassword ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              ) : (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </>
              )}
            </svg>
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
                    i <= strength.score ? strength.color : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">{strength.label}</p>
          </div>
        )}
        {fieldErrors.password && <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>}
      </div>

      {/* Server error */}
      {serverError && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-400 text-sm">{serverError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed
                   text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
      >
        {loading && (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {loading ? 'Creating account...' : 'Create account'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        By creating an account, you agree to collaborate responsibly within the OPMS community.
      </p>
    </form>
  );
}
