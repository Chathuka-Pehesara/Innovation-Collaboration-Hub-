"use client";

import React from "react";
import { motion } from "framer-motion";

interface LatencyChartProps {
  data: number[];
  color?: string;
  height?: number;
}

export default function LatencyChart({ data, color = "#3b82f6", height = 40 }: LatencyChartProps) {
  // We need at least 2 points to draw a line. If less, just return an empty SVG or a flat line.
  const chartData = data.length > 1 ? data : [...data, ...data];
  if (chartData.length === 0) return <div className="h-full w-full bg-slate-100/10 rounded animate-pulse" />;

  const maxVal = Math.max(...chartData, 100); // Minimum ceiling of 100ms
  const minVal = 0;
  
  const range = maxVal - minVal;
  
  // Calculate points
  const points = chartData.map((val, i) => {
    const x = (i / (chartData.length - 1)) * 100;
    const y = 100 - ((val - minVal) / range) * 100;
    return `${x},${y}`;
  }).join(" ");

  // Create area path
  const areaPath = `M 0,100 L ${points.split(" ").map(p => {
    const [x, y] = p.split(",");
    return `${x},${y}`;
  }).join(" L ")} L 100,100 Z`;

  return (
    <div className="w-full relative" style={{ height }}>
      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        <motion.path
          d={areaPath}
          fill={`url(#gradient-${color})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Line */}
        <motion.polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        
        {/* Dots on the last data point */}
        <circle 
          cx="100" 
          cy={100 - ((chartData[chartData.length - 1] - minVal) / range) * 100} 
          r="3" 
          fill={color}
          className="animate-ping"
          style={{ transformOrigin: 'center' }}
        />
        <circle 
          cx="100" 
          cy={100 - ((chartData[chartData.length - 1] - minVal) / range) * 100} 
          r="3" 
          fill="#fff"
          stroke={color}
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
