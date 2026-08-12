'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';

function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');
    const isNew = searchParams.get('new') === 'true';

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        setAuth(user, token);

        if (isNew || !user.specialization) {
          // Redirect first-time users to Settings to pick their specialization
          router.push('/settings?onboarding=true');
        } else {
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Error parsing OAuth user payload', err);
        router.push('/login?error=oauth_parse_error');
      }
    } else {
      router.push('/login?error=oauth_missing_parameters');
    }
  }, [searchParams, setAuth, router]);

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 max-w-sm text-center">
        {/* Elegant spinner */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-600/10 border-t-indigo-600 animate-spin" />
          <div className="absolute w-6 h-6 rounded-full bg-indigo-600/5 animate-pulse" />
        </div>
        <div>
          <h3 className="text-textPrimary font-bold text-lg tracking-tight">Authenticating with Google</h3>
          <p className="text-textSecondary text-xs mt-1">Please wait while we set up your secure session...</p>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-600/10 border-t-indigo-600 animate-spin" />
      </div>
    }>
      <AuthCallbackHandler />
    </Suspense>
  );
}
