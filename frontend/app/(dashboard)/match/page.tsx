'use client';

import AIMatchPanel from '@/components/ai/AIMatchPanel';

export default function MatchPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Team Matching</h1>
        <p className="text-gray-400 text-sm">Discover complementary teammates recommended by our neural skills engine.</p>
      </div>
      <AIMatchPanel />
    </div>
  );
}
