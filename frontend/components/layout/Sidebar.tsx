'use client';

import { useState, useEffect } from 'react';
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
  Settings,
  ShieldAlert,
  HeartHandshake,
  Activity,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Auto-collapse on small screens
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsCollapsed(true);
      else setIsCollapsed(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentUser = mounted ? user : null;

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Explore Projects', href: '/explore', icon: Compass },
    { name: 'Find Students', href: '/students', icon: Users },
    { name: 'Team Matching', href: '/match', icon: Zap },
    { name: 'Chat / Mentors', href: '/messages', icon: MessageSquare },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Contributors', href: '/contributors', icon: HeartHandshake },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  if (currentUser?.role === 'admin') {
    navItems.push({ name: 'Admin Dashboard', href: '/admin', icon: ShieldAlert });
    navItems.push({ name: 'Network Status', href: '/status', icon: Activity });
  }

  return (
    <aside className={`${isCollapsed ? 'w-[88px]' : 'w-72'} bg-[var(--panel-bg)]/80 backdrop-blur-3xl border-r border-[var(--border-color)] flex flex-col justify-between shrink-0 shadow-[4px_0_30px_rgba(0,0,0,0.1)] relative z-20 transition-all duration-300 ease-in-out`}>
      {/* Decorative gradient blur at the top */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[var(--accent-primary)]/10 to-transparent pointer-events-none" />
      
      <div className="flex flex-col relative z-10 h-full">
        {/* Logo Section */}
        <div className={`p-6 border-b border-[var(--border-color)] flex items-center ${isCollapsed ? 'justify-center px-4' : 'justify-between'}`}>
          <Link href="/dashboard" className="block group transition-transform hover:scale-[1.02]">
            <Logo size={isCollapsed ? 36 : 42} withText={!isCollapsed} textClassName="text-[var(--text-primary)] font-extrabold text-xl tracking-tight group-hover:text-[var(--accent-primary)] transition-colors duration-300" />
          </Link>
        </div>

        {/* Links Navigation */}
        <nav className="p-4 space-y-1.5 overflow-y-auto overflow-x-hidden flex-1 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'} rounded-xl text-sm font-semibold transition-all duration-300 relative group overflow-hidden ${
                  isActive
                    ? 'text-white border border-white/20'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'
                }`}
              >
                {/* Active Background & Glow */}
                {isActive && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] opacity-100 z-0" />
                    <div className="absolute inset-0 opacity-40 shadow-[0_0_20px_var(--accent-primary-glow)] z-0" />
                  </>
                )}
                
                {/* Hover Background (Inactive) */}
                {!isActive && (
                  <div className="absolute inset-0 bg-[var(--text-primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 rounded-xl" />
                )}

                {/* Content */}
                <div className={`relative z-10 flex items-center ${isCollapsed ? 'justify-center' : 'gap-4 w-full'}`}>
                  <div className={`p-1.5 rounded-lg transition-transform duration-300 group-hover:scale-110 ${isActive ? 'bg-white/20 shadow-inner' : 'bg-[var(--surface-elevated)] group-hover:bg-[var(--text-primary)]/10 shadow-sm border border-[var(--border-color)]'}`}>
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors'} />
                  </div>
                  
                  {!isCollapsed && (
                    <>
                      <span className={`tracking-wide whitespace-nowrap ${isActive ? 'drop-shadow-md text-white' : ''}`}>{item.name}</span>
                      {/* Hover indicator arrow */}
                      {!isActive && (
                        <span className="ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[var(--accent-primary)]">
                          &rarr;
                        </span>
                      )}
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Toggle Collapse Button & Footer */}
        <div className="border-t border-[var(--border-color)] bg-[var(--surface-elevated)]/30 backdrop-blur-md relative z-10">
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center py-4' : 'justify-between px-6 py-4'} hover:bg-[var(--text-primary)]/5 transition-colors group cursor-pointer border-b border-[var(--border-color)]`}
          >
            {!isCollapsed && <span className="text-xs font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] tracking-wider transition-colors">COLLAPSE MENU</span>}
            <div className="p-1.5 rounded-lg bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 group-hover:bg-[var(--accent-primary)]/20 transition-all duration-300">
              {isCollapsed ? (
                <PanelLeftOpen size={16} className="text-[var(--accent-primary)]" />
              ) : (
                <PanelLeftClose size={16} className="text-[var(--accent-primary)]" />
              )}
            </div>
          </button>

          <div className={`p-4 flex flex-col gap-1.5 transition-all duration-300 ${isCollapsed ? 'items-center' : 'items-start'}`}>
            <div className="flex items-center gap-2" title="System Online">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)] shrink-0" />
              {!isCollapsed && <span className="text-xs font-bold text-[var(--text-primary)] tracking-wider">SYSTEM ONLINE</span>}
            </div>
            {!isCollapsed && (
              <>
                <span className="text-[10px] text-[var(--text-secondary)] font-medium">Campus Innovation Hub v1.0.0</span>
                <span className="text-[10px] text-[var(--text-secondary)] opacity-60">Crafted by OPMS Team</span>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
