'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import { motion, AnimatePresence } from 'framer-motion';

function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  
  const [showTransition, setShowTransition] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [targetPath, setTargetPath] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (showTransition && videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Autoplay with sound was blocked. Fallback to muted playback so it doesn't freeze.
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(e => console.error("Video play failed:", e));
          }
        });
      }
    }
  }, [showTransition]);

  useEffect(() => {
    // Only run this logic if we haven't already initiated the transition
    if (showTransition) return;

    const token = searchParams.get('token');
    const userStr = searchParams.get('user');
    const isNew = searchParams.get('new') === 'true';

    if (token && userStr) {
      try {
        let user;
        try {
          user = JSON.parse(userStr);
        } catch {
          user = JSON.parse(decodeURIComponent(userStr));
        }

        setAuth(user, token);

        let path = '/dashboard';
        if (isNew || !user.specialization) {
          // Redirect first-time users to Settings to pick their specialization
          path = '/settings?onboarding=true';
        }
        
        setTargetPath(path);
        setShowTransition(true);
        router.prefetch(path);
        
        // Fallback in case video fails to load or play
        setTimeout(() => {
          if (!isFadingOut) {
            router.push(path);
          }
        }, 15000); // Increased timeout to allow full video playback
      } catch (err) {
        console.error('Error parsing OAuth user payload', err);
        window.location.replace('/login?error=oauth_parse_error');
      }
    } else {
      window.location.replace('/login?error=oauth_missing_parameters');
    }
  }, [searchParams, setAuth, router, showTransition, isFadingOut]);

  return (
    <>
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 max-w-sm text-center">
        {/* Elegant spinner */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-600/10 border-t-indigo-600 animate-spin" />
          <div className="absolute w-6 h-6 rounded-full bg-indigo-600/5 animate-pulse" />
        </div>
        <div>
          <h3 className="text-textPrimary font-bold text-lg tracking-tight">Authenticating account...</h3>
          <p className="text-textSecondary text-xs mt-1">Please wait while we set up your secure session...</p>
        </div>
      </div>
    </div>
    
    <AnimatePresence>
      {showTransition && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isFadingOut ? 0 : 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        >
          <video 
            ref={videoRef}
            src="/Logo CH.mp4" 
            playsInline
            className="w-full h-full object-cover"
            onEnded={() => {
              setIsFadingOut(true);
              setTimeout(() => {
                router.push(targetPath || '/dashboard');
              }, 800);
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
    </>
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
