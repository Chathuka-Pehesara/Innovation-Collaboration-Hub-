'use client';

import Link from 'next/link';
import { Twitter, Github, Linkedin, Mail, ArrowRight, Sparkles } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function Footer() {
  return (
    <footer className="w-full mt-auto shrink-0 relative bg-[var(--panel-bg)]/70 backdrop-blur-3xl border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-500 hover:shadow-[0_8px_40px_var(--accent-primary-glow)] group/footer">
      {/* Animated glowing top border line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent opacity-50 group-hover/footer:opacity-100 transition-opacity duration-700" />
      
      {/* Deep ambient background glow inside footer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[var(--accent-primary)]/10 blur-[120px] rounded-[100%] pointer-events-none transition-opacity duration-700 group-hover/footer:opacity-100 opacity-60" />

      <div className="max-w-7xl mx-auto px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative">
                <Logo size={56} />
                <div className="absolute inset-0 bg-[var(--accent-primary)]/40 blur-[20px] rounded-full scale-150 group-hover:scale-125 transition-transform duration-500 animate-pulse" />
              </div>
              <span className="text-[var(--text-primary)] font-extrabold font-display text-3xl tracking-tight drop-shadow-md group-hover:text-white transition-colors duration-300">
                Innovation Hub
              </span>
            </Link>
            <p className="text-[var(--text-secondary)] text-sm max-w-md leading-relaxed pr-8 font-medium">
              Launch campus initiatives, assemble multidisciplinary squads with AI skills compatibility, and build tomorrow's solutions together in an immersive ecosystem.
            </p>
            <div className="flex items-center gap-4 pt-4">
              {[Twitter, Github, Linkedin].map((Icon, idx) => (
                <a key={idx} href="#" className="w-12 h-12 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:bg-gradient-to-br hover:from-[var(--accent-primary)] hover:to-[var(--accent-secondary)] hover:border-transparent transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_25px_var(--accent-primary-glow)] relative overflow-hidden group/social">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 -translate-x-full group-hover/social:translate-x-full transition-transform duration-700" />
                  <Icon size={20} className="relative z-10" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-6">
            <h4 className="text-[var(--text-primary)] font-bold tracking-widest uppercase text-xs flex items-center gap-2 drop-shadow-sm">
              <Sparkles size={14} className="text-[var(--accent-secondary)] animate-pulse" /> Platform
            </h4>
            <ul className="space-y-4">
              {['Explore Projects', 'Find Innovators', 'Leaderboard', 'Team Matching'].map((link) => (
                <li key={link}>
                  <Link href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all duration-300 inline-flex items-center gap-3 group/link hover:translate-x-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[var(--border-color)] group-hover/link:bg-[var(--accent-primary)] transition-colors shadow-[0_0_0_var(--accent-primary-glow)] group-hover/link:shadow-[0_0_10px_var(--accent-primary-glow)] group-hover/link:scale-125" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / Connect */}
          <div className="md:col-span-4 space-y-6">
            <h4 className="text-[var(--text-primary)] font-bold tracking-widest uppercase text-xs flex items-center gap-2 drop-shadow-sm">
              <Mail size={14} className="text-[var(--accent-secondary)] animate-pulse" /> Connect
            </h4>
            <div className="bg-[var(--surface-elevated)]/50 border border-[var(--border-color)] rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group/form transition-all duration-500 hover:border-[var(--accent-primary)]/50 hover:bg-[var(--surface-elevated)]/80">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/10 to-transparent opacity-0 group-hover/form:opacity-100 transition-opacity duration-500" />
              <p className="text-sm text-[var(--text-secondary)] mb-5 relative z-10 font-medium">Subscribe to our newsletter for the latest hackathon updates and team requests.</p>
              <div className="flex gap-3 relative z-10">
                <input type="email" placeholder="Your email address" className="bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] w-full focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary-glow)] transition-all placeholder:text-[var(--text-secondary)]/50" />
                <button className="bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white p-3 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_4px_15px_var(--accent-primary-glow)] hover:shadow-[0_8px_25px_var(--accent-primary-glow)] border border-white/20 hover:border-white/40">
                  <ArrowRight size={20} className="group-hover/form:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--border-color)] flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex flex-wrap justify-center gap-6 text-xs text-[var(--text-secondary)] font-medium">
            <span>&copy; {new Date().getFullYear()} Innovation Hub. All rights reserved.</span>
            <Link href="#" className="hover:text-[var(--text-primary)] transition-colors hover:underline underline-offset-4">Privacy Policy</Link>
            <Link href="#" className="hover:text-[var(--text-primary)] transition-colors hover:underline underline-offset-4">Terms of Service</Link>
          </div>
          <div className="flex items-center gap-2.5 px-5 py-2 bg-green-500/10 border border-green-500/20 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-shadow">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
            <span className="text-xs font-bold tracking-wider text-green-500 uppercase">All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
