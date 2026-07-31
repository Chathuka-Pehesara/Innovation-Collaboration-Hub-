'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Award,
  MessageSquare,
  Sparkles,
  FileCheck,
  Send,
} from 'lucide-react';

interface ProposalReview {
  id: string;
  reviewerId: string;
  status: string;
  academicScore?: number | null;
  feedback: string;
  createdAt: string;
}

interface MentorProposalReviewProps {
  projectId: string;
  currentStatus: string;
  reviews?: ProposalReview[];
  userRole?: string;
  onRefresh: () => void;
}

export default function MentorProposalReview({
  projectId,
  currentStatus,
  reviews = [],
  userRole,
  onRefresh,
}: MentorProposalReviewProps) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'Approved' | 'Changes_Requested' | 'Rejected'>('Approved');
  const [academicScore, setAcademicScore] = useState<number>(85);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canReview = userRole === 'mentor' || userRole === 'admin';

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post(`/projects/${projectId}/reviews`, {
        status: reviewStatus,
        academicScore,
        feedback,
      });

      alert('Proposal evaluation submitted successfully!');
      setShowReviewModal(false);
      setFeedback('');
      onRefresh();
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('Failed to submit evaluation review');
    } finally {
      setSubmitting(false);
    }
  };

  const latestReview = reviews.length > 0 ? reviews[0] : null;

  return (
    <div className="glass-card p-6 rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
            <FileCheck size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Lecturer & Mentor Proposal Review
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Academic evaluation, rubric scoring, and status approval workflow
            </p>
          </div>
        </div>

        {canReview && (
          <button
            onClick={() => setShowReviewModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-500/25 transition-all"
          >
            <Sparkles size={16} />
            Evaluate Proposal
          </button>
        )}
      </div>

      {/* Latest Status & Feedback Card */}
      {latestReview ? (
        <div className="p-5 rounded-2xl bg-black/40 border border-[var(--border-color)] space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              {latestReview.status === 'Approved' && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 size={15} /> Proposal Approved
                </span>
              )}
              {latestReview.status === 'Changes_Requested' && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <AlertTriangle size={15} /> Revision Requested
                </span>
              )}
              {latestReview.status === 'Rejected' && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                  <XCircle size={15} /> Proposal Rejected
                </span>
              )}
            </div>

            {latestReview.academicScore !== null && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                <Award size={16} />
                Academic Rubric Grade: {latestReview.academicScore} / 100
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
              <MessageSquare size={14} className="text-indigo-400" />
              Mentor Feedback Notes:
            </div>
            <p className="text-sm text-gray-200 leading-relaxed italic bg-white/5 p-4 rounded-xl border border-white/10">
              "{latestReview.feedback || 'No written comments provided.'}"
            </p>
            <div className="text-[10px] text-right text-gray-500 font-mono">
              Reviewed on {new Date(latestReview.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-black/20 border border-white/10 text-center space-y-2">
          <Clock className="mx-auto text-indigo-400" size={24} />
          <p className="text-xs text-gray-400 font-medium">
            Proposal is awaiting evaluation from an assigned Mentor or Lecturer.
          </p>
        </div>
      )}

      {/* Review History */}
      {reviews.length > 1 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Evaluation History</h4>
          <div className="space-y-2">
            {reviews.slice(1).map((rev) => (
              <div key={rev.id} className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs flex justify-between items-center">
                <span className="font-bold text-white">{rev.status} ({rev.academicScore || 'N/A'}/100)</span>
                <span className="text-[10px] font-mono text-gray-500">{new Date(rev.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MENTOR EVALUATION MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 rounded-3xl border border-indigo-500/30 bg-gray-900 w-full max-w-md space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCheck className="text-indigo-400" size={20} />
                Evaluate Proposal
              </h3>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 font-bold mb-1">Decision Status</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value as any)}
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-bold"
                >
                  <option value="Approved">✅ Approve Proposal</option>
                  <option value="Changes_Requested">⚠️ Request Revisions / Changes</option>
                  <option value="Rejected">❌ Reject Proposal</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Academic Rubric Grade (1 - 100)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={academicScore}
                  onChange={(e) => setAcademicScore(Number(e.target.value))}
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Detailed Mentor Feedback & Notes</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide constructive feedback regarding project feasibility, scope, and technical stack..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Send size={14} />
                  {submitting ? 'Submitting...' : 'Submit Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
