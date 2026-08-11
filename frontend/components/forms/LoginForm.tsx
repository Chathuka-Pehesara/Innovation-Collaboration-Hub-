'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import { getFingerprint } from '@/lib/security/fingerprint';
import { solvePow } from '@/lib/security/pow';

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
  const [verifying, setVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [website, setWebsite] = useState('');

  // 🛡️ Live Security Visualization dashboard state
  const [fingerprintHash, setFingerprintHash] = useState('Computing...');
  const [fingerprintSolved, setFingerprintSolved] = useState(false);
  const [browserInfo, setBrowserInfo] = useState('Detecting...');
  const [osInfo, setOsInfo] = useState('Detecting...');
  const [resolutionInfo, setResolutionInfo] = useState('Detecting...');
  const [powStatus, setPowStatus] = useState<'idle' | 'solving' | 'solved'>('idle');
  const [powTime, setPowTime] = useState<number | null>(null);
  const [powNonceVal, setPowNonceVal] = useState<string | null>(null);
  const [savedSolution, setSavedSolution] = useState<{ powNonce: string, powTimestamp: number } | null>(null);
  const [powLiveNonce, setPowLiveNonce] = useState<number>(0);
  const [powLiveHash, setPowLiveHash] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const getDeviceData = async () => {
        try {
          const fp = await getFingerprint();
          setFingerprintHash(fp);
          setFingerprintSolved(true);

          const ua = navigator.userAgent;
          let os = 'Linux';
          if (ua.indexOf('Win') !== -1) os = 'Windows';
          else if (ua.indexOf('Mac') !== -1) os = 'MacOS';
          else if (ua.indexOf('Linux') !== -1) os = 'Linux';
          else if (ua.indexOf('Android') !== -1) os = 'Android';
          else if (ua.indexOf('like Mac') !== -1) os = 'iOS';
          setOsInfo(os);

          let browser = 'Chrome';
          if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';
          else if (ua.indexOf('Chrome') !== -1) browser = 'Chrome';
          else if (ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1) browser = 'Safari';
          else if (ua.indexOf('Edge') !== -1) browser = 'Edge';
          setBrowserInfo(browser);

          setResolutionInfo(`${window.screen.width}x${window.screen.height}`);
        } catch (err) {
          console.error(err);
        }
      };
      getDeviceData();
    }
  }, []);

  // Async chunked PoW solver — yields to browser every CHUNK_SIZE iterations
  // so React can re-render the live nonce/hash display
  const solveAsync = (emailVal: string): Promise<{ powNonce: string; powTimestamp: number; elapsed: number }> =>
    new Promise((resolve, reject) => {
      const CHUNK = 2000;
      const powTimestamp = Date.now();
      const emailLower = emailVal.toLowerCase();
      const startTime = performance.now();
      let nonce = 0;

      // Inline SHA-256 so we don't import the blocking wrapper
      function sha256(ascii: string): string {
        function rightRotate(v: number, a: number) { return (v >>> a) | (v << (32 - a)); }
        const h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
        const k = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
        const words: number[] = [];
        let padded = ascii + String.fromCharCode(0x80);
        while (padded.length % 64 !== 56) padded += String.fromCharCode(0);
        for (let i = 0; i < padded.length; i++) words[i >> 2] |= padded.charCodeAt(i) << ((3 - i % 4) * 8);
        words[words.length] = (ascii.length * 8 / Math.pow(2, 32)) | 0;
        words[words.length] = (ascii.length * 8) | 0;
        for (let i = 0; i < words.length; i += 16) {
          const w = words.slice(i, i + 16); const oh = h.slice();
          for (let j = 0; j < 64; j++) {
            if (j >= 16) { const a = w[j - 15], b = w[j - 2]; w[j] = (w[j - 16] + (rightRotate(a, 7) ^ rightRotate(a, 18) ^ (a >>> 3)) + w[j - 7] + (rightRotate(b, 17) ^ rightRotate(b, 19) ^ (b >>> 10))) | 0; }
            const s0 = rightRotate(h[0], 2) ^ rightRotate(h[0], 13) ^ rightRotate(h[0], 22);
            const t2 = (s0 + (h[0] & h[1]) ^ (h[0] & h[2]) ^ (h[1] & h[2])) | 0;
            const s1 = rightRotate(h[4], 6) ^ rightRotate(h[4], 11) ^ rightRotate(h[4], 25);
            const t1 = (h[7] + s1 + ((h[4] & h[5]) ^ (~h[4] & h[6])) + k[j] + (w[j] | 0)) | 0;
            h[7] = h[6]; h[6] = h[5]; h[5] = h[4]; h[4] = (h[3] + t1) | 0; h[3] = h[2]; h[2] = h[1]; h[1] = h[0]; h[0] = (t1 + t2) | 0;
          }
          for (let j = 0; j < 8; j++) h[j] = (h[j] + oh[j]) | 0;
        }
        let r = ''; for (let i = 0; i < 8; i++) for (let j = 3; j >= 0; j--) { const b = (h[i] >> (j * 8)) & 0xff; r += (b < 16 ? '0' : '') + b.toString(16); } return r;
      }

      function runChunk() {
        const end = nonce + CHUNK;
        while (nonce < end) {
          const data = emailLower + powTimestamp.toString() + nonce.toString();
          const hash = sha256(data);
          if (hash.startsWith('0000')) {
            const elapsed = Math.round(performance.now() - startTime);
            setPowLiveNonce(nonce);
            setPowLiveHash(hash);
            resolve({ powNonce: nonce.toString(), powTimestamp, elapsed });
            return;
          }
          nonce++;
        }
        // Update live display, then yield back to the browser
        setPowLiveNonce(nonce);
        setPowLiveHash(sha256(emailLower + powTimestamp.toString() + (nonce - 1).toString()).slice(0, 16) + '...');
        requestAnimationFrame(runChunk);
      }

      requestAnimationFrame(runChunk);
    });

  const triggerPow = async (emailVal: string) => {
    if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal) || powStatus === 'solved' || powStatus === 'solving') {
      return;
    }
    setPowStatus('solving');
    setPowLiveNonce(0);
    setPowLiveHash('');
    try {
      const result = await solveAsync(emailVal);
      setPowTime(result.elapsed);
      setPowNonceVal(result.powNonce);
      setPowStatus('solved');
      setSavedSolution({ powNonce: result.powNonce, powTimestamp: result.powTimestamp });
    } catch {
      setPowStatus('idle');
    }
  };

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
    setVerificationSuccess(null);
    setVerificationError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const fingerprint = await getFingerprint();

      let solution = savedSolution;
      if (!solution) {
        setPowStatus('solving');
        const start = performance.now();
        solution = solvePow(email);
        const end = performance.now();
        setPowTime(Math.round(end - start));
        setPowNonceVal(solution.powNonce);
        setPowStatus('solved');
        setSavedSolution(solution);
      }

      const { data } = await api.post('/auth/login', {
        email,
        password,
        fingerprint,
        powNonce: solution.powNonce,
        powTimestamp: solution.powTimestamp,
        website,
      });
      setAuth(data.user, data.accessToken);
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      const code = err.response?.data?.code;
      const respData = err.response?.data;
      if (respData?.code === 'EMAIL_NOT_VERIFIED') {
        setServerError('Please verify your email address before signing in.');
        if (respData.verificationUrl) {
          setVerificationUrl(respData.verificationUrl);
        }
      } else if (code === 'POW_FAILED' || code === 'POW_MISSING' || code === 'HONEYPOT_TRIGGERED') {
        setServerError('Verification failed. Automated activity detected.');
      } else {
        setServerError(msg || 'Something went wrong. Please try again.');
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
        window.location.reload();
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

      {/* Honeypot field (invisible to users, filled by automated bot scanners) */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="new-password"
        style={{ display: 'none', position: 'absolute', left: '-9999px' }}
      />

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
            onBlur={(e) => triggerPow(e.target.value)}
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
            <div className="pl-6 space-y-2">
              <button
                type="button"
                onClick={handleVerifyNow}
                disabled={verifying}
                className="inline-block text-xs font-bold bg-[#702224] hover:bg-[#5C1A1C] disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-all shadow-md"
              >
                {verifying ? 'Verifying...' : 'Verify Account Now (Dev Option)'}
              </button>
              {verificationSuccess && (
                <p className="text-green-850 text-xs font-semibold">✓ {verificationSuccess}</p>
              )}
              {verificationError && (
                <p className="text-red-800 text-xs font-semibold">✗ {verificationError}</p>
              )}
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
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
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
          id="github-signin-btn"
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

      {/* 🛡️ Security Status Strip */}
      <motion.div
        variants={itemVariants}
        className="mt-4 px-3 py-2.5 rounded-xl border border-amber-900/12 bg-amber-950/[0.04] backdrop-blur-sm"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="text-[9px] font-bold text-amber-900/45 uppercase tracking-widest">Security Active</span>
          </div>
          {powStatus === 'idle' && (
            <span className="text-[9px] font-medium text-amber-900/30">—</span>
          )}
          {powStatus === 'solving' && (
            <span className="flex items-center gap-1 text-[9px] font-semibold text-amber-700 px-1.5 py-0.5 rounded-full border border-amber-400/25 bg-amber-50">
              <svg className="w-2 h-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Verifying…
            </span>
          )}
          {powStatus === 'solved' && (
            <span className="text-[9px] font-bold text-emerald-600 px-1.5 py-0.5 rounded-full border border-emerald-400/30 bg-emerald-50">
              ✓ Ready · {powTime}ms
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/70 border border-amber-900/10 shadow-sm">
            <svg className="w-2.5 h-2.5 text-[#702224]/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.1.9-2 2-2m-2 2v5m0-5a2 2 0 00-2-2m10 2a8 8 0 11-16 0 8 8 0 0116 0z" />
            </svg>
            <span className="text-[9px] font-mono text-amber-900/55 truncate max-w-[70px]">
              {fingerprintSolved ? fingerprintHash.slice(0, 13) + '…' : '—'}
            </span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/70 border border-amber-900/10 shadow-sm">
            <svg className="w-2.5 h-2.5 text-[#702224]/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8m-4-4v4" />
            </svg>
            <span className="text-[9px] font-semibold text-amber-900/65">{osInfo === 'Detecting...' ? '—' : osInfo}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/70 border border-amber-900/10 shadow-sm">
            <svg className="w-2.5 h-2.5 text-[#702224]/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
            </svg>
            <span className="text-[9px] font-semibold text-amber-900/65">{browserInfo === 'Detecting...' ? '—' : browserInfo}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50/90 border border-emerald-300/30 shadow-sm">
            <svg className="w-2.5 h-2.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-[9px] font-semibold text-emerald-700">Trap On</span>
          </div>
          {powStatus === 'solved' && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#702224]/5 border border-[#702224]/12 shadow-sm">
              <svg className="w-2.5 h-2.5 text-[#702224]/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-[9px] font-mono text-[#702224]/60">#{powNonceVal}</span>
            </div>
          )}
        </div>
        {powStatus === 'solving' && (
          <div className="mt-2 w-full bg-amber-900/8 rounded-full h-0.5 overflow-hidden">
            <motion.div
              className="bg-[#702224]/40 h-0.5 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.15, repeat: Infinity }}
            />
          </div>
        )}
      </motion.div>
    </motion.form>
  );
}

export default LoginForm;
