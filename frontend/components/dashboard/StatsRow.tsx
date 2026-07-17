'use client';

import Counter from '@/components/ui/Counter';
import { motion } from 'framer-motion';

export default function StatsRow() {
  const stats = [
    { label: 'Total Projects', value: '12', change: '+2 this week', icon: '📁', color: 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/20 shadow-[0_0_15px_var(--accent-primary-glow)]' },
    { label: 'Team Matches', value: '84%', change: 'High compatibility', icon: '🤝', color: 'text-green-400 bg-green-500/10 border-green-500/20 shadow-[0_0_15px_rgba(74,222,128,0.15)]' },
    { label: 'Verified Skills', value: '38', change: 'Across 6 categories', icon: '🧠', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-[0_0_15px_rgba(192,132,252,0.15)]' },
    { label: 'Mentors Active', value: '4', change: 'Online now', icon: '💬', color: 'text-[var(--accent-secondary)] bg-[var(--accent-secondary)]/10 border-[var(--accent-secondary)]/20 shadow-[0_0_15px_var(--accent-secondary-glow)]' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <motion.div 
          key={idx} 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: idx * 0.1, type: "spring" }}
          className="glass-card p-6 flex items-center justify-between group spotlight-card cursor-default overflow-hidden"
        >
          <div className="space-y-1 relative z-10">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
            <h4 className="text-4xl font-extrabold text-[var(--text-primary)] font-display tracking-tight drop-shadow-sm">
              <Counter value={stat.value} />
            </h4>
            <p className="text-xs text-gray-500 font-medium mt-2 group-hover:text-gray-700 transition-colors">{stat.change}</p>
          </div>
          <div className={`text-3xl p-3 border rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 relative z-10 ${stat.color}`}>
            {stat.icon}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
