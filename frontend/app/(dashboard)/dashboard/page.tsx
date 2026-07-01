'use client';

import Link from 'next/link';
import StatsRow from '@/components/dashboard/StatsRow';
import ActivityFeed from '@/components/dashboard/ActivityFeed';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Workspace Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Manage project requests, matches, and team recommendations.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/explore" className="btn-secondary py-2 px-4 text-sm hover:bg-white/10">
            Explore Ideas
          </Link>
          <Link href="/match" className="btn-primary py-2 px-4 text-sm">
            🤝 Match Team
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <StatsRow />

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Recent Updates & Feed */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center pb-4 border-b border-white/5">
            <h3 className="text-lg font-bold text-white">Collaboration Log</h3>
            <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/10 font-medium">
              Live updates
            </span>
          </div>
          <ActivityFeed />
        </div>

        {/* Right Side: Quick Actions Panel */}
        <div className="glass-card p-6 flex flex-col gap-6 h-fit">
          <h3 className="text-lg font-bold text-white pb-4 border-b border-white/5">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/students"
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/20 hover:bg-white/10 transition-all text-sm text-gray-300 hover:text-white font-medium group"
            >
              <span>🔍 Find Students & Skills</span>
              <span className="text-indigo-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>

            <Link
              href="/messages"
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/20 hover:bg-white/10 transition-all text-sm text-gray-300 hover:text-white font-medium group"
            >
              <span>💬 Consult AI Mentor Bot</span>
              <span className="text-purple-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>

            <Link
              href="/settings"
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-pink-500/20 hover:bg-white/10 transition-all text-sm text-gray-300 hover:text-white font-medium group"
            >
              <span>⚙️ Adjust Bio & Availability</span>
              <span className="text-pink-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
