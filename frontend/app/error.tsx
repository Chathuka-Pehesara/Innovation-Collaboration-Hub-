'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error captured:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md bg-stone-800/80 border border-stone-700/60 backdrop-blur-md p-8 rounded-2xl shadow-2xl space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Something went wrong</h2>
        <p className="text-stone-400 text-sm leading-relaxed">
          An unexpected error occurred while loading this page.
        </p>
        <div className="pt-2 flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs rounded-xl transition shadow-lg"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-5 py-2.5 bg-stone-700 hover:bg-stone-600 text-stone-200 font-semibold text-xs rounded-xl transition"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
