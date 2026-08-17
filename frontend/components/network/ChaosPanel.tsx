"use client";

import React from "react";
import { AlertTriangle, Database, HardDrive, Brain, ZapOff } from "lucide-react";

export interface ChaosConfig {
  dbDown: boolean;
  redisLatency: boolean;
  aiDown: boolean;
}

interface ChaosPanelProps {
  config: ChaosConfig;
  setConfig: React.Dispatch<React.SetStateAction<ChaosConfig>>;
}

export default function ChaosPanel({ config, setConfig }: ChaosPanelProps) {
  const toggle = (key: keyof ChaosConfig) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-slate-950 rounded-2xl border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.05)] overflow-hidden flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border-b border-red-500/20">
        <AlertTriangle className="w-4 h-4 text-red-500" />
        <span className="text-sm font-bold text-red-500 tracking-wide uppercase">Chaos Engineering</span>
      </div>
      
      <div className="p-5 space-y-4 flex-1">
        <p className="text-xs text-slate-400 mb-4">
          Simulate network failures and latency spikes to observe dashboard resilience.
        </p>

        {/* DB Down Toggle */}
        <button
          onClick={() => toggle('dbDown')}
          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
            config.dbDown 
              ? 'bg-red-500/20 border-red-500/50 text-white' 
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <Database className={`w-5 h-5 ${config.dbDown ? 'text-red-400' : 'text-slate-500'}`} />
            <div className="text-left">
              <div className="text-sm font-semibold">Drop DB Connection</div>
              <div className="text-[10px] opacity-70">Simulates PostgreSQL outage</div>
            </div>
          </div>
          <div className={`w-10 h-5 rounded-full relative transition-colors ${config.dbDown ? 'bg-red-500' : 'bg-slate-700'}`}>
            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${config.dbDown ? 'left-6' : 'left-1'}`} />
          </div>
        </button>

        {/* Redis Latency Toggle */}
        <button
          onClick={() => toggle('redisLatency')}
          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
            config.redisLatency 
              ? 'bg-amber-500/20 border-amber-500/50 text-white' 
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <HardDrive className={`w-5 h-5 ${config.redisLatency ? 'text-amber-400' : 'text-slate-500'}`} />
            <div className="text-left">
              <div className="text-sm font-semibold">Inject Cache Latency</div>
              <div className="text-[10px] opacity-70">Adds +2000ms to Redis</div>
            </div>
          </div>
          <div className={`w-10 h-5 rounded-full relative transition-colors ${config.redisLatency ? 'bg-amber-500' : 'bg-slate-700'}`}>
            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${config.redisLatency ? 'left-6' : 'left-1'}`} />
          </div>
        </button>

        {/* AI Down Toggle */}
        <button
          onClick={() => toggle('aiDown')}
          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
            config.aiDown 
              ? 'bg-purple-500/20 border-purple-500/50 text-white' 
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <Brain className={`w-5 h-5 ${config.aiDown ? 'text-purple-400' : 'text-slate-500'}`} />
            <div className="text-left">
              <div className="text-sm font-semibold">Kill AI Microservice</div>
              <div className="text-[10px] opacity-70">Simulates FastAPI crash</div>
            </div>
          </div>
          <div className={`w-10 h-5 rounded-full relative transition-colors ${config.aiDown ? 'bg-purple-500' : 'bg-slate-700'}`}>
            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${config.aiDown ? 'left-6' : 'left-1'}`} />
          </div>
        </button>

      </div>
    </div>
  );
}
