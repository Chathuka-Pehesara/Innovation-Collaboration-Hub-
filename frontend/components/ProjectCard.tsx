'use client';

import Link from 'next/link';
import StatusBadge from './StatusBadge';
import GlowCard from './ui/GlowCard';

type ProjectLike = {
  id: string | number;
  title: string;
  status: string;
  description: string;
  category?: { name: string } | null;
  createdAt: string | Date;
  tags?: Array<{ tagId: string | number; tag: { name: string } }>;
  skills?: Array<{ skillId: string | number; skill: { name: string } }>;
};

export default function ProjectCard({ project, index = 0 }: { project: ProjectLike; index?: number }) {
  const delayClass = `delay-${(index % 3 + 1) * 100}`;
  return (
    <GlowCard className={`overflow-hidden p-0 fade-in-up ${delayClass}`} tiltEffect={true}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold font-display text-[var(--text-primary)] line-clamp-1 group-hover:text-[var(--accent-secondary)] transition-colors">
            <Link href={`/projects/${project.id}`}>
              {project.title}
            </Link>
          </h3>
          <StatusBadge status={project.status} />
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
           {project.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {project.category && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-black/5 text-gray-700 border border-black/5 shadow-[0_0_10px_rgba(0,0,0,0.05)]">
              {project.category.name}
            </span>
          )}
          {project.tags?.map(t => (
            <span key={t.tagId} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--accent-primary)]/10 text-[var(--accent-secondary)] border border-[var(--accent-primary)]/20 shadow-[0_0_10px_var(--accent-primary-glow)]">
              #{t.tag.name}
            </span>
          ))}
          {project.skills?.map(s => (
            <span key={s.skillId} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.15)]">
              {s.skill.name}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-black/5 group-hover:border-[var(--accent-primary)]/20 transition-colors">
          <div className="text-xs text-gray-500 font-medium">
            {new Date(project.createdAt).toLocaleDateString()}
          </div>
          <Link href={`/projects/${project.id}`} className="text-sm font-bold text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors flex items-center gap-1 drop-shadow-[0_0_8px_var(--accent-primary-glow)]">
            View Details &rarr;
          </Link>
        </div>
      </div>
    </GlowCard>
  );
}
