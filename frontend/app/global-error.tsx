'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-900 text-stone-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-stone-800/80 border border-stone-700/60 p-8 rounded-2xl shadow-2xl space-y-4">
          <h2 className="text-xl font-bold text-white">Application Error</h2>
          <p className="text-stone-400 text-sm">
            A critical error occurred. Please refresh or try again.
          </p>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl transition"
          >
            Reset Application
          </button>
        </div>
      </body>
    </html>
  );
}
