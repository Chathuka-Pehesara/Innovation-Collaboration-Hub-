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

type StatusKey = "healthy" | "degraded" | "down" | "unknown";

const statusStyle: Record<StatusKey, string> = {
  healthy: "border-emerald-500/50 text-emerald-300 bg-emerald-500/10 backdrop-blur-xl shadow-[0_0_10px_rgba(16,185,129,0.2)]",
  degraded: "border-amber-500/50 text-amber-300 bg-amber-500/10 backdrop-blur-xl shadow-[0_0_10px_rgba(245,158,11,0.2)]",
  down:    "border-red-500/50   text-red-300   bg-red-500/10   backdrop-blur-xl shadow-[0_0_10px_rgba(239,68,68,0.2)]",
  unknown: "border-slate-700/50 text-slate-400  bg-white/5      backdrop-blur-xl",
};

const pulseColors: Record<StatusKey, string> = {
  healthy: "#10b981",
  degraded: "#f59e0b",
  down:    "#ef4444",
  unknown: "#64748b",
};

/** Small glassy card for a single service node */
function NodeCard({
  icon: Icon,
  label,
  status = "unknown",
  latency,
}: {
  icon: React.ElementType;
  label: string;
  status?: StatusKey;
  latency?: number | null;
}) {
  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 150, damping: 18 }}
      className={clsx(
        "flex flex-col items-center justify-center gap-1 px-3 py-2.5 rounded-xl border",
        "min-w-[76px] text-center",
        statusStyle[status]
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="text-[10px] font-bold leading-tight whitespace-nowrap">{label}</span>
      {latency != null && (
        <span className="text-[9px] opacity-70 font-mono">{latency}ms</span>
      )}
      {status === "down" && (
        <span className="text-[8px] font-bold px-1.5 py-px rounded-full border border-red-500/40 bg-red-500/20 text-red-300 animate-pulse">
          DOWN
        </span>
      )}
    </motion.div>
  );
}

/**
 * Horizontal line connector with a travelling dot using CSS animation.
 * Avoids motion.circle inside SVG which causes TypeScript errors in strict builds.
 */
function PulseLine({ color, dashed }: { color: string; dashed?: boolean }) {
  return (
    <div className="relative self-center shrink-0 w-8 h-0.5">
      <div
        className="absolute inset-0"
        style={{ background: dashed ? color : "rgba(255,255,255,0.15)" }}
      />
      {!dashed && (
        <div
          className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
          style={{
            background: color,
            boxShadow: `0 0 5px ${color}`,
            animation: "slideX 1.6s linear infinite",
          }}
        />
      )}
      <style>{`
        @keyframes slideX {
          0%   { left: 0%;   opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/**
 * Vertical line connector with a travelling dot using CSS animation.
 * Avoids motion.circle inside SVG which causes TypeScript errors in strict builds.
 */
function VConnector({ color, dashed }: { color: string; dashed?: boolean }) {
  return (
    <div className="relative self-center shrink-0 w-0.5 h-7">
      <div
        className="absolute inset-0"
        style={{ background: dashed ? color : "rgba(255,255,255,0.15)" }}
      />
      {!dashed && (
        <div
          className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
          style={{
            background: color,
            boxShadow: `0 0 5px ${color}`,
            animation: "slideY 1.4s linear infinite",
          }}
        />
      )}
      <style>{`
        @keyframes slideY {
          0%   { top: 0%;   opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function TopologyMap({ services }: TopologyMapProps) {
  const dbStatus: StatusKey    = services?.database?.status  ?? "unknown";
  const redisStatus: StatusKey = services?.redis?.status     ?? "unknown";
  const aiStatus: StatusKey    = services?.aiService?.status ?? "unknown";
  const apiStatus: StatusKey   = services
    ? (Object.values(services).every((s) => s.status === "down")
        ? "down"
        : Object.values(services).some((s) => s.status === "down")
          ? "degraded"
          : "healthy")
    : "unknown";

  return (
    <div className="w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-2xl p-4">
      {/* Row 1: Client */}
      <div className="flex justify-center">
        <NodeCard icon={Globe} label="Client" status="healthy" />
      </div>

      {/* Connector: Client → API */}
      <div className="flex justify-center">
        <VConnector color={pulseColors[apiStatus]} dashed={apiStatus === "down"} />
      </div>

      {/* Row 2: API Gateway */}
      <div className="flex justify-center">
        <NodeCard icon={Server} label="API Gateway" status={apiStatus} />
      </div>

      {/* Connector: API → bottom row */}
      <div className="flex justify-center">
        <VConnector color={pulseColors[dbStatus]} dashed={dbStatus === "down"} />
      </div>

      {/* Row 3: PostgreSQL · Redis Cache · AI Service */}
      <div className="flex items-center justify-center gap-1.5">
        <NodeCard icon={Database}  label="PostgreSQL"  status={dbStatus}    latency={services?.database?.latencyMs} />
        <PulseLine color={pulseColors[redisStatus]} dashed={redisStatus === "down"} />
        <NodeCard icon={HardDrive} label="Redis Cache" status={redisStatus} latency={services?.redis?.latencyMs} />
        <PulseLine color={pulseColors[aiStatus]} dashed={aiStatus === "down"} />
        <NodeCard icon={Brain}     label="AI Service"  status={aiStatus}    latency={services?.aiService?.latencyMs} />
      </div>
    </div>
  );
}
