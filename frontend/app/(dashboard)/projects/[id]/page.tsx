'use client';

<<<<<<< Updated upstream
import { useParams } from 'next/navigation';
=======
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { evaluateIdeaApi, IdeaEvaluationResponse } from '@/lib/api/aiApi';
import IdeaEvaluator from '@/components/ai/IdeaEvaluator';
import StatusBadge from '@/components/StatusBadge';
import Toast from '@/components/Toast';
import CommitRankings from '@/components/cards/CommitRankings';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  teamSize: number;
  createdAt: string;
  category?: { name: string } | null;
  tags?: Array<{ tag: { name: string } }>;
  skills?: Array<{ skill: { name: string } }>;
  aiResult?: { score: number; suggestions: string } | null;
}
>>>>>>> Stashed changes

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Project Details</h1>
        <p className="text-gray-400 text-sm">View and manage information for project workspace {id}.</p>
      </div>
<<<<<<< Updated upstream
      <div className="glass-panel p-12 rounded-2xl text-center text-gray-500 text-sm">
        Project detailed information, milestones, and request actions will appear here.
=======

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Metadata Cards */}
          <div className="glass-card p-6 border border-white/5 bg-white/[0.01] space-y-4">
            <h3 className="text-base font-bold text-white pb-3 border-b border-white/5">Workspace Metadata</h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Target Team Size:</span>
                <span className="text-white font-bold">{project.teamSize} members</span>
              </div>
              
              <div className="space-y-2">
                <span className="text-gray-400 block">Project Tags:</span>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags?.map((t) => (
                    <span key={t.tag.name} className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/10 text-[10px]">
                      #{t.tag.name}
                    </span>
                  ))}
                  {(!project.tags || project.tags.length === 0) && (
                    <span className="text-gray-500 italic text-[11px]">No tags defined</span>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <span className="text-gray-400 block">Required Skillsets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {project.skills?.map((s) => (
                    <span key={s.skill.name} className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/10 text-[10px] font-medium">
                      {s.skill.name}
                    </span>
                  ))}
                  {(!project.skills || project.skills.length === 0) && (
                    <span className="text-gray-500 italic text-[11px]">No skill requirements defined</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - description and AI analysis */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description Section */}
          <div className="glass-card p-6 border border-white/5 bg-white/[0.01] space-y-3">
            <h3 className="text-base font-bold text-white pb-3 border-b border-white/5">Project Description Outline</h3>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
          </div>

          {/* AI Scorecard Card */}
          <div className="glass-card p-6 border border-white/5 bg-white/[0.01]">
            <h3 className="text-base font-bold text-white pb-3 border-b border-white/5 mb-6">AI Architecture Analysis</h3>
            
            {evaluation ? (
              <IdeaEvaluator evaluation={evaluation} />
            ) : (
              <div className="text-center py-10 space-y-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto text-xl">
                  🪄
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h4 className="text-white font-bold text-sm">Analyze Architecture Pitch</h4>
                  <p className="text-gray-400 text-xs">
                    Synthesize this project details with standard campus parameters to evaluate strengths, weaknesses, and stack.
                  </p>
                </div>
                <button
                  onClick={handleRunEvaluation}
                  disabled={evaluating}
                  className="btn-primary px-6 py-2.5 text-xs mx-auto"
                >
                  {evaluating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Evaluating Pitch...
                    </>
                  ) : (
                    <>🪄 Run AI Review</>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Commit Rankings Card */}
          <div className="glass-card p-6 border border-white/5 bg-white/[0.01]">
            <h3 className="text-base font-bold text-white pb-3 border-b border-white/5 mb-6">📊 Contributor Commit Rankings</h3>
            <CommitRankings projectId={project.id} />
          </div>
        </div>
>>>>>>> Stashed changes
      </div>
    </div>
  );
}
