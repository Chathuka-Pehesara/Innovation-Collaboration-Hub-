'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import {
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  User,
  Star,
  Award,
  ChevronRight,
  Sparkles,
  Activity,
  MessageSquare,
  X,
  FileText,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assigneeId?: string | null;
  createdAt: string;
}

interface TeamMember {
  id: string;
  userId: string;
  role: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
}

interface ActivityItem {
  id: string;
  action: string;
  userId: string;
  createdAt: string;
}

interface TeamData {
  id: string;
  projectId: string;
  tasks: Task[];
  members: TeamMember[];
  activities: ActivityItem[];
}

interface KanbanWorkspaceProps {
  team: TeamData;
  onRefresh: () => void;
  currentUserId?: string;
}

export default function KanbanWorkspace({ team, onRefresh, currentUserId }: KanbanWorkspaceProps) {
  // Modal states
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskStatus, setTaskStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');
  const [taskAssignee, setTaskAssignee] = useState('');

  const [loading, setLoading] = useState(false);

  // Peer Evaluation state
  const [evaluatingMember, setEvaluatingMember] = useState<TeamMember | null>(null);
  const [evalRating, setEvalRating] = useState(5);
  const [evalTeamwork, setEvalTeamwork] = useState(5);
  const [evalTechnical, setEvalTechnical] = useState(5);
  const [evalComment, setEvalComment] = useState('');
  const [evalSubmitting, setEvalSubmitting] = useState(false);

  // Filter state
  const [activeTab, setActiveTab] = useState<'board' | 'members' | 'activity'>('board');

  // Compute metrics
  const totalTasks = team.tasks.length;
  const doneTasks = team.tasks.filter((t) => t.status === 'DONE').length;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      setLoading(true);
      await api.post(`/teams/${team.id}/tasks`, {
        title: taskTitle,
        description: taskDesc,
        status: taskStatus,
        assigneeId: taskAssignee || null,
      });

      setTaskTitle('');
      setTaskDesc('');
      setShowAddTask(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to create task:', err);
      alert('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    try {
      await api.put(`/teams/${team.id}/tasks/${taskId}`, {
        status: newStatus,
      });
      onRefresh();
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/teams/${team.id}/tasks/${taskId}`);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingMember) return;

    try {
      setEvalSubmitting(true);
      await api.post(`/teams/${team.id}/evaluations`, {
        evaluateeId: evaluatingMember.userId,
        rating: evalRating,
        teamworkScore: evalTeamwork,
        technicalScore: evalTechnical,
        comment: evalComment,
      });

      alert('Peer evaluation submitted successfully! +25 XP awarded.');
      setEvaluatingMember(null);
      setEvalComment('');
      onRefresh();
    } catch (err) {
      console.error('Failed to submit evaluation:', err);
      alert('Failed to submit peer evaluation');
    } finally {
      setEvalSubmitting(false);
    }
  };

  const columns: Array<{ id: 'TODO' | 'IN_PROGRESS' | 'DONE'; title: string; color: string; bg: string }> = [
    { id: 'TODO', title: 'To Do', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { id: 'DONE', title: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Workspace Header Banner & Progress */}
      <div className="glass-card p-6 rounded-3xl border border-orange-500/20 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles size={24} className="text-orange-400" />
              Team Workspace & Kanban Board
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Collaborate, assign tasks, track milestones, and evaluate team members
            </p>
          </div>

          <button
            onClick={() => setShowAddTask(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-2xl shadow-lg shadow-orange-500/25 transition-all"
          >
            <Plus size={16} />
            Create Task
          </button>
        </div>

        {/* Milestone Progress Bar */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-white">Project Progress Milestone</span>
            <span className="font-mono text-orange-400 font-bold">
              {doneTasks} / {totalTasks} Tasks Completed ({progressPercent}%)
            </span>
          </div>
          <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border-color)] pb-2">
        <button
          onClick={() => setActiveTab('board')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'board'
              ? 'bg-orange-500 text-white'
              : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
          }`}
        >
          Kanban Board ({totalTasks})
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'members'
              ? 'bg-orange-500 text-white'
              : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
          }`}
        >
          Team Members & Peer Reviews ({team.members.length})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'activity'
              ? 'bg-orange-500 text-white'
              : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
          }`}
        >
          Activity Stream
        </button>
      </div>

      {/* TAB 1: KANBAN BOARD */}
      {activeTab === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => {
            const colTasks = team.tasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="glass-card p-4 rounded-3xl border border-[var(--border-color)] bg-white/5 space-y-4 min-h-[400px] flex flex-col"
              >
                {/* Column Header */}
                <div className={`p-3 rounded-2xl border ${col.bg} flex justify-between items-center`}>
                  <h3 className={`font-bold text-sm ${col.color}`}>{col.title}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-black/30 text-white">
                    {colTasks.length}
                  </span>
                </div>

                {/* Task Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 rounded-2xl bg-black/40 border border-[var(--border-color)] space-y-3 hover:border-orange-500/30 transition-all group relative"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-white text-sm leading-snug">{task.title}</h4>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity p-1"
                          title="Delete Task"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {task.description && (
                        <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{task.description}</p>
                      )}

                      {/* Controls to Move Status */}
                      <div className="flex justify-between items-center pt-2 border-t border-white/5 text-xs">
                        <span className="text-[10px] text-gray-500 font-mono">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </span>

                        <div className="flex gap-1">
                          {col.id !== 'TODO' && (
                            <button
                              onClick={() =>
                                handleUpdateTaskStatus(
                                  task.id,
                                  col.id === 'DONE' ? 'IN_PROGRESS' : 'TODO'
                                )
                              }
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] text-[var(--text-secondary)]"
                            >
                              ← Move Back
                            </button>
                          )}
                          {col.id !== 'DONE' && (
                            <button
                              onClick={() =>
                                handleUpdateTaskStatus(
                                  task.id,
                                  col.id === 'TODO' ? 'IN_PROGRESS' : 'DONE'
                                )
                              }
                              className="px-2 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded text-[10px] font-bold"
                            >
                              Next →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="text-center py-12 text-xs text-[var(--text-secondary)] border border-dashed border-white/10 rounded-2xl">
                      No tasks in {col.title}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: TEAM MEMBERS & PEER REVIEWS */}
      {activeTab === 'members' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.members.map((member) => {
            const isMe = member.userId === currentUserId;
            return (
              <div
                key={member.id}
                className="glass-card p-6 rounded-3xl border border-[var(--border-color)] bg-white/5 space-y-4 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center font-bold text-orange-400 border border-orange-500/30 text-lg">
                    {member.user?.name ? member.user.name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">
                      {member.user?.name || `Member (${member.userId.slice(0, 6)})`}
                    </h4>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 mt-1">
                      {member.role}
                    </span>
                  </div>
                </div>

                {!isMe ? (
                  <button
                    onClick={() => setEvaluatingMember(member)}
                    className="w-full py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <Star size={14} className="fill-amber-300" />
                    Evaluate Peer (+25 XP)
                  </button>
                ) : (
                  <div className="py-2 text-center text-xs text-gray-500 font-medium bg-black/20 rounded-xl">
                    (You)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: ACTIVITY STREAM */}
      {activeTab === 'activity' && (
        <div className="glass-card p-6 rounded-3xl border border-[var(--border-color)] bg-white/5 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity size={20} className="text-orange-400" />
            Team Activity Log
          </h3>
          <div className="divide-y divide-[var(--border-color)]">
            {team.activities && team.activities.length > 0 ? (
              team.activities.map((act) => (
                <div key={act.id} className="py-3 flex justify-between items-center text-xs">
                  <div className="text-gray-300">{act.action}</div>
                  <div className="text-[10px] font-mono text-[var(--text-secondary)]">
                    {new Date(act.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[var(--text-secondary)] py-6 text-center">No recent team activities.</p>
            )}
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 rounded-3xl border border-orange-500/30 bg-gray-900 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Create New Task</h3>
              <button onClick={() => setShowAddTask(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design User Profile UI"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Details about task requirements..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Initial Status</label>
                <select
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value as any)}
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Completed</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl"
                >
                  {loading ? 'Saving...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PEER EVALUATION MODAL */}
      {evaluatingMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 rounded-3xl border border-amber-500/30 bg-gray-900 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Star className="text-amber-400 fill-amber-400" size={20} />
                Evaluate {evaluatingMember.user?.name || 'Member'}
              </h3>
              <button onClick={() => setEvaluatingMember(null)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitEvaluation} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1">Overall Rating (1 - 5 Stars)</label>
                <select
                  value={evalRating}
                  onChange={(e) => setEvalRating(Number(e.target.value))}
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 - Outstanding)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                  <option value={3}>⭐⭐⭐ (3 - Satisfactory)</option>
                  <option value={2}>⭐⭐ (2 - Needs Improvement)</option>
                  <option value={1}>⭐ (1 - Unsatisfactory)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Teamwork & Collaboration (1 - 5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={evalTeamwork}
                  onChange={(e) => setEvalTeamwork(Number(e.target.value))}
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Technical Contribution (1 - 5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={evalTechnical}
                  onChange={(e) => setEvalTechnical(Number(e.target.value))}
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Peer Feedback Comment</label>
                <textarea
                  rows={3}
                  placeholder="Share constructive feedback about technical skill or communication..."
                  value={evalComment}
                  onChange={(e) => setEvalComment(e.target.value)}
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEvaluatingMember(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={evalSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl"
                >
                  {evalSubmitting ? 'Submitting...' : 'Submit Evaluation (+25 XP)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
