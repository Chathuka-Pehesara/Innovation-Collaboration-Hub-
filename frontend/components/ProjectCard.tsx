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
          <h3 className="text-xl font-bold font-display text-slate-900 line-clamp-1">
            <Link href={`/projects/${project.id}`} className="hover:text-blue-600 transition-colors">
              {project.title}
            </Link>
          </h3>
          <StatusBadge status={project.status} />
        </div>
        
        <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {project.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {project.category && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
              {project.category.name}
            </span>
          )}
          {project.tags?.map(t => (
            <span key={t.tagId} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
              #{t.tag.name}
            </span>
          ))}
          {project.skills?.map(s => (
            <span key={s.skillId} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-600 border border-purple-100">
              {s.skill.name}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200/60">
          <div className="text-xs text-slate-500">
            {new Date(project.createdAt).toLocaleDateString()}
          </div>
          <Link href={`/projects/${project.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            View Details &rarr;
          </Link>
        </div>
      </div>
    </GlowCard>
  );
}
