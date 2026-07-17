'use client';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface SkillBadgeProps {
  name: string;
  level?: string;
  score?: number;
  className?: string;
}

export function SkillBadge({ name, level, score, className = '' }: SkillBadgeProps) {
  const isGamified = score !== undefined;

  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -2 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm shadow-sm transition-all duration-300 ${
        isGamified 
          ? 'bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 text-orange-900 hover:shadow-orange-500/20 hover:border-orange-500/50 bg-white' 
          : 'bg-white/50 border border-orange-200 text-orange-950/80 hover:bg-white/80'
      } ${className}`}
    >
      <span className="text-sm font-semibold tracking-wide flex items-center gap-1.5">
        {isGamified && <Sparkles className="w-3.5 h-3.5 text-orange-500" />}
        {name}
      </span>
      {(isGamified || level) && (
        <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider font-bold ${
          isGamified 
            ? 'bg-orange-500/20 text-orange-700 border-orange-500/30' 
            : 'bg-orange-100 text-orange-800 border-orange-200'
        }`}>
          {isGamified ? `${score} XP` : level}
        </span>
      )}
    </motion.div>
  );
}
