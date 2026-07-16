'use client';

import Link from 'next/link';
import { Twitter, Github, Linkedin, Mail, ArrowRight, Sparkles } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function Footer() {
  return (
    <footer className="w-full mt-auto shrink-0 relative bg-white/40 backdrop-blur-xl border border-black/5 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
      {/* Static glowing top border line instead of heavy animated one */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent opacity-30" />
      
      {/* Deep ambient background glow inside footer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[var(--accent-primary)]/10 blur-[100px] rounded-[100%] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="relative">
                <Logo size={56} />
                <div className="absolute inset-0 bg-[var(--accent-primary)]/40 blur-[20px] rounded-full scale-150 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <span className="text-white font-extrabold font-display text-2xl tracking-tight drop-shadow-md">Innovation Hub</span>
            </Link>
            <p className="text-gray-600 text-sm max-w-md leading-relaxed pr-8">
              Launch campus initiatives, assemble multidisciplinary squads with AI skills compatibility, and build tomorrow's solutions together in an immersive ecosystem.
            </p>
            <div className="flex items-center gap-4 pt-4">
              {[Twitter, Github, Linkedin].map((Icon, idx) => (
                <a key={idx} href="#" className="w-11 h-11 rounded-full bg-black/5 border border-black/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-[var(--accent-primary)] hover:border-transparent transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_20px_var(--accent-primary-glow)] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Icon size={18} className="relative z-10" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-6">
            <h4 className="text-[var(--text-primary)] font-bold tracking-widest uppercase text-xs flex items-center gap-2">
              <Sparkles size={14} className="text-[var(--accent-secondary)]" /> Platform
            </h4>
            <ul className="space-y-4">
              {['Explore Projects', 'Find Innovators', 'Leaderboard', 'Team Matching'].map((link) => (
                <li key={link}>
                  <Link href="#" className="text-sm text-gray-600 hover:text-[var(--accent-secondary)] transition-colors inline-flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-black/20 group-hover:bg-[var(--accent-secondary)] transition-colors" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-4 space-y-6">
            <h4 className="text-[var(--text-primary)] font-bold tracking-widest uppercase text-xs flex items-center gap-2">
              <Mail size={14} className="text-[var(--accent-secondary)]" /> Connect
            </h4>
            <div className="bg-black/5 border border-black/5 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <p className="text-sm text-gray-600 mb-4 relative z-10">Subscribe to our newsletter for the latest hackathon updates and team requests.</p>
              <div className="flex gap-2 relative z-10">
                <input type="email" placeholder="Your email address" className="bg-white/60 border border-black/10 rounded-lg px-4 py-2.5 text-sm text-gray-800 w-full focus:outline-none focus:border-[var(--accent-primary)] transition-colors placeholder:text-gray-400" />
                <button className="bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white p-2.5 rounded-lg transition-colors shadow-lg">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-6 text-xs text-gray-500 font-medium">
            <span>&copy; {new Date().getFullYear()} Innovation Hub.</span>
            <Link href="#" className="hover:text-gray-800 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-gray-800 transition-colors">Terms</Link>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-xs font-semibold text-green-600">All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
