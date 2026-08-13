"use client";

import React, { useState, useEffect, useRef } from "react";
import TopologyMap from "@/components/network/TopologyMap";
import LatencyChart from "@/components/network/LatencyChart";
import TrafficFeed from "@/components/network/TrafficFeed";
import ChaosPanel, { ChaosConfig } from "@/components/network/ChaosPanel";
import { Server, Cpu, Clock, Activity, RefreshCw, Database, HardDrive, Brain, ShieldAlert } from "lucide-react";

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

export default function StatusPage() {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(15);
  const [error, setError] = useState<string | null>(null);

  // Chaos Engineering State
  const [chaosConfig, setChaosConfig] = useState<ChaosConfig>({
    dbDown: false,
    redisLatency: false,
    aiDown: false
  });

  // Keep a ref to the latest chaos config so the interval closure has access to it
  const chaosRef = useRef(chaosConfig);
  useEffect(() => {
    chaosRef.current = chaosConfig;
    // Re-fetch immediately when chaos changes to show effect instantly
    fetchHealth();
  }, [chaosConfig]);

  // Latency History for Sparklines
  const [history, setHistory] = useState<{
    db: number[];
    redis: number[];
    ai: number[];
  }>({ db: [], redis: [], ai: [] });

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/health`);
      
      if (!res.ok && res.status !== 207 && res.status !== 503) {
        throw new Error(`HTTP Error ${res.status}`);
      }
      
      let data: HealthReport = await res.json();
      const currentChaos = chaosRef.current;

      // --- Apply Chaos Engineering Interceptors ---
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

      // Recompute overall status based on chaos overrides
      const statuses = [data.services.database.status, data.services.redis.status, data.services.aiService.status];
      if (statuses.includes('down')) data.overall = 'down';
      else if (statuses.includes('degraded')) data.overall = 'degraded';
      else data.overall = 'healthy';
      // ---------------------------------------------

      setReport(data);
      setLastUpdated(new Date());
      setCountdown(15);
      
      // Update history for charts
      setHistory(prev => ({
        db: [...prev.db, data.services.database.latencyMs || 0].slice(-20),
        redis: [...prev.redis, data.services.redis.latencyMs || 0].slice(-20),
        ai: [...prev.ai, data.services.aiService.latencyMs || 0].slice(-20),
      }));

    } catch (err: any) {
      setError(err.message || 'Failed to fetch system health');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    
    const interval = setInterval(() => {
      fetchHealth();
    }, 15000);
    
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 15));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    };
  }, []); // Intentionally leaving dependency array empty to run once on mount

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="flex justify-between items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-indigo-500" />
            Network Control Center
          </h1>
          <p className="text-slate-400 mt-1 font-mono text-sm">SYS_ADMIN // LIVE MONITORING & TOPOLOGY</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-950 rounded-lg border border-slate-800">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              report?.overall === 'healthy' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 
              report?.overall === 'degraded' ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'
            }`} />
            <span className="text-sm font-bold uppercase text-slate-300">
              {report?.overall || 'CONNECTING...'}
            </span>
          </div>

          <div className="text-sm text-slate-500 font-mono text-right">
            {lastUpdated && (
              <div>{lastUpdated.toLocaleTimeString()}</div>
            )}
            <div className="text-xs text-indigo-400 mt-0.5">
              T-{countdown}s to poll
            </div>
          </div>
          <button 
            onClick={fetchHealth}
            disabled={loading}
            className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 font-mono text-sm">
          <p className="font-bold mb-1">CRITICAL ERROR</p>
          <p>{error}</p>
        </div>
      )}

      {/* Top Section: Topology, Traffic Feed, Chaos */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Topology Map */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-md flex flex-col relative overflow-hidden">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white z-10">
            <Activity className="w-5 h-5 text-indigo-400" />
            Live Architecture
          </h2>
          <div className="flex-1 z-10">
            <TopologyMap services={report?.services} />
          </div>
        </div>

        {/* Live Traffic */}
        <div className="lg:col-span-1 flex flex-col">
          <TrafficFeed />
        </div>

        {/* Chaos Engineering Panel */}
        <div className="lg:col-span-1 flex flex-col">
          <ChaosPanel config={chaosConfig} setConfig={setChaosConfig} />
        </div>

      </div>

      {/* Latency Charts Row */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between group hover:border-blue-500/50 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-slate-300">
                <Database className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-sm font-mono">DB_LATENCY</span>
              </div>
              <span className={`text-sm font-bold font-mono ${chaosConfig.dbDown ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {report.services.database.latencyMs !== null ? `${report.services.database.latencyMs}ms` : 'ERR_TIMEOUT'}
              </span>
            </div>
            <LatencyChart data={history.db} color={chaosConfig.dbDown ? "#ef4444" : "#3b82f6"} />
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between group hover:border-amber-500/50 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-slate-300">
                <HardDrive className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-sm font-mono">REDIS_LATENCY</span>
              </div>
              <span className={`text-sm font-bold font-mono ${chaosConfig.redisLatency ? 'text-amber-500 animate-pulse' : 'text-white'}`}>
                {report.services.redis.latencyMs !== null ? `${report.services.redis.latencyMs}ms` : 'ERR_TIMEOUT'}
              </span>
            </div>
            <LatencyChart data={history.redis} color="#f59e0b" />
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between group hover:border-purple-500/50 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-slate-300">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-sm font-mono">AI_LATENCY</span>
              </div>
              <span className={`text-sm font-bold font-mono ${chaosConfig.aiDown ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {report.services.aiService.latencyMs !== null ? `${report.services.aiService.latencyMs}ms` : 'ERR_TIMEOUT'}
              </span>
            </div>
            <LatencyChart data={history.ai} color={chaosConfig.aiDown ? "#ef4444" : "#a855f7"} />
          </div>
        </div>
      )}

      {/* System Metrics */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-mono mb-1">SYSTEM_UPTIME</p>
              <p className="text-xl font-bold text-white font-mono">{formatUptime(report.uptimeSeconds)}</p>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-mono mb-1">MEMORY_ALLOCATION</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-bold text-white font-mono">
                  {Math.round(((report.system.totalMemoryMB - report.system.freeMemoryMB) / report.system.totalMemoryMB) * 100)}%
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  {report.system.totalMemoryMB - report.system.freeMemoryMB} / {report.system.totalMemoryMB} MB
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-mono mb-1">CPU_LOAD_1M</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-bold text-white font-mono">
                  {report.system.loadAverage[0].toFixed(2)}
                </p>
                <p className="text-xs text-slate-400 font-mono">{report.system.cpuCount} CORES</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
