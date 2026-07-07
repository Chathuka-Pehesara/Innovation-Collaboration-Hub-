'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { evaluateIdeaApi, IdeaEvaluationResponse } from '@/lib/api/aiApi';
import IdeaEvaluator from '@/components/ai/IdeaEvaluator';
import StatusBadge from '@/components/StatusBadge';
import Toast from '@/components/Toast';

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

export default function ExplorePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // AI evaluation states
  const [evaluating, setEvaluating] = useState(false);
  const [activeEvaluation, setActiveEvaluation] = useState<IdeaEvaluationResponse | null>(null);
  
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/projects', {
        params: { search: searchQuery || undefined }
      });
      setProjects(data.data || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchQuery]);

  const handleOpenEvaluation = async (project: Project) => {
    setSelectedProject(project);
    setActiveEvaluation(null);
    
    // Check if project already has a stored AI result
    if (project.aiResult) {
      try {
        const parsedSuggestions = JSON.parse(project.aiResult.suggestions);
        setActiveEvaluation({
          overall_score: project.aiResult.score,
          feasibility_score: Math.round(project.aiResult.score * 0.95), // derived for mock display
          feasibility_rationale: 'Feasibility checked against normal student workload constraints.',
          innovation_score: Math.round(project.aiResult.score * 0.98),
          innovation_rationale: 'Innovation rating calculated based on uniqueness and campus utility.',
          impact_score: Math.round(project.aiResult.score * 1.02),
          impact_rationale: 'Impact measured on potential value of student life optimization.',
          strengths: parsedSuggestions.filter((_: any, i: number) => i % 2 === 0).slice(0, 4),
          weaknesses: ['Requires initial student buy-in.', 'Requires database query caching mechanisms.'],
          recommendations: parsedSuggestions.filter((_: any, i: number) => i % 2 !== 0).slice(0, 4),
          suggested_tech_stack: project.skills?.map(s => s.skill.name) || ['React', 'Node.js']
        });
      } catch (e) {
        console.error('Failed to parse existing AI suggestions:', e);
      }
    }
  };

  const handleRunAIEvaluation = async () => {
    if (!selectedProject) return;
    try {
      setEvaluating(true);
      const res = await evaluateIdeaApi(selectedProject.title, selectedProject.description);
      setActiveEvaluation(res);
      
      // Update local projects list state if needed
      setProjects(prev => prev.map(p => {
        if (p.id === selectedProject.id) {
          return {
            ...p,
            aiResult: { score: res.overall_score, suggestions: JSON.stringify(res.recommendations) }
          };
        }
        return p;
      }));

      // Optionally save to backend
      await api.post(`/projects/${selectedProject.id}/ai-result`, {
        score: res.overall_score,
        suggestions: res.recommendations
      });
      
      setToastType('success');
      setToastMsg('AI analysis complete! Scorecard updated.');
    } catch (err) {
      console.error(err);
      setToastType('error');
      setToastMsg('AI service evaluation request failed.');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <Toast
          message={toastMsg}
          type={toastType}
          onClose={() => setToastMsg(null)}
        />
      )}

      {/* Header and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Explore Campus Projects</h1>
          <p className="text-gray-400 text-sm">Discover innovative student-led projects and review their AI compatibility metrics.</p>
        </div>
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full glass-input text-sm px-4 py-2.5"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-sm font-medium">Scanning project directory...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-panel p-16 rounded-2xl text-center text-gray-500 text-sm">
          No projects found. Be the first to start a project!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="glass-card flex flex-col justify-between border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] p-6 transition-all duration-300 relative group"
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

                {/* Category & Badges */}
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

              {/* Card Footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                <span className="text-[10px] text-gray-500">
                  Team size: <strong>{proj.teamSize}</strong>
                </span>
                <button
                  onClick={() => handleOpenEvaluation(proj)}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  Analyze Idea &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Idea Evaluation Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-4xl max-h-[85vh] bg-[#161822] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 bg-[#1C1F2E]/40 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-white truncate max-w-lg">{selectedProject.title}</h2>
                <p className="text-xs text-gray-400 mt-1">Idea refinement and capability gap analytics</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {/* Concept description */}
              <div className="space-y-2">
                <h4 className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">Concept Brief</h4>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                  {selectedProject.description}
                </p>
              </div>

              {/* Required Skills */}
              {selectedProject.skills && selectedProject.skills.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">Desired Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.skills.map((s) => (
                      <span key={s.skill.name} className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/10 text-xs font-medium">
                        {s.skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Evaluation scorecards */}
              {activeEvaluation ? (
                <div className="border-t border-white/5 pt-6">
                  <IdeaEvaluator evaluation={activeEvaluation} />
                </div>
              ) : (
                <div className="border-t border-white/5 pt-12 pb-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto text-2xl animate-pulse">
                    💡
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <h4 className="text-white font-bold text-base">Unanalyzed Concept</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      This project has not been run through the AI evaluator yet. Analyze the concept now to generate scorecards, feasibility assessments, weaknesses, and a recommended tech stack.
                    </p>
                  </div>
                  <button
                    onClick={handleRunAIEvaluation}
                    disabled={evaluating}
                    className="btn-primary px-8 py-3 text-sm mx-auto"
                  >
                    {evaluating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Analyzing Pitch...
                      </>
                    ) : (
                      <>🪄 Evaluate with AI</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
