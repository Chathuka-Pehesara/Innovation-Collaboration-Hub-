'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Toast from '@/components/Toast';

interface CommitStats {
  userId: string;
  userName: string;
  avatarUrl: string | null;
  commitCount: number;
  additions: number;
  deletions: number;
  filesChanged: number;
  lastCommitDate: string;
  rank: number;
}

interface CommitAnalytics {
  projectId: string;
  totalCommits: number;
  totalContributors: number;
  topContributors: CommitStats[];
  recentCommits: any[];
}

interface CommitRankingsProps {
  projectId: string;
}

export default function CommitRankings({ projectId }: CommitRankingsProps) {
  const [analytics, setAnalytics] = useState<CommitAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rankings' | 'timeline'>('rankings');

  useEffect(() => {
    const fetchCommitAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get(`/projects/${projectId}/commits/analytics`);
        setAnalytics(data);
      } catch (err: any) {
        const message =
          err.response?.data?.error || 'Failed to load commit analytics';
        setError(message);
        console.error('Error fetching commit analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchCommitAnalytics();
    }
  }, [projectId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-400';
    return 'text-gray-300';
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Toast
        message={error}
        type="error"
        duration={5000}
        onClose={() => setError(null)}
      />
    );
  }

  if (!analytics) {
    return (
      <div className="p-8 text-center text-gray-500">
        No commit data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-indigo-200">
          <div className="text-sm font-semibold text-indigo-600 mb-2">
            Total Commits
          </div>
          <div className="text-3xl font-bold text-indigo-900">
            {analytics.totalCommits}
          </div>
          <p className="text-xs text-indigo-600 mt-2">Across all contributors</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
          <div className="text-sm font-semibold text-purple-600 mb-2">
            Contributors
          </div>
          <div className="text-3xl font-bold text-purple-900">
            {analytics.totalContributors}
          </div>
          <p className="text-xs text-purple-600 mt-2">Active team members</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
          <div className="text-sm font-semibold text-green-600 mb-2">
            Avg Commits
          </div>
          <div className="text-3xl font-bold text-green-900">
            {analytics.totalContributors > 0
              ? Math.round(analytics.totalCommits / analytics.totalContributors)
              : 0}
          </div>
          <p className="text-xs text-green-600 mt-2">Per contributor</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('rankings')}
          className={`px-4 py-3 font-semibold transition-all ${
            activeTab === 'rankings'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🏆 Top Contributors
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-3 font-semibold transition-all ${
            activeTab === 'timeline'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📅 Recent Activity
        </button>
      </div>

      {/* Rankings Tab */}
      {activeTab === 'rankings' && (
        <div className="space-y-3">
          {analytics.topContributors.length > 0 ? (
            analytics.topContributors.map((contributor, index) => (
              <div
                key={contributor.userId}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
              >
                {/* Rank Medal */}
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 font-bold text-lg ${getMedalColor(
                    contributor.rank
                  )}`}
                >
                  {getMedalIcon(contributor.rank)}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    {/* User Avatar */}
                    {contributor.avatarUrl ? (
                      <img
                        src={contributor.avatarUrl}
                        alt={contributor.userName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {contributor.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* User Name */}
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900 block">
                        {contributor.userName}
                      </span>
                      <span className="text-xs text-gray-500">
                        ID: {contributor.userId.slice(0, 8)}...
                      </span>
                    </div>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold">
                      Rank #{contributor.rank}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>💾 {contributor.commitCount} commits</span>
                    <span>📝 {contributor.filesChanged} files changed</span>
                    <span className="text-green-600">+{contributor.additions}</span>
                    <span className="text-red-600">-{contributor.deletions}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Last commit: {formatDate(contributor.lastCommitDate)} at{' '}
                    {formatTime(contributor.lastCommitDate)}
                  </div>
                </div>

                {/* Commit Count Badge */}
                <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-center min-w-max">
                  <div className="text-2xl font-bold">
                    {contributor.commitCount}
                  </div>
                  <div className="text-xs font-semibold">commits</div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
              No commits yet. Start making contributions! 🚀
            </div>
          )}
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="space-y-2">
          {analytics.recentCommits.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {analytics.recentCommits.map((commit, index) => (
                <div
                  key={commit.id}
                  className="flex gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:shadow-md transition-all"
                >
                  {/* Timeline Dot */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-3 h-3 bg-indigo-600 rounded-full mt-2" />
                    {index < analytics.recentCommits.length - 1 && (
                      <div className="w-0.5 h-12 bg-indigo-200" />
                    )}
                  </div>

                  {/* Commit Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">
                        {commit.message || 'Untitled commit'}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        by {commit.userName || commit.userId.slice(0, 8)}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-600">
                      <span>📝 {commit.filesChanged} files</span>
                      <span className="text-green-600">+{commit.additions}</span>
                      <span className="text-red-600">-{commit.deletions}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {formatDate(commit.createdAt)} at{' '}
                      {formatTime(commit.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
              No commit activity yet 📭
            </div>
          )}
        </div>
      )}
    </div>
  );
}
