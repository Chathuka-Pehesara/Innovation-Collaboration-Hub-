'use client';

export default function LoadingSkeleton({ type = 'card', count = 3 }) {
  const items = Array(count).fill(0);

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((_, i) => (
          <div key={i} className="glass-card p-6 animate-shimmer overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="h-6 bg-white/10 rounded w-2/3"></div>
              <div className="h-5 bg-white/10 rounded-full w-16"></div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-white/10 rounded w-full"></div>
              <div className="h-4 bg-white/10 rounded w-full"></div>
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
            </div>
            <div className="flex gap-2 mb-4">
              <div className="h-6 bg-white/10 rounded w-16"></div>
              <div className="h-6 bg-white/10 rounded w-16"></div>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between">
              <div className="h-4 bg-white/10 rounded w-24"></div>
              <div className="h-4 bg-white/10 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-shimmer overflow-hidden">
        <div className="h-10 bg-white/10 rounded w-1/2 mb-4"></div>
        <div className="flex gap-3 mb-8">
          <div className="h-6 bg-white/10 rounded-full w-20"></div>
          <div className="h-6 bg-white/10 rounded-full w-24"></div>
        </div>
        <div className="glass-card p-8">
          <div className="h-6 bg-white/10 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-white/10 rounded w-full"></div>
            <div className="h-4 bg-white/10 rounded w-full"></div>
            <div className="h-4 bg-white/10 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
