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
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Workspace Dashboard</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Manage project requests, matches, and team recommendations.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/explore" className="btn-secondary py-2 px-4 text-sm">
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
        <div className="lg:col-span-2 bg-[var(--panel-bg)]/60 backdrop-blur-3xl border border-[var(--border-color)] rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden group/panel">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--accent-primary)]/5 to-transparent rounded-full blur-3xl -z-10 group-hover/panel:from-[var(--accent-primary)]/10 transition-colors duration-700" />
          
          <div className="flex justify-between items-center pb-5 border-b border-[var(--border-color)]">
            <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-3">
              <span className="w-2 h-6 rounded-full bg-[var(--accent-primary)]" />
              Collaboration Log
            </h3>
            <span className="text-xs bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)] px-3 py-1 rounded-full border border-[var(--accent-secondary)]/20 font-bold uppercase tracking-wider shadow-[0_0_10px_var(--accent-secondary-glow)] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-secondary)] animate-pulse" />
              Live
            </span>
          </div>
          <ActivityFeed />
        </div>

        {/* Right Side: Quick Actions Panel */}
        <div className="bg-[var(--panel-bg)]/60 backdrop-blur-3xl border border-[var(--border-color)] rounded-3xl p-6 md:p-8 flex flex-col gap-6 h-fit shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden group/panel">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-[var(--accent-secondary)]/5 to-transparent rounded-full blur-3xl -z-10 group-hover/panel:from-[var(--accent-secondary)]/10 transition-colors duration-700" />
          
          <h3 className="text-xl font-bold text-[var(--text-primary)] pb-5 border-b border-[var(--border-color)] flex items-center gap-3">
            <span className="w-2 h-6 rounded-full bg-[var(--accent-secondary)]" />
            Quick Actions
          </h3>
          <div className="space-y-4">
            <Link
              href="/students"
              className="flex items-center justify-between p-5 rounded-2xl bg-[var(--surface-elevated)]/50 border border-[var(--border-color)] hover:border-[var(--accent-primary)]/40 hover:bg-[var(--surface-elevated)] transition-all duration-300 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold group hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="flex items-center gap-3 relative z-10">
                <span className="p-2 rounded-xl bg-[var(--text-primary)]/5 group-hover:bg-[var(--accent-primary)]/10 text-xl transition-colors duration-300">🔍</span> 
                Find Students & Skills
              </span>
              <span className="text-[var(--accent-primary)] group-hover:translate-x-1.5 transition-transform duration-300 relative z-10 font-bold">&rarr;</span>
            </Link>

            <Link
              href="/messages?mentor=true"
              className="flex items-center justify-between p-5 rounded-2xl bg-[var(--surface-elevated)]/50 border border-[var(--border-color)] hover:border-[#8B5CF6]/40 hover:bg-[var(--surface-elevated)] transition-all duration-300 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold group hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="flex items-center gap-3 relative z-10">
                <span className="p-2 rounded-xl bg-[var(--text-primary)]/5 group-hover:bg-[#8B5CF6]/10 text-xl transition-colors duration-300">💬</span> 
                Consult AI Mentor Bot
              </span>
              <span className="text-[#8B5CF6] group-hover:translate-x-1.5 transition-transform duration-300 relative z-10 font-bold">&rarr;</span>
            </Link>

            <Link
              href="/settings"
              className="flex items-center justify-between p-5 rounded-2xl bg-[var(--surface-elevated)]/50 border border-[var(--border-color)] hover:border-[#EC4899]/40 hover:bg-[var(--surface-elevated)] transition-all duration-300 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold group hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#EC4899]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="flex items-center gap-3 relative z-10">
                <span className="p-2 rounded-xl bg-[var(--text-primary)]/5 group-hover:bg-[#EC4899]/10 text-xl transition-colors duration-300">⚙️</span> 
                Adjust Bio & Settings
              </span>
              <span className="text-[#EC4899] group-hover:translate-x-1.5 transition-transform duration-300 relative z-10 font-bold">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
