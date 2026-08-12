'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import StatusBadge from '@/components/StatusBadge';
import { motion } from 'framer-motion';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  teamSize: number;
  ownerId: string;
  createdAt: string;
  category?: { name: string } | null;
  tags?: Array<{ tag: { name: string } }>;
  skills?: Array<{ skill: { name: string } }>;
}

export default function ProjectsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserProjects() {
      try {
        setLoading(true);
        const { data } = await api.get('/projects');
        const allProjects = data.data || [];
        
        // Filter projects where current user is the owner
        const userProjects = allProjects.filter((p: Project) => p.ownerId === user?.id);
        setProjects(userProjects);
      } catch (err) {
        console.error('Failed to load user projects:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) loadUserProjects();
  }, [user?.id]);

  return (
    <div className="space-y-6 text-left">
      {/* Header Panel */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Workspaces</h1>
          <p className="text-gray-400 text-sm">Manage project parameters, invite lists, and AI reports.</p>
        </div>
        <button
          onClick={() => router.push('/projects/new')}
          className="btn-primary text-sm py-2.5 px-5 shrink-0"
        >
          ➕ Start Project
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-sm font-medium">Opening workspaces...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-panel p-16 rounded-2xl text-center space-y-4">
          <div className="text-4xl">💡</div>
          <div className="space-y-2 max-w-sm mx-auto">
            <h3 className="text-white font-bold text-base">No active workspaces</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              You haven't registered any project ideas yet. Start a new workspace to assemble a squad and consult AI mentors.
            </p>
          </div>
          <button
            onClick={() => router.push('/projects/new')}
            className="btn-primary py-2 px-4 text-xs mx-auto"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj, index) => (
            <motion.div
              key={proj.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1, 
                type: 'spring', 
                stiffness: 100 
              }}
              className="glass-card flex flex-col justify-between border border-white/10 bg-black/20 backdrop-blur-xl hover:bg-black/40 p-6 transition-all duration-300 relative group spotlight-card overflow-hidden"
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {proj.title}
                  </h3>
                  <StatusBadge status={proj.status} />
                </div>

                <p className="text-gray-400 text-xs line-clamp-3 mb-4 leading-relaxed">
                  {proj.description}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {proj.category && (
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 text-[10px] font-semibold">
                      {proj.category.name}
                    </span>
                  )}
                  {proj.tags?.slice(0, 3).map((t) => (
                    <span key={t.tag.name} className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/10 text-[10px]">
                      #{t.tag.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                <span className="text-[10px] text-gray-500">
                  Target: <strong>{proj.teamSize} members</strong>
                </span>
                <button
                  onClick={() => router.push(`/projects/${proj.id}`)}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  Manage Workspace &rarr;
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
