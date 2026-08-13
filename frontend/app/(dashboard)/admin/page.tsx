'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { api } from '@/lib/api';
import { 
  Shield, 
  Mail, 
  Calendar, 
  TrendingUp, 
  Search, 
  Users, 
  Activity, 
  ShieldAlert, 
  RefreshCw, 
  AlertTriangle,
  Zap,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import TopologyMap from '@/components/network/TopologyMap';
import LatencyChart from '@/components/network/LatencyChart';
import TrafficFeed from '@/components/network/TrafficFeed';
import ChaosPanel, { ChaosConfig } from '@/components/network/ChaosPanel';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  specialization: string | null;
  avatarUrl: string | null;
  xp: number;
  level: number;
  createdAt: string;
  skills: string[];
}

interface ThreatLog {
  id: string;
  ip: string;
  type: string;
  severity: string;
  fingerprint: string | null;
  metadata: string | null;
  createdAt: string;
}

interface ServiceStatus {
  status: "healthy" | "degraded" | "down";
  latencyMs: number | null;
  message?: string;
}

interface HealthReport {
  overall: "healthy" | "degraded" | "down";
  timestamp: string;
  uptimeSeconds: number;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
    aiService: ServiceStatus;
  };
  system: {
    platform: string;
    freeMemoryMB: number;
    totalMemoryMB: number;
    cpuCount: number;
    loadAverage: number[];
  };
}

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  // Active Tab: 'users' | 'network' | 'security'
  const [activeTab, setActiveTab] = useState<'users' | 'network' | 'security'>('users');

  // Users State
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState('');

  // Security Threat Logs State
  const [threatLogs, setThreatLogs] = useState<ThreatLog[]>([]);
  const [loadingThreats, setLoadingThreats] = useState(false);
  const [seedingThreats, setSeedingThreats] = useState(false);

  // Network Control State
  const [healthReport, setHealthReport] = useState<HealthReport | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [chaosConfig, setChaosConfig] = useState<ChaosConfig>({
    dbDown: false,
    redisLatency: false,
    aiDown: false,
  });

  const chaosRef = useRef(chaosConfig);
  useEffect(() => {
    chaosRef.current = chaosConfig;
    if (activeTab === 'network') fetchHealth();
  }, [chaosConfig]);

  const [history, setHistory] = useState<{
    db: number[];
    redis: number[];
    ai: number[];
  }>({ db: [], redis: [], ai: [] });

  // 1. Guard & Fetch Users
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/users/admin/all');
        setUsers(data.users || []);
      } catch (err) {
        console.error('Failed to fetch admin users:', err);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (user) fetchUsers();
  }, [user, router]);

  // 2. Fetch Security Threat Logs
  const fetchThreatLogs = async () => {
    try {
      setLoadingThreats(true);
      const { data } = await api.get('/security/logs');
      setThreatLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to fetch security logs:', err);
    } finally {
      setLoadingThreats(false);
    }
  };

  // Auto-refresh Security logs every 10 seconds when Security tab is active
  useEffect(() => {
    if (activeTab === 'security') {
      fetchThreatLogs();
      const interval = setInterval(fetchThreatLogs, 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // 3. Fetch Network Health
  const fetchHealth = async () => {
    try {
      setLoadingHealth(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/health`);
      if (!res.ok && res.status !== 207 && res.status !== 503) {
        throw new Error(`HTTP ${res.status}`);
      }
      let data: HealthReport = await res.json();
      const currentChaos = chaosRef.current;

      if (currentChaos.dbDown) {
        data.services.database.status = 'down';
        data.services.database.latencyMs = null;
      }
      if (currentChaos.redisLatency) {
        data.services.redis.status = 'degraded';
        data.services.redis.latencyMs = (data.services.redis.latencyMs || 15) + Math.floor(Math.random() * 500) + 2000;
      }
      if (currentChaos.aiDown) {
        data.services.aiService.status = 'down';
        data.services.aiService.latencyMs = null;
      }

      const statuses = [data.services.database.status, data.services.redis.status, data.services.aiService.status];
      if (statuses.includes('down')) data.overall = 'down';
      else if (statuses.includes('degraded')) data.overall = 'degraded';
      else data.overall = 'healthy';

      setHealthReport(data);

      setHistory((prev) => ({
        db: [...prev.db, data.services.database.latencyMs || 0].slice(-20),
        redis: [...prev.redis, data.services.redis.latencyMs || 0].slice(-20),
        ai: [...prev.ai, data.services.aiService.latencyMs || 0].slice(-20),
      }));
    } catch (err) {
      console.error('Failed to fetch health report:', err);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'network') {
      fetchHealth();
      const interval = setInterval(fetchHealth, 15000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const seedThreats = async () => {
    try {
      setSeedingThreats(true);
      await api.post('/security/seed');
      await fetchThreatLogs();
    } catch (err) {
      console.error('Failed to seed threats:', err);
    } finally {
      setSeedingThreats(false);
    }
  };

  if (loadingUsers && activeTab === 'users') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 bg-clip-text text-transparent flex items-center gap-3">
            <Shield className="text-orange-500" size={32} />
            System Administration Portal
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Central command center for user management, system metrics, and security audit
          </p>
        </div>

        {/* System Quick Status Badge */}
        <div className="flex items-center gap-3 bg-white/5 border border-[var(--border-color)] px-4 py-2 rounded-xl">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              healthReport?.overall === 'healthy' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' :
              healthReport?.overall === 'degraded' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'
            }`} />
            <span className="text-xs font-bold text-slate-300 uppercase">
              {healthReport?.overall || 'ONLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[var(--border-color)] space-x-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-orange-500 text-orange-400 bg-orange-500/10 rounded-t-xl'
              : 'border-transparent text-[var(--text-secondary)] hover:text-white'
          }`}
        >
          <Users size={18} />
          User Management ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('network')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'network'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-xl'
              : 'border-transparent text-[var(--text-secondary)] hover:text-white'
          }`}
        >
          <Activity size={18} />
          Network Control Center
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'security'
              ? 'border-red-500 text-red-400 bg-red-500/10 rounded-t-xl'
              : 'border-transparent text-[var(--text-secondary)] hover:text-white'
          }`}
        >
          <ShieldAlert size={18} />
          Security Audit & Threat Logs ({threatLogs.length})
        </button>
      </div>

      {/* TAB 1: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users size={20} className="text-orange-500" />
              Registered Platform Users
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/5 border border-[var(--border-color)] rounded-xl focus:outline-none focus:border-orange-500/50 transition-colors w-full md:w-64"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-orange-500/20 bg-white/5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <Shield className="text-orange-500" size={24} />
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Total Users</p>
                  <h3 className="text-2xl font-bold">{users.length}</h3>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-amber-500/20 bg-white/5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/20 rounded-xl">
                  <TrendingUp className="text-amber-500" size={24} />
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Total XP Generated</p>
                  <h3 className="text-2xl font-bold">
                    {users.reduce((acc, curr) => acc + curr.xp, 0).toLocaleString()}
                  </h3>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-red-500/20 bg-white/5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <Calendar className="text-red-500" size={24} />
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Admins / Staff</p>
                  <h3 className="text-2xl font-bold">
                    {users.filter((u) => u.role === 'admin').length}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-[var(--border-color)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black/20 border-b border-[var(--border-color)]">
                  <tr>
                    <th className="p-4 font-semibold text-[var(--text-secondary)]">User</th>
                    <th className="p-4 font-semibold text-[var(--text-secondary)]">Contact</th>
                    <th className="p-4 font-semibold text-[var(--text-secondary)]">Role</th>
                    <th className="p-4 font-semibold text-[var(--text-secondary)]">Stats</th>
                    <th className="p-4 font-semibold text-[var(--text-secondary)]">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-500/20 flex-shrink-0 relative">
                            {u.avatarUrl ? (
                              <Image src={u.avatarUrl} alt={u.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-orange-500">
                                {u.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{u.name}</div>
                            <div className="text-xs text-[var(--text-secondary)]">{u.specialization || 'No specialization'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                          <Mail size={14} />
                          {u.email}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                            u.role === 'admin'
                              ? 'bg-red-500/20 text-red-400 border-red-500/30'
                              : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="font-semibold text-amber-500">Lvl {u.level}</div>
                          <div className="text-xs text-[var(--text-secondary)]">{u.xp} XP</div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NETWORK CONTROL CENTER */}
      {activeTab === 'network' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md">
            <div>
              <h2 className="text-2xl font-black flex items-center gap-3 text-white">
                <Activity className="w-7 h-7 text-indigo-400" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-cyan-300">Live Architecture & Topology</span>
              </h2>
              <p className="text-slate-200 font-mono text-sm mt-1">SYS_ADMIN // REAL-TIME NETWORK HEALTH & CHAOS PANEL</p>
            </div>
            <button
              onClick={fetchHealth}
              disabled={loadingHealth}
              className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/20 transition-colors disabled:opacity-50 flex items-center gap-2 font-mono text-xs"
            >
              <RefreshCw className={`w-4 h-4 ${loadingHealth ? 'animate-spin' : ''}`} />
              Refresh Poll
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col relative">
              <h3 className="text-sm font-bold text-white font-mono mb-4 tracking-wider">LIVE_SERVICE_TOPOLOGY</h3>
              <TopologyMap services={healthReport?.services} />
            </div>
            <div className="lg:col-span-1">
              <TrafficFeed />
            </div>
            <div className="lg:col-span-1">
              <ChaosPanel config={chaosConfig} setConfig={setChaosConfig} />
            </div>
          </div>

          {healthReport && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-mono text-slate-400">DATABASE_LATENCY</span>
                  <span className="text-sm font-bold font-mono text-blue-400">
                    {healthReport.services.database.latencyMs ? `${healthReport.services.database.latencyMs}ms` : 'DOWN'}
                  </span>
                </div>
                <LatencyChart data={history.db} color="#3b82f6" />
              </div>

              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-mono text-slate-400">REDIS_LATENCY</span>
                  <span className="text-sm font-bold font-mono text-amber-400">
                    {healthReport.services.redis.latencyMs ? `${healthReport.services.redis.latencyMs}ms` : 'DOWN'}
                  </span>
                </div>
                <LatencyChart data={history.redis} color="#f59e0b" />
              </div>

              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-mono text-slate-400">AI_SERVICE_LATENCY</span>
                  <span className="text-sm font-bold font-mono text-purple-400">
                    {healthReport.services.aiService.latencyMs ? `${healthReport.services.aiService.latencyMs}ms` : 'DOWN'}
                  </span>
                </div>
                <LatencyChart data={history.ai} color="#a855f7" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SECURITY AUDIT & THREAT LOGS */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-red-950/30 p-6 rounded-2xl border border-red-500/20">
            <div>
              <h2 className="text-2xl font-bold text-red-400 flex items-center gap-2">
                <ShieldAlert className="text-red-500" size={28} />
                Real-Time Security Threat Audit
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Monitors PoW rejections, failed login attempts, honeypot triggers, and rate-limit violations
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={seedThreats}
                disabled={seedingThreats}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-semibold rounded-xl transition-all text-xs flex items-center gap-2"
              >
                <Zap size={14} />
                {seedingThreats ? 'Simulating...' : 'Simulate Threat Event'}
              </button>
              <button
                onClick={fetchThreatLogs}
                disabled={loadingThreats}
                className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl border border-white/10"
              >
                <RefreshCw size={16} className={loadingThreats ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-[var(--border-color)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-sm">
                <thead className="bg-black/30 border-b border-[var(--border-color)]">
                  <tr>
                    <th className="p-4 text-[var(--text-secondary)]">Timestamp</th>
                    <th className="p-4 text-[var(--text-secondary)]">Threat Type</th>
                    <th className="p-4 text-[var(--text-secondary)]">Severity</th>
                    <th className="p-4 text-[var(--text-secondary)]">IP Address</th>
                    <th className="p-4 text-[var(--text-secondary)]">Fingerprint ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {threatLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-xs text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 font-bold text-white">
                        <span className="flex items-center gap-2">
                          <AlertTriangle size={14} className="text-amber-500" />
                          {log.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 text-xs font-bold rounded-md border ${
                            log.severity === 'CRITICAL'
                              ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                              : log.severity === 'HIGH'
                              ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          }`}
                        >
                          {log.severity}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">{log.ip}</td>
                      <td className="p-4 text-xs text-slate-400 font-mono">
                        {log.fingerprint ? log.fingerprint.slice(0, 16) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                  {threatLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-sans">
                        No security threats recorded yet. System is clean!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
