'use client';

export default function ExplorePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Explore Projects</h1>
        <p className="text-gray-400 text-sm">Discover and join ongoing research and dev projects.</p>
      </div>
      <div className="glass-panel p-12 rounded-2xl text-center text-gray-500 text-sm">
        Project listings will appear here.
      </div>
    </div>
  );
}
