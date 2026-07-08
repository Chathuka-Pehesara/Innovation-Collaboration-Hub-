'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const LEAF_PATHS = [
  // Classic birch leaf
  "M10 0C15 4 20 10 20 16C20 22 15 26 10 26C5 22 0 22 0 16C0 10 5 4 10 0Z",
  // Oval leaf with stem
  "M10 2C16 8 16 16 10 22C4 16 4 8 10 2ZM10 22V26",
  // Wide heart leaf
  "M10 0C16 3 20 9 17 17C14 25 10 24 10 24C10 24 6 25 3 17C0 9 4 3 10 0Z",
  // Pointy leaf
  "M10 0C18 10 18 20 10 28C2 20 2 10 10 0Z"
];

const LEAF_COLORS = [
  '#C2410C', // Rust Orange
  '#DC2626', // Crimson Red
  '#F59E0B', // Golden Amber
  '#B91C1C', // Deep Red
  '#E05B35', // Autumn Peach
  '#854D0E', // Golden Olive
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [leaves, setLeaves] = useState<any[]>([]);

  useEffect(() => {
    // Generate 25 leaves with randomized metrics
    const generated = Array.from({ length: 25 }).map((_, i) => {
      const yStart = Math.random() * 85; // Starting height percentage
      const ySway = 40 + Math.random() * 100; // Vertical drift pixels
      return {
        id: i,
        path: LEAF_PATHS[Math.floor(Math.random() * LEAF_PATHS.length)],
        color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
        scale: 0.6 + Math.random() * 0.7,
        duration: 9 + Math.random() * 11, // Floating speed seconds
        delay: Math.random() * -20, // Negative delay so leaves exist immediately on load
        yStart: `${yStart}vh`,
        ySway: ySway,
        rotation: Math.random() * 360,
      };
    });
    setLeaves(generated);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-[#FFF3EA] via-[#FFFBF7] to-[#FFEFE0] overflow-hidden flex flex-col justify-between">
      
      {/* Dynamic Keyframes for Bicycling and Wheel Rotation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-wheels {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes body-bounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        .animate-spin-wheels {
          animation: spin-wheels 0.8s infinite linear;
        }
        .animate-body-bounce {
          animation: body-bounce 0.4s infinite ease-in-out;
        }
      ` }} />

      {/* 1. Curved Ground Backdrop */}
      <svg className="absolute bottom-0 left-0 w-full h-[30vh] pointer-events-none select-none fill-[#FADBB4]" viewBox="0 0 1440 200" preserveAspectRatio="none">
        <path d="M0,130 Q360,80 720,130 T1440,120 L1440,200 L0,200 Z" />
        <path d="M0,160 Q480,100 960,165 T1440,140 L1440,200 L0,200 Z" fill="#F0C79A" opacity="0.6" />
      </svg>

      {/* 2. Left Side Autumn Trees */}
      <svg className="absolute bottom-0 left-0 w-[30%] max-w-[280px] h-[65vh] pointer-events-none select-none z-10" viewBox="0 0 300 600" preserveAspectRatio="xMinYMax meet">
        {/* Tree trunks */}
        <rect x="70" y="320" width="14" height="280" fill="#5C2D1F" rx="7" />
        <rect x="150" y="270" width="20" height="330" fill="#421C12" rx="10" />
        
        {/* Leftmost orange tree */}
        <path d="M20,290 C0,230 20,170 60,190 C100,170 120,230 100,290 C120,330 80,370 60,340 C40,370 0,330 20,290 Z" fill="#E05B35" />
        
        {/* Middle large red/brown tree */}
        <path d="M100,230 C80,150 110,70 160,90 C210,70 240,150 220,230 C240,280 200,330 160,300 C120,330 80,280 100,230 Z" fill="#A83220" />
        <path d="M120,200 C105,140 125,90 160,105 C195,90 215,140 200,200 C215,240 185,280 160,255 C135,280 105,240 120,200 Z" fill="#C0422B" opacity="0.85" />
      </svg>

      {/* 3. Right Side Autumn Trees */}
      <svg className="absolute bottom-0 right-0 w-[30%] max-w-[280px] h-[65vh] pointer-events-none select-none z-10" viewBox="0 0 300 600" preserveAspectRatio="xMaxYMax meet">
        {/* Tree trunks */}
        <rect x="90" y="340" width="12" height="260" fill="#5C2D1F" rx="6" />
        <rect x="190" y="240" width="22" height="360" fill="#421C12" rx="11" />
        
        {/* Inner peach tree */}
        <path d="M50,320 C30,260 60,200 100,220 C140,200 170,260 150,320 C170,360 130,400 100,370 C70,400 30,360 50,320 Z" fill="#ED7E5E" />
        
        {/* Large right orange-red tree */}
        <path d="M120,210 C90,120 130,30 200,50 C270,30 310,120 280,210 C310,270 260,330 200,300 C140,330 90,270 120,210 Z" fill="#D34521" />
        <path d="M150,180 C125,110 155,50 200,70 C245,50 275,110 250,180 C275,230 235,280 200,255 C165,280 125,230 150,180 Z" fill="#E65D38" opacity="0.85" />
      </svg>

      {/* 4. Beautiful Bicyclist riding from Left to Right */}
      <motion.div 
        className="absolute bottom-[3.5vh] w-[140px] h-[140px] pointer-events-none select-none z-20"
        initial={{ x: '-150px' }}
        animate={{ x: '100vw' }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <svg viewBox="0 0 160 160" className="w-full h-full">
          {/* Bicycle Mudguards */}
          <path d="M14,90 A18,18 0 0,1 46,90" stroke="#EA580C" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M74,90 A18,18 0 0,1 106,90" stroke="#EA580C" strokeWidth="3" fill="none" strokeLinecap="round" />
          
          {/* Front & Rear Wheels (Spinning) */}
          <g className="animate-spin-wheels" style={{ transformOrigin: '30px 90px' }}>
            <circle cx="30" cy="90" r="18" stroke="#1C1917" strokeWidth="3.5" fill="none" />
            <circle cx="30" cy="90" r="15" stroke="#F59E0B" strokeWidth="2.5" fill="none" />
            <line x1="12" y1="90" x2="48" y2="90" stroke="#1C1917" strokeWidth="1" />
            <line x1="30" y1="72" x2="30" y2="108" stroke="#1C1917" strokeWidth="1" />
            <line x1="17.3" y1="77.3" x2="42.7" y2="102.7" stroke="#1C1917" strokeWidth="1" />
            <line x1="17.3" y1="102.7" x2="42.7" y2="77.3" stroke="#1C1917" strokeWidth="1" />
          </g>
          <g className="animate-spin-wheels" style={{ transformOrigin: '90px 90px' }}>
            <circle cx="90" cy="90" r="18" stroke="#1C1917" strokeWidth="3.5" fill="none" />
            <circle cx="90" cy="90" r="15" stroke="#F59E0B" strokeWidth="2.5" fill="none" />
            <line x1="72" y1="90" x2="108" y2="90" stroke="#1C1917" strokeWidth="1" />
            <line x1="90" y1="72" x2="90" y2="108" stroke="#1C1917" strokeWidth="1" />
            <line x1="77.3" y1="77.3" x2="102.7" y2="102.7" stroke="#1C1917" strokeWidth="1" />
            <line x1="77.3" y1="102.7" x2="102.7" y2="77.3" stroke="#1C1917" strokeWidth="1" />
          </g>
          
          {/* Hubs */}
          <circle cx="30" cy="90" r="3" fill="#1C1917" />
          <circle cx="90" cy="90" r="3" fill="#1C1917" />

          {/* Indigo Frame */}
          <path d="M30,90 L52,90 L78,63 L48,63 L30,90" stroke="#1D4ED8" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M52,90 L48,52 M78,63 L82,45" stroke="#1D4ED8" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <line x1="90" y1="90" x2="78" y2="63" stroke="#1D4ED8" strokeWidth="4.5" />
          
          {/* Handlebar */}
          <path d="M82,45 L88,43 L84,39" stroke="#1C1917" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* Seat */}
          <path d="M42,52 L54,52" stroke="#1C1917" strokeWidth="4.5" fill="none" strokeLinecap="round" />

          {/* Bouncing Rider Body */}
          <g className="animate-body-bounce">
            {/* Hair Ponytail */}
            <path d="M34,18 C22,14 18,22 10,24 C14,28 24,28 34,22 Z" fill="#D9502B" />
            
            {/* Boots */}
            <path d="M34,88 L42,90 M56,84 L64,86" stroke="#5C2D1F" strokeWidth="7" fill="none" strokeLinecap="round" />
            
            {/* Red Trousers Legs */}
            <path d="M48,52 L40,73 L34,88" stroke="#B91C1C" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M48,52 L60,68 L56,84" stroke="#B91C1C" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Blue Winter Coat */}
            <path d="M40,28 L56,28 L52,58 L42,58 Z" fill="#1E3A8A" rx="4" />

            {/* Red scarf blowing in wind */}
            <path d="M36,32 C26,30 20,38 12,36 C18,44 26,42 36,36 Z" fill="#DC2626" />
            <path d="M42,28 C42,22 54,22 54,28 L50,48" stroke="#DC2626" strokeWidth="7.5" fill="none" strokeLinecap="round" />
            <path d="M45,28 C45,24 51,24 51,28" stroke="#FFE4E6" strokeWidth="3.5" fill="none" strokeLinecap="round" />

            {/* Face details */}
            <circle cx="48" cy="18" r="9" fill="#FDBA74" />
            <circle cx="51" cy="17" r="1.2" fill="#1C1917" /> {/* Eye */}
            <path d="M49,21 C51,21 52,20 52,19" stroke="#1C1917" strokeWidth="1" fill="none" strokeLinecap="round" /> {/* Smile */}
            
            {/* Pom-pom beanie */}
            <path d="M39,16 C39,7 55,7 55,16 Z" fill="#1D4ED8" />
            <circle cx="47" cy="5" r="4" fill="#FFE4E6" /> {/* Pom-pom */}
            
            {/* Hair */}
            <path d="M42,16 C42,16 46,24 40,26" stroke="#5C2D1F" strokeWidth="4" fill="none" strokeLinecap="round" />
            
            {/* Arms reaching to handlebar */}
            <path d="M46,33 L66,45 L78,45" stroke="#1E3A8A" strokeWidth="5.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </motion.div>

      {/* 5. Wind-Blown Flowing Leaves */}
      {leaves.map((leaf) => (
        <motion.svg
          key={leaf.id}
          className="absolute pointer-events-none select-none z-0"
          style={{
            top: leaf.yStart,
            width: 22 * leaf.scale,
            height: 22 * leaf.scale,
            fill: leaf.color,
          }}
          viewBox="0 0 20 28"
          initial={{ x: '-10vw', rotate: leaf.rotation, opacity: 0 }}
          animate={{
            x: '110vw',
            y: [0, leaf.ySway, -leaf.ySway, leaf.ySway / 2, 0],
            rotate: leaf.rotation + 720,
            opacity: [0, 0.9, 0.9, 0.9, 0],
          }}
          transition={{
            duration: leaf.duration,
            delay: leaf.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <path d={leaf.path} />
        </motion.svg>
      ))}

      {/* 6. Form Content Area */}
      <div className="relative z-20 flex-1 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
