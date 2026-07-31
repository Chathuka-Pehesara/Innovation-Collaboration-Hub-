'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { api } from '@/lib/api';
import {
  Shield,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  FolderKanban,
  TrendingUp,
  UserCheck,
  Activity,
  BarChart3,
  Sparkles,
  RefreshCw,
  Mail,
  Award,
  Layers,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'mentor' | 'admin';
  specialization: string | null;
  avatarUrl: string | null;
  xp: number;
  level: number;
  isVerified: boolean;
  createdAt: string;
  skillsCount?: number;
  portfolioCount?: number;
}

interface AnalyticsData {
  users: {
    total: number;
    students: number;
    mentors: number;
    admins: number;
    verified: number;
  };
  projects: {
    total: number;
    byStatus: Record<string, number>;
  };
  teams: {
    totalTeams: number;
    totalMembers: number;
  };
  topSkills: Array<{
    id: string;
    name: string;
    userCount: number;
    projectCount: number;
  }>;
  recentActivity: {
    users: Array<{ id: string; name: string; email: string; role: string; createdAt: string; avatarUrl?: string }>;
    projects: Array<{ id: string; title: string; status: string; createdAt: string }>;
  };
}

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'activity'>('analytics');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Role / Verify mutation states
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [analyticsRes, usersRes] = await Promise.allSettled([
        api.get('/analytics/dashboard'),
        api.get('/users/admin/all'),
      ]);

      if (analyticsRes.status === 'fulfilled') {
        setAnalytics(analyticsRes.value.data);
      }
      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value.data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (user) {
      fetchData();
    }
  }, [user, router]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setUpdatingUserId(userId);
      await api.patch(`/users/admin/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u))
      );
    } catch (err) {
      console.error('Failed to update user role:', err);
      alert('Failed to update user role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleToggleVerification = async (userId: string, currentVerified: boolean) => {
    try {
      setUpdatingUserId(userId);
      const { data } = await api.patch(`/users/admin/${userId}/verify`, {
        isVerified: !currentVerified,
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isVerified: data.user.isVerified } : u))
      );
    } catch (err) {
      console.error('Failed to toggle verification:', err);
      alert('Failed to update verification status');
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        <p className="text-[var(--text-secondary)] text-sm animate-pulse">Loading Admin Analytics Engine...</p>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const maxSkillUsers = analytics?.topSkills.reduce((max, s) => Math.max(max, s.userCount), 1) || 1;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent p-6 rounded-3xl border border-orange-500/20 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/20 text-orange-400 rounded-2xl border border-orange-500/30">
              <Shield size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                System Administration & Analytics
              </h1>
              <p className="text-[var(--text-secondary)] text-sm mt-0.5">
                Real-time insights, user role governance, and platform metrics
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-[var(--border-color)] rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin text-orange-400' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-[var(--border-color)] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            activeTab === 'analytics'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
              : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
          }`}
        >
          <BarChart3 size={18} />
          System Analytics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            activeTab === 'users'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
              : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
          }`}
        >
          <Users size={18} />
          User Management ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            activeTab === 'activity'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
              : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
          }`}
        >
          <Activity size={18} />
          Platform Activity Log
        </button>
      </div>

      {/* TAB 1: SYSTEM ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-transparent relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-orange-400 font-bold mb-1">Total Users</p>
                  <h3 className="text-3xl font-extrabold text-white">{analytics?.users.total || 0}</h3>
                  <div className="flex gap-2 text-xs text-[var(--text-secondary)] mt-2">
                    <span>👨‍🎓 {analytics?.users.students || 0} Students</span>
                    <span>•</span>
                    <span>👨‍🏫 {analytics?.users.mentors || 0} Mentors</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-500/20 text-orange-400 rounded-2xl border border-orange-500/30">
                  <Users size={28} />
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-amber-400 font-bold mb-1">Verified Members</p>
                  <h3 className="text-3xl font-extrabold text-white">{analytics?.users.verified || 0}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-2">
                    {analytics?.users.total
                      ? Math.round(((analytics.users.verified || 0) / analytics.users.total) * 100)
                      : 0}% of platform users
                  </p>
                </div>
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                  <UserCheck size={28} />
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-emerald-400 font-bold mb-1">Total Projects</p>
                  <h3 className="text-3xl font-extrabold text-white">{analytics?.projects.total || 0}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-2">
                    Active collaboration ideas
                  </p>
                </div>
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                  <FolderKanban size={28} />
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-purple-400 font-bold mb-1">Collaborations</p>
                  <h3 className="text-3xl font-extrabold text-white">{analytics?.teams.totalTeams || 0}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-2">
                    {analytics?.teams.totalMembers || 0} active team members
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl border border-purple-500/30">
                  <TrendingUp size={28} />
                </div>
              </div>
            </div>
          </div>

          {/* Deep Analytics Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Skills Breakdown Widget */}
            <div className="glass-card p-6 rounded-3xl border border-[var(--border-color)] bg-white/5 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-orange-400" size={22} />
                  <h3 className="text-xl font-bold">Top Skills Distribution</h3>
                </div>
                <span className="text-xs text-[var(--text-secondary)] bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  Most Endorsed
                </span>
              </div>

              <div className="space-y-4">
                {analytics?.topSkills && analytics.topSkills.length > 0 ? (
                  analytics.topSkills.map((skill) => {
                    const percentage = Math.round((skill.userCount / maxSkillUsers) * 100);
                    return (
                      <div key={skill.id} className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-white flex items-center gap-2">
                            {skill.name}
                          </span>
                          <span className="text-xs text-[var(--text-secondary)] font-mono">
                            {skill.userCount} users • {skill.projectCount} projects
                          </span>
                        </div>
                        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(percentage, 8)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-[var(--text-secondary)] text-center py-6">
                    No skill analytics data available yet.
                  </p>
                )}
              </div>
            </div>

            {/* Project Status & Health Widget */}
            <div className="glass-card p-6 rounded-3xl border border-[var(--border-color)] bg-white/5 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="text-amber-400" size={22} />
                  <h3 className="text-xl font-bold">Project Status Distribution</h3>
                </div>
                <span className="text-xs text-[var(--text-secondary)] bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  Lifecycle Stats
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {['Draft', 'Active', 'Completed', 'In Review'].map((statusKey) => {
                  const count = analytics?.projects.byStatus[statusKey] || 0;
                  return (
                    <div
                      key={statusKey}
                      className="p-5 rounded-2xl bg-black/20 border border-[var(--border-color)] space-y-2 hover:border-orange-500/30 transition-all"
                    >
                      <span className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">
                        {statusKey}
                      </span>
                      <div className="text-3xl font-extrabold text-white">{count}</div>
                    </div>
                  );
                })}
              </div>

              {/* Roles Breakdown Card */}
              <div className="p-5 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white text-sm">Role Ratio</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Platform balance between students and mentors
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-orange-400">
                    {analytics?.users.mentors
                      ? `1 Mentor : ${Math.round((analytics.users.students || 0) / analytics.users.mentors)} Students`
                      : `${analytics?.users.students || 0} Students`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT TABLE */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white/5 border border-[var(--border-color)] rounded-xl focus:outline-none focus:border-orange-500/50 transition-colors w-full text-sm"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {['ALL', 'STUDENT', 'MENTOR', 'ADMIN'].map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    roleFilter === role
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                      : 'bg-white/5 text-[var(--text-secondary)] border border-[var(--border-color)] hover:text-white'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* User Table */}
          <div className="glass-card rounded-2xl border border-[var(--border-color)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-black/40 border-b border-[var(--border-color)]">
                  <tr>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">User</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Role</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Verified</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Level & XP</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-500/20 flex-shrink-0 relative border border-orange-500/30">
                            {u.avatarUrl ? (
                              <Image src={u.avatarUrl} alt={u.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-orange-400">
                                {u.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              {u.name}
                              {u.isVerified && <CheckCircle2 size={15} className="text-emerald-400" />}
                            </div>
                            <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                <Mail size={12} />
                                {u.email}
                              </span>
                              {u.specialization && <span>• {u.specialization}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Inline Role Change Selector */}
                      <td className="p-4">
                        <select
                          value={u.role}
                          disabled={updatingUserId === u.id}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl border focus:outline-none cursor-pointer bg-black/40 ${
                            u.role === 'admin'
                              ? 'text-red-400 border-red-500/30'
                              : u.role === 'mentor'
                              ? 'text-purple-400 border-purple-500/30'
                              : 'text-orange-400 border-orange-500/30'
                          }`}
                        >
                          <option value="student" className="bg-gray-900 text-white">Student</option>
                          <option value="mentor" className="bg-gray-900 text-white">Mentor</option>
                          <option value="admin" className="bg-gray-900 text-white">Admin</option>
                        </select>
                      </td>

                      {/* Verification Toggle */}
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleVerification(u.id, u.isVerified)}
                          disabled={updatingUserId === u.id}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            u.isVerified
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-white/5 text-[var(--text-secondary)] border-white/10 hover:text-white'
                          }`}
                        >
                          {u.isVerified ? (
                            <>
                              <CheckCircle2 size={14} /> Verified
                            </>
                          ) : (
                            <>
                              <XCircle size={14} /> Unverified
                            </>
                          )}
                        </button>
                      </td>

                      <td className="p-4">
                        <div className="text-xs">
                          <span className="font-bold text-amber-400 flex items-center gap-1">
                            <Award size={13} /> Lvl {u.level}
                          </span>
                          <span className="text-[var(--text-secondary)]">{u.xp} XP</span>
                        </div>
                      </td>

                      <td className="p-4 text-xs text-[var(--text-secondary)] font-mono">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[var(--text-secondary)]">
                        No users match the specified criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PLATFORM ACTIVITY LOG */}
      {activeTab === 'activity' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
          {/* Recent Registrations */}
          <div className="glass-card p-6 rounded-3xl border border-[var(--border-color)] bg-white/5 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Users className="text-orange-400" size={20} />
              Recent User Registrations
            </h3>
            <div className="divide-y divide-[var(--border-color)]">
              {analytics?.recentActivity.users.map((ru) => (
                <div key={ru.id} className="py-3 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white text-sm">{ru.name}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{ru.email}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white font-mono">
                      {ru.role}
                    </span>
                    <div className="text-[10px] text-[var(--text-secondary)] mt-1">
                      {new Date(ru.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Projects */}
          <div className="glass-card p-6 rounded-3xl border border-[var(--border-color)] bg-white/5 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FolderKanban className="text-amber-400" size={20} />
              Recent Project Proposals
            </h3>
            <div className="divide-y divide-[var(--border-color)]">
              {analytics?.recentActivity.projects.map((rp) => (
                <div key={rp.id} className="py-3 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white text-sm">{rp.title}</div>
                    <div className="text-xs text-[var(--text-secondary)]">Status: {rp.status}</div>
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)] font-mono">
                    {new Date(rp.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
