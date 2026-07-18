'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/ui/Logo';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Explore Projects', href: '/explore', icon: '🔍' },
    { name: 'Find Students', href: '/students', icon: '👥' },
    { name: 'Team Matching', href: '/match', icon: '🤝' },
    { name: 'Chat / Mentors', href: '/messages', icon: '💬' },
    { name: 'Leaderboard', href: '/leaderboard', icon: '🏆' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-white/40 backdrop-blur-2xl border-r border-black/5 flex flex-col justify-between shrink-0 shadow-[4px_0_30px_rgba(0,0,0,0.05)] relative z-20">
      <div className="flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-black/5">
          <Link href="/dashboard" className="block hover:opacity-90 transition-opacity">
            <Logo size={52} withText textClassName="text-white font-bold text-lg tracking-tight" />
          </Link>
        </div>

        {/* Links Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative group overflow-hidden ${
                  isActive
                    ? 'text-[var(--text-primary)] border border-black/10'
                    : 'text-gray-500 hover:text-[var(--text-primary)] hover:bg-black/5 border border-transparent'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)]/80 to-[var(--accent-secondary)]/80 opacity-100 shadow-[0_0_20px_var(--accent-primary-glow)] -z-10" />
                )}
                <span className="text-base">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Quick Footer inside Sidebar */}
      <div className="p-6 border-t border-black/5">
        <div className="text-xs text-gray-500 flex flex-col gap-1">
          <span>Campus Innovation Hub</span>
          <span className="text-[10px] text-gray-600">v1.0.0 &bull; OPMS Team</span>
        </div>
      </div>
    </aside>
  );
}
