"use client";

import React, { useState, useEffect } from "react";
import TopologyMap from "@/components/network/TopologyMap";
import LatencyChart from "@/components/network/LatencyChart";
import TrafficFeed from "@/components/network/TrafficFeed";
import { Server, Cpu, Clock, Activity, RefreshCw, Database, HardDrive, Brain } from "lucide-react";

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
      
      const data: HealthReport = await res.json();
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
  }, []);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">System Status</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Live monitoring and network topology</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-500">
            {lastUpdated && (
              <span>Last checked: {lastUpdated.toLocaleTimeString()}</span>
            )}
            <div className="text-right text-xs mt-1">
              Next check in {countdown}s
            </div>
          </div>
          <button 
            onClick={fetchHealth}
            disabled={loading}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-600 dark:text-red-400">
          <p className="font-semibold">Error fetching health data</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Top Section: Topology and Traffic Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
            <Activity className="w-5 h-5 text-indigo-500" />
            Live Network Topology
          </h2>
          <div className="flex-1">
            <TopologyMap services={report?.services} />
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col">
          <TrafficFeed />
        </div>
      </div>

      {/* Latency Charts Row */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Database className="w-4 h-4 text-blue-500" />
                <span className="font-semibold text-sm">PostgreSQL Latency</span>
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{report.services.database.latencyMs}ms</span>
            </div>
            <LatencyChart data={history.db} color="#3b82f6" />
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <HardDrive className="w-4 h-4 text-red-500" />
                <span className="font-semibold text-sm">Redis Cache Latency</span>
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{report.services.redis.latencyMs}ms</span>
            </div>
            <LatencyChart data={history.redis} color="#ef4444" />
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Brain className="w-4 h-4 text-purple-500" />
                <span className="font-semibold text-sm">AI Service Latency</span>
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{report.services.aiService.latencyMs}ms</span>
            </div>
            <LatencyChart data={history.ai} color="#a855f7" />
          </div>
        </div>
      )}

      {/* System Metrics */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">System Uptime</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{formatUptime(report.uptimeSeconds)}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Memory Usage</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {Math.round(((report.system.totalMemoryMB - report.system.freeMemoryMB) / report.system.totalMemoryMB) * 100)}%
              </p>
              <p className="text-xs text-slate-400">
                {report.system.totalMemoryMB - report.system.freeMemoryMB} / {report.system.totalMemoryMB} MB
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">CPU Load (1m)</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {report.system.loadAverage[0].toFixed(2)}
              </p>
              <p className="text-xs text-slate-400">{report.system.cpuCount} Cores</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
