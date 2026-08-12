"use client";

import React from "react";
import { motion } from "framer-motion";
import { Server, Database, Brain, Globe, HardDrive } from "lucide-react";
import clsx from "clsx";

interface ServiceStatus {
  status: "healthy" | "degraded" | "down";
  latencyMs: number | null;
  message?: string;
}

interface TopologyMapProps {
  services?: {
    database: ServiceStatus;
    redis: ServiceStatus;
    aiService: ServiceStatus;
  };
}

const statusColors = {
  healthy: "text-green-500 border-green-500/50 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.3)]",
  degraded: "text-amber-500 border-amber-500/50 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
  down: "text-red-500 border-red-500/50 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.3)]",
  unknown: "text-gray-500 border-gray-500/50 bg-gray-500/10",
};

const pulseColors = {
  healthy: "#22c55e",
  degraded: "#f59e0b",
  down: "#ef4444",
  unknown: "#6b7280",
};

const Node = ({ 
  icon: Icon, 
  label, 
  status = "unknown", 
  latency, 
  x, 
  y 
}: { 
  icon: any, 
  label: string, 
  status?: "healthy" | "degraded" | "down" | "unknown", 
  latency?: number | null,
  x: number, 
  y: number 
}) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      style={{ left: `${x}%`, top: `${y}%` }}
      className={clsx(
        "absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center p-4 rounded-xl border-2 backdrop-blur-md z-10 w-32",
        statusColors[status]
      )}
    >
      <Icon className="w-8 h-8 mb-2" />
      <span className="font-semibold text-sm text-center">{label}</span>
      {latency !== undefined && latency !== null && (
        <span className="text-xs opacity-75 mt-1">{latency}ms</span>
      )}
      {status === 'down' && (
        <span className="text-[10px] font-bold uppercase mt-1 px-2 py-0.5 bg-red-500/20 text-red-500 rounded-full">Offline</span>
      )}
    </motion.div>
  );
};

const Connection = ({ 
  startX, 
  startY, 
  endX, 
  endY, 
  status = "unknown" 
}: { 
  startX: number, 
  startY: number, 
  endX: number, 
  endY: number, 
  status?: "healthy" | "degraded" | "down" | "unknown" 
}) => {
  const isDown = status === 'down';
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
      {/* Base Line */}
      <line
        x1={`${startX}%`}
        y1={`${startY}%`}
        x2={`${endX}%`}
        y2={`${endY}%`}
        stroke={isDown ? pulseColors.down : "rgba(100, 116, 139, 0.3)"}
        strokeWidth="2"
        strokeDasharray={isDown ? "4 4" : "none"}
      />
      
      {/* Animated Pulse (only if healthy/degraded) */}
      {!isDown && status !== "unknown" && (
        <motion.circle
          r="4"
          fill={pulseColors[status]}
          initial={{ cx: `${startX}%`, cy: `${startY}%`, opacity: 1 }}
          animate={{
            cx: [`${startX}%`, `${endX}%`],
            cy: [`${startY}%`, `${endY}%`],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 2 // Stagger animations
          }}
          style={{ filter: `drop-shadow(0 0 8px ${pulseColors[status]})` }}
        />
      )}
    </svg>
  );
};

export default function TopologyMap({ services }: TopologyMapProps) {
  // Define node positions (percentages)
  const nodes = {
    client: { x: 50, y: 15 },
    api: { x: 50, y: 50 },
    db: { x: 20, y: 85 },
    redis: { x: 50, y: 85 },
    ai: { x: 80, y: 85 },
  };

  const apiStatus = services 
    ? (Object.values(services).some(s => s.status === 'down') ? 'degraded' : 'healthy') 
    : 'unknown';

  return (
    <div className="relative w-full h-[450px] bg-slate-900/40 dark:bg-slate-900/60 rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      {/* Connections */}
      <Connection startX={nodes.client.x} startY={nodes.client.y} endX={nodes.api.x} endY={nodes.api.y} status={apiStatus} />
      <Connection startX={nodes.api.x} startY={nodes.api.y} endX={nodes.db.x} endY={nodes.db.y} status={services?.database?.status} />
      <Connection startX={nodes.api.x} startY={nodes.api.y} endX={nodes.redis.x} endY={nodes.redis.y} status={services?.redis?.status} />
      <Connection startX={nodes.api.x} startY={nodes.api.y} endX={nodes.ai.x} endY={nodes.ai.y} status={services?.aiService?.status} />

      {/* Nodes */}
      <Node icon={Globe} label="Client" status="healthy" x={nodes.client.x} y={nodes.client.y} />
      <Node icon={Server} label="API Gateway" status={apiStatus as any} latency={null} x={nodes.api.x} y={nodes.api.y} />
      <Node icon={Database} label="PostgreSQL" status={services?.database?.status} latency={services?.database?.latencyMs} x={nodes.db.x} y={nodes.db.y} />
      <Node icon={HardDrive} label="Redis Cache" status={services?.redis?.status} latency={services?.redis?.latencyMs} x={nodes.redis.x} y={nodes.redis.y} />
      <Node icon={Brain} label="AI Service" status={services?.aiService?.status} latency={services?.aiService?.latencyMs} x={nodes.ai.x} y={nodes.ai.y} />
    </div>
  );
}
