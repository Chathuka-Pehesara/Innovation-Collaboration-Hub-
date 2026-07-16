'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ThemeToggle from '@/components/ui/ThemeToggle';

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
  const [mounted, setMounted] = useState(false);
  const [leaves, setLeaves] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
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
    <div className="relative min-h-screen w-full bg-gradient-to-b from-[#FFF3EA] via-[#FFFBF7] to-[#FFEFE0] dark:from-[#130D0B] dark:via-[#1B1310] dark:to-[#160F0D] overflow-hidden flex flex-col justify-between transition-colors duration-500">
      
      {/* 0. Top Right Theme Toggler & Home Link */}
      <div className="absolute top-0 right-0 z-50 p-6 flex items-center gap-3">
        <Link href="/" className="text-xs text-amber-900/60 dark:text-white/60 hover:text-amber-950 dark:hover:text-white font-semibold transition-colors bg-white/70 dark:bg-white/5 border border-amber-900/10 dark:border-white/10 px-3.5 py-2.5 rounded-xl backdrop-blur-md">
          Go Home
        </Link>
        <ThemeToggle />
      </div>

      {/* Dynamic Keyframes for Bicycling and Wheel Rotation */}
      {mounted && (
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
      )}

      {/* 1. Curved Ground Backdrop */}
      <svg className="absolute bottom-0 left-0 w-full h-[30vh] pointer-events-none select-none" viewBox="0 0 1440 200" preserveAspectRatio="none">
        <path d="M0,130 Q360,80 720,130 T1440,120 L1440,200 L0,200 Z" className="fill-[#FADBB4] dark:fill-[#2A1B16] transition-colors duration-500" />
        <path d="M0,160 Q480,100 960,165 T1440,140 L1440,200 L0,200 Z" className="fill-[#F0C79A] dark:fill-[#211410] transition-colors duration-500" opacity="0.6" />
      </svg>

      {/* 2. Left Side Autumn Trees */}
      <svg className="absolute bottom-0 left-0 w-[30%] max-w-[280px] h-[65vh] pointer-events-none select-none z-10" viewBox="0 0 300 600" preserveAspectRatio="xMinYMax meet">
        {/* Tree trunks */}
        <rect x="70" y="320" width="14" height="280" className="fill-[#5C2D1F] dark:fill-[#321711] transition-colors duration-500" rx="7" />
        <rect x="150" y="270" width="20" height="330" className="fill-[#421C12] dark:fill-[#22100B] transition-colors duration-500" rx="10" />
        
        {/* Leftmost orange tree */}
        <path d="M20,290 C0,230 20,170 60,190 C100,170 120,230 100,290 C120,330 80,370 60,340 C40,370 0,330 20,290 Z" className="fill-[#E05B35] dark:fill-[#82321E] transition-colors duration-500" />
        
        {/* Middle large red/brown tree */}
        <path d="M100,230 C80,150 110,70 160,90 C210,70 240,150 220,230 C240,280 200,330 160,300 C120,330 80,280 100,230 Z" className="fill-[#A83220] dark:fill-[#681E12] transition-colors duration-500" />
        <path d="M120,200 C105,140 125,90 160,105 C195,90 215,140 200,200 C215,240 185,280 160,255 C135,280 105,240 120,200 Z" className="fill-[#C0422B] dark:fill-[#722013] transition-colors duration-500" opacity="0.85" />
      </svg>

      {/* 3. Right Side Autumn Trees */}
      <svg className="absolute bottom-0 right-0 w-[30%] max-w-[280px] h-[65vh] pointer-events-none select-none z-10" viewBox="0 0 300 600" preserveAspectRatio="xMaxYMax meet">
        {/* Tree trunks */}
        <rect x="90" y="340" width="12" height="260" className="fill-[#5C2D1F] dark:fill-[#321711] transition-colors duration-500" rx="6" />
        <rect x="190" y="240" width="22" height="360" className="fill-[#421C12] dark:fill-[#22100B] transition-colors duration-500" rx="11" />
        
        {/* Inner peach tree */}
        <path d="M50,320 C30,260 60,200 100,220 C140,200 170,260 150,320 C170,360 130,400 100,370 C70,400 30,360 50,320 Z" className="fill-[#ED7E5E] dark:fill-[#9E4A35] transition-colors duration-500" />
        
        {/* Large right orange-red tree */}
        <path d="M120,210 C90,120 130,30 200,50 C270,30 310,120 280,210 C310,270 260,330 200,300 C140,330 90,270 120,210 Z" className="fill-[#D34521] dark:fill-[#7E250F] transition-colors duration-500" />
        <path d="M150,180 C125,110 155,50 200,70 C245,50 275,110 250,180 C275,230 235,280 200,255 C165,280 125,230 150,180 Z" className="fill-[#E65D38] dark:fill-[#8F331A] transition-colors duration-500" opacity="0.85" />
      </svg>

      {/* 4. Beautiful Bicyclist riding from Left to Right */}
      {mounted && (
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
            <path d="M14,90 A18,18 0 0,1 46,90" className="stroke-[#EA580C] dark:stroke-[#9A3412] transition-colors duration-500" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M74,90 A18,18 0 0,1 106,90" className="stroke-[#EA580C] dark:stroke-[#9A3412] transition-colors duration-500" strokeWidth="3" fill="none" strokeLinecap="round" />
            
            {/* Front & Rear Wheels (Spinning) */}
            <g className="animate-spin-wheels" style={{ transformOrigin: '30px 90px' }}>
              <circle cx="30" cy="90" r="18" className="stroke-[#1C1917] dark:stroke-[#E7E5E4] transition-colors duration-500" strokeWidth="3.5" fill="none" />
              <circle cx="30" cy="90" r="15" className="stroke-[#F59E0B] dark:stroke-[#D97706] transition-colors duration-500" strokeWidth="2.5" fill="none" />
              <line x1="12" y1="90" x2="48" y2="90" className="stroke-[#1C1917] dark:stroke-[#44403C] transition-colors duration-500" strokeWidth="1" />
              <line x1="30" y1="72" x2="30" y2="108" className="stroke-[#1C1917] dark:stroke-[#44403C] transition-colors duration-500" strokeWidth="1" />
              <line x1="17.3" y1="77.3" x2="42.7" y2="102.7" className="stroke-[#1C1917] dark:stroke-[#44403C] transition-colors duration-500" strokeWidth="1" />
              <line x1="17.3" y1="102.7" x2="42.7" y2="77.3" className="stroke-[#1C1917] dark:stroke-[#44403C] transition-colors duration-500" strokeWidth="1" />
            </g>
            <g className="animate-spin-wheels" style={{ transformOrigin: '90px 90px' }}>
              <circle cx="90" cy="90" r="18" className="stroke-[#1C1917] dark:stroke-[#E7E5E4] transition-colors duration-500" strokeWidth="3.5" fill="none" />
              <circle cx="90" cy="90" r="15" className="stroke-[#F59E0B] dark:stroke-[#D97706] transition-colors duration-500" strokeWidth="2.5" fill="none" />
              <line x1="72" y1="90" x2="108" y2="90" className="stroke-[#1C1917] dark:stroke-[#44403C] transition-colors duration-500" strokeWidth="1" />
              <line x1="90" y1="72" x2="90" y2="108" className="stroke-[#1C1917] dark:stroke-[#44403C] transition-colors duration-500" strokeWidth="1" />
              <line x1="77.3" y1="77.3" x2="102.7" y2="102.7" className="stroke-[#1C1917] dark:stroke-[#44403C] transition-colors duration-500" strokeWidth="1" />
              <line x1="77.3" y1="102.7" x2="102.7" y2="77.3" className="stroke-[#1C1917] dark:stroke-[#44403C] transition-colors duration-500" strokeWidth="1" />
            </g>
            
            {/* Hubs */}
            <circle cx="30" cy="90" r="3" fill="#1C1917" className="dark:fill-[#E7E5E4] transition-colors duration-500" />
            <circle cx="90" cy="90" r="3" fill="#1C1917" className="dark:fill-[#E7E5E4] transition-colors duration-500" />
  
            {/* Indigo Frame */}
            <path d="M30,90 L52,90 L78,63 L48,63 L30,90" className="stroke-[#1D4ED8] dark:stroke-[#3B82F6] transition-colors duration-500" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M52,90 L48,52 M78,63 L82,45" className="stroke-[#1D4ED8] dark:stroke-[#3B82F6] transition-colors duration-500" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <line x1="90" y1="90" x2="78" y2="63" className="stroke-[#1D4ED8] dark:stroke-[#3B82F6] transition-colors duration-500" strokeWidth="4.5" />
            
            {/* Handlebar */}
            <path d="M82,45 L88,43 L84,39" className="stroke-[#1C1917] dark:stroke-[#E7E5E4] transition-colors duration-500" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {/* Seat */}
            <path d="M42,52 L54,52" className="stroke-[#1C1917] dark:stroke-[#E7E5E4] transition-colors duration-500" strokeWidth="4.5" fill="none" strokeLinecap="round" />
  
            {/* Bouncing Rider Body */}
            <g className="animate-body-bounce">
              {/* Hair Ponytail */}
              <path d="M34,18 C22,14 18,22 10,24 C14,28 24,28 34,22 Z" fill="#D9502B" />
              
              {/* Boots */}
              <path d="M34,88 L42,90 M56,84 L64,86" className="stroke-[#5C2D1F] dark:stroke-[#78350F] transition-colors duration-500" strokeWidth="7" fill="none" strokeLinecap="round" />
              
              {/* Red Trousers Legs */}
              <path d="M48,52 L40,73 L34,88" className="stroke-[#B91C1C] dark:stroke-[#DC2626] transition-colors duration-500" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M48,52 L60,68 L56,84" className="stroke-[#B91C1C] dark:stroke-[#DC2626] transition-colors duration-500" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Blue Winter Coat */}
              <path d="M40,28 L56,28 L52,58 L42,58 Z" className="fill-[#1E3A8A] dark:fill-[#1E40AF] transition-colors duration-500" rx="4" />
  
              {/* Red scarf blowing in wind */}
              <path d="M36,32 C26,30 20,38 12,36 C18,44 26,42 36,36 Z" fill="#DC2626" className="dark:fill-[#EF4444] transition-colors duration-500" />
              <path d="M42,28 C42,22 54,22 54,28 L50,48" className="stroke-[#DC2626] dark:stroke-[#EF4444] transition-colors duration-500" strokeWidth="7.5" fill="none" strokeLinecap="round" />
              <path d="M45,28 C45,24 51,24 51,28" className="stroke-[#FFE4E6] dark:stroke-[#FCA5A5] transition-colors duration-500" strokeWidth="3.5" fill="none" strokeLinecap="round" />
  
              {/* Face details */}
              <circle cx="48" cy="18" r="9" className="fill-[#FDBA74] dark:fill-[#FED7AA] transition-colors duration-500" />
              <circle cx="51" cy="17" r="1.2" className="fill-[#1C1917] dark:fill-[#E7E5E4] transition-colors duration-500" /> {/* Eye */}
              <path d="M49,21 C51,21 52,20 52,19" className="stroke-[#1C1917] dark:stroke-[#E7E5E4] transition-colors duration-500" strokeWidth="1" fill="none" strokeLinecap="round" /> {/* Smile */}
              
              {/* Pom-pom beanie */}
              <path d="M39,16 C39,7 55,7 55,16 Z" className="fill-[#1D4ED8] dark:fill-[#3B82F6] transition-colors duration-500" />
              <circle cx="47" cy="5" r="4" className="fill-[#FFE4E6] dark:fill-[#E7E5E4] transition-colors duration-500" /> {/* Pom-pom */}
              
              {/* Hair */}
              <path d="M42,16 C42,16 46,24 40,26" className="stroke-[#5C2D1F] dark:stroke-[#78350F] transition-colors duration-500" strokeWidth="4" fill="none" strokeLinecap="round" />
              
              {/* Arms reaching to handlebar */}
              <path d="M46,33 L66,45 L78,45" className="stroke-[#1E3A8A] dark:stroke-[#1E40AF] transition-colors duration-500" strokeWidth="5.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
        </motion.div>
      )}
  
      {/* 5. Wind-Blown Flowing Leaves */}
      {mounted && leaves.map((leaf) => (
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
