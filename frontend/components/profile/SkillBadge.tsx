'use client';

interface SkillBadgeProps {
  name: string;
  level?: string;
  className?: string;
}

export function SkillBadge({ name, level, className = '' }: SkillBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 ${className}`}>
      <span>{name}</span>
      {level && (
        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/10 uppercase tracking-wide">
          {level}
        </span>
      )}
    </div>
  );
}
