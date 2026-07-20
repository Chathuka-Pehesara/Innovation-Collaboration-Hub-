'use client';

import { Users, Brain, FolderPlus, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ActivityFeed() {
  const activities = [
    {
      id: 1,
      type: 'match',
      user: 'Sarah Chen (AI)',
      action: 'joined Project "Eco-Mapper"',
      time: '10 mins ago',
      icon: Users,
      color: 'from-indigo-500 to-blue-500',
      glow: 'shadow-[0_0_15px_rgba(99,102,241,0.3)]',
      bg: 'bg-indigo-500/10'
    },
    {
      id: 2,
      type: 'skill',
      user: 'You',
      action: 'validated Python and React skills with AI Engine',
      time: '1 hour ago',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      glow: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]',
      bg: 'bg-purple-500/10'
    },
    {
      id: 3,
      type: 'project',
      user: 'Marcus Vance (Security)',
      action: 'created a new project "Auth-Sentinel"',
      time: '4 hours ago',
      icon: FolderPlus,
      color: 'from-blue-500 to-cyan-500',
      glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',
      bg: 'bg-blue-500/10'
    },
    {
      id: 4,
      type: 'mentor',
      user: 'AI Mentor (Bot)',
      action: 'suggested recommendations on "Eco-Mapper" requirements',
      time: '1 day ago',
      icon: Lightbulb,
      color: 'from-pink-500 to-rose-500',
      glow: 'shadow-[0_0_15px_rgba(236,72,153,0.3)]',
      bg: 'bg-pink-500/10'
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
      {activities.map((act) => {
        const Icon = act.icon;
        return (
          <motion.div 
            key={act.id} 
            variants={item}
            className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--surface-elevated)]/30 border border-[var(--border-color)] hover:border-[var(--accent-primary)]/40 hover:bg-[var(--surface-elevated)]/80 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-300 group relative overflow-hidden"
          >
            {/* Hover Background Sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)]/5 to-transparent -translate-x-[100%] group-hover:translate-x-0 transition-transform duration-500" />
            
            <div className={`relative shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${act.bg} border border-[var(--border-color)] group-hover:border-transparent group-hover:scale-110 transition-all duration-300 z-10`}>
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${act.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${act.color} opacity-0 group-hover:opacity-100 blur-[8px] transition-opacity duration-300`} />
              <Icon size={20} className="relative z-10 text-[var(--text-secondary)] group-hover:text-white transition-colors duration-300" />
            </div>
            
            <div className="flex-1 min-w-0 relative z-10">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed group-hover:text-[var(--text-primary)] transition-colors duration-300">
                <span className="font-bold text-[var(--text-primary)] tracking-wide">{act.user}</span> {act.action}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-secondary)]/30 group-hover:bg-[var(--accent-primary)] transition-colors duration-300" />
                <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-secondary)]/70">{act.time}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
