"use client";

import React, { useState, useEffect, useRef } from "react";
import { Terminal } from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: Date;
  method: string;
  path: string;
  status: number;
  latency: number;
}

const MOCK_PATHS = [
  "/api/projects",
  "/api/users/profile",
  "/api/auth/session",
  "/api/health",
  "/api/ai/match",
  "/api/quizzes/active",
  "/api/notifications",
  "/api/chat/messages",
];

const MOCK_METHODS = ["GET", "GET", "GET", "POST", "PUT"];

export default function TrafficFeed() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate initial logs
    const initialLogs: LogEntry[] = Array.from({ length: 15 }).map((_, i) => generateMockLog(new Date(Date.now() - (15 - i) * 1000)));
    setLogs(initialLogs);

    // Add a new log every 800ms - 2500ms randomly
    let timeout: NodeJS.Timeout;
    
    const tick = () => {
      setLogs((prev) => {
        const newLogs = [...prev, generateMockLog(new Date())];
        // Keep max 50 logs in memory
        if (newLogs.length > 50) return newLogs.slice(newLogs.length - 50);
        return newLogs;
      });
      
      const nextDelay = Math.random() * 1500 + 500;
      timeout = setTimeout(tick, nextDelay);
    };
    
    timeout = setTimeout(tick, 1000);

    return () => clearTimeout(timeout);
  }, []);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getStatusColor = (status: number) => {
    if (status >= 500) return "text-red-400";
    if (status >= 400) return "text-amber-400";
    if (status >= 300) return "text-blue-400";
    return "text-green-400";
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return "text-cyan-400";
      case 'POST': return "text-emerald-400";
      case 'PUT': return "text-amber-400";
      case 'DELETE': return "text-red-400";
      default: return "text-slate-400";
    }
  };

  return (
    <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-sm overflow-hidden flex flex-col h-full min-h-[300px]">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border-b border-slate-800">
        <Terminal className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-mono text-slate-400">Live Traffic Feed</span>
        <div className="ml-auto flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="p-4 overflow-y-auto font-mono text-xs space-y-1.5 flex-1 scroll-smooth custom-scrollbar"
      >
        {logs.map((log) => (
          <div key={log.id} className="flex items-center gap-3 hover:bg-slate-800/50 p-1 rounded transition-colors group">
            <span className="text-slate-600 shrink-0 w-16">
              {log.timestamp.toISOString().substring(11, 19)}
            </span>
            <span className={`font-bold shrink-0 w-12 ${getMethodColor(log.method)}`}>
              {log.method}
            </span>
            <span className="text-slate-300 truncate flex-1">
              {log.path}
            </span>
            <span className={`shrink-0 w-10 text-right ${getStatusColor(log.status)}`}>
              {log.status}
            </span>
            <span className="text-slate-500 shrink-0 w-12 text-right">
              {log.latency}ms
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function generateMockLog(timestamp: Date): LogEntry {
  const method = MOCK_METHODS[Math.floor(Math.random() * MOCK_METHODS.length)];
  const path = MOCK_PATHS[Math.floor(Math.random() * MOCK_PATHS.length)];
  
  // 90% chance of 200, 5% of 404, 5% of 500
  const rand = Math.random();
  let status = 200;
  if (rand > 0.95) status = 500;
  else if (rand > 0.9) status = 404;
  else if (rand > 0.85 && method === 'POST') status = 201;

  // Base latency depending on path
  let baseLatency = 20;
  if (path.includes('ai')) baseLatency = 800;
  if (path.includes('projects')) baseLatency = 150;
  
  // Random jitter
  const latency = Math.floor(baseLatency + (Math.random() * baseLatency * 0.5));

  return {
    id: Math.random().toString(36).substring(2, 9),
    timestamp,
    method,
    path,
    status,
    latency
  };
}
