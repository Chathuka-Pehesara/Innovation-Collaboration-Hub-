'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { 
  LayoutDashboard, 
  Compass, 
  Users, 
  Zap, 
  MessageSquare, 
  Trophy, 
  Settings 
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Explore Projects', href: '/explore', icon: Compass },
    { name: 'Find Students', href: '/students', icon: Users },
    { name: 'Team Matching', href: '/match', icon: Zap },
    { name: 'Chat / Mentors', href: '/messages', icon: MessageSquare },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-72 bg-[var(--panel-bg)]/70 backdrop-blur-3xl border-r border-[var(--border-color)] flex flex-col justify-between shrink-0 shadow-[4px_0_30px_rgba(0,0,0,0.1)] relative z-20 transition-all duration-300">
      {/* Decorative gradient blur at the top */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[var(--accent-primary)]/10 to-transparent pointer-events-none" />
      
      <div className="flex flex-col relative z-10">
        {/* Logo Section */}
        <div className="p-6 border-b border-[var(--border-color)]">
          <Link href="/dashboard" className="block group transition-transform hover:scale-[1.02]">
            <Logo size={48} withText textClassName="text-[var(--text-primary)] font-extrabold text-xl tracking-tight group-hover:text-[var(--accent-primary)] transition-colors duration-300" />
          </Link>
        </div>

        {/* Links Navigation */}
        <nav className="p-5 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 relative group overflow-hidden ${
                  isActive
                    ? 'text-white border border-white/20'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'
                }`}
              >
                {/* Active Background & Glow */}
                {isActive && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] opacity-100 z-0" />
                    <div className="absolute inset-0 opacity-50 shadow-[0_0_20px_var(--accent-primary-glow)] z-0" />
                  </>
                )}
                
                {/* Hover Background (Inactive) */}
                {!isActive && (
                  <div className="absolute inset-0 bg-[var(--text-primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 rounded-2xl" />
                )}

                {/* Content */}
                <div className="relative z-10 flex items-center gap-4 w-full">
                  <div className={`p-1.5 rounded-lg transition-transform duration-300 group-hover:scale-110 ${isActive ? 'bg-white/20 shadow-inner' : 'bg-[var(--surface-elevated)] group-hover:bg-[var(--text-primary)]/10 shadow-sm border border-[var(--border-color)]'}`}>
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors'} />
                  </div>
                  <span className={`tracking-wide ${isActive ? 'drop-shadow-md text-white' : ''}`}>{item.name}</span>
                  
                  {/* Hover indicator arrow */}
                  {!isActive && (
                    <span className="ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[var(--accent-primary)]">
                      &rarr;
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Quick Footer inside Sidebar */}
      <div className="p-6 border-t border-[var(--border-color)] bg-[var(--surface-elevated)]/30 backdrop-blur-md relative z-10">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-xs font-bold text-[var(--text-primary)] tracking-wider">SYSTEM ONLINE</span>
          </div>
          <span className="text-[10px] text-[var(--text-secondary)] font-medium">Campus Innovation Hub v1.0.0</span>
          <span className="text-[10px] text-[var(--text-secondary)] opacity-60">Crafted by OPMS Team</span>
        </div>
      </div>
    </aside>
  );
}
