'use client';
import { motion } from 'framer-motion';
import { 
  Sparkles, Code2, Coffee, Terminal, Atom, Server, Cloud, Boxes, FileCode2, FileCode, Github, Database, Flame, Share2
} from 'lucide-react';

interface SkillBadgeProps {
  name: string;
  level?: string;
  score?: number;
  className?: string;
}

const getSkillIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('java') && !n.includes('javascript')) return Coffee;
  if (n.includes('python')) return Terminal;
  if (n.includes('react')) return Atom;
  if (n.includes('node')) return Server;
  if (n.includes('aws')) return Cloud;
  if (n.includes('docker')) return Boxes;
  if (n.includes('typescript')) return FileCode2;
  if (n.includes('javascript') || n === 'js') return FileCode;
  if (n.includes('html')) return Code2;
  if (n.includes('css')) return Code2;
  if (n.includes('github') || n.includes('git')) return Github;
  if (n.includes('mongo')) return Database;
  if (n.includes('firebase')) return Flame;
  if (n.includes('graphql')) return Share2;
  
  return Code2; // fallback
};

export function SkillBadge({ name, level, score, className = '' }: SkillBadgeProps) {
  const isGamified = score !== undefined;
  const SkillIcon = getSkillIcon(name);

  const getTierConfig = (xp: number) => {
    if (xp >= 100) return { tier: 'Platinum', bg: 'from-slate-200 via-white to-slate-300', text: 'text-slate-800', border: 'border-slate-300', iconColor: 'text-slate-600' };
    if (xp >= 75) return { tier: 'Gold', bg: 'from-amber-300 via-yellow-200 to-amber-500', text: 'text-amber-950', border: 'border-amber-400', iconColor: 'text-amber-800' };
    if (xp >= 50) return { tier: 'Silver', bg: 'from-gray-200 via-gray-100 to-gray-400', text: 'text-gray-900', border: 'border-gray-400', iconColor: 'text-gray-700' };
    if (xp >= 25) return { tier: 'Bronze', bg: 'from-orange-300 via-orange-200 to-orange-500', text: 'text-orange-950', border: 'border-orange-400', iconColor: 'text-orange-900' };
    return { tier: 'Novice', bg: 'from-orange-50 to-orange-100', text: 'text-orange-900', border: 'border-orange-200', iconColor: 'text-orange-500' };
  };

  const config = isGamified ? getTierConfig(score!) : null;

  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -2 }}
      className={`relative inline-flex flex-col items-center justify-center p-3 min-w-[100px] rounded-2xl backdrop-blur-sm shadow-sm transition-all duration-300 overflow-hidden group ${
        isGamified 
          ? `bg-gradient-to-br ${config!.bg} border ${config!.border}`
          : 'bg-white/50 border border-orange-200 text-orange-950/80 hover:bg-white/80'
      } ${className}`}
    >
      {isGamified && (
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      )}
      
      {/* Skill Icon prominently displayed */}
      <div className={`mb-2 ${isGamified ? config!.iconColor : 'text-orange-500'}`}>
        <SkillIcon className="w-8 h-8 drop-shadow-md" />
      </div>
      
      <span className={`text-sm font-extrabold tracking-wide flex items-center gap-1.5 z-10 ${isGamified ? config!.text : ''}`}>
        {name}
      </span>
      
      {(isGamified || level) && (
        <span className={`mt-1 text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold z-10 ${
          isGamified 
            ? `bg-white/40 ${config!.text} border-white/50 shadow-sm` 
            : 'bg-orange-100 text-orange-800 border-orange-200'
        }`}>
          {isGamified ? `${config!.tier} • ${score} XP` : level}
        </span>
      )}
    </motion.div>
  );
}
