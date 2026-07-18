"use client";

import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSayingHi, setIsSayingHi] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Start continuous riding once the element is actually in the DOM
      controls.start({
        x: ["-20vw", "110vw"],
        transition: { duration: 16, repeat: Infinity, ease: "linear" },
      });
    }
  }, [mounted, controls]);

  const handleBicyclistClick = () => {
    if (isPaused) return;
    setIsPaused(true);
    setIsSayingHi(true);
    
    // Immediately pause movement
    controls.stop();

    setTimeout(() => {
      setIsSayingHi(false);
      setIsPaused(false);
      
      // Get current translation (approximation not easily possible with standard controls.start without reading DOM)
      // Actually, Framer Motion allows resuming if we just re-trigger start with the same target, 
      // but it will calculate from current position! But it might speed up.
      // Easiest is just to restart from the beginning, OR we just let him ride off.
      // Since restarting might look jumpy, we can just restart the loop.
      controls.start({
        x: "110vw",
        transition: { duration: 8, ease: "linear" },
      }).then(() => {
        // Once he finishes this trip, go back to infinite loop
        controls.start({
          x: ["-20vw", "110vw"],
          transition: { duration: 16, repeat: Infinity, ease: "linear" },
        });
      });
    }, 3000);
  };

  return (
    <div className="relative min-h-screen w-full bg-transparent overflow-hidden flex flex-col justify-between">
      
      {/* 1. Curved Ground Backdrop for Auth Context */}
      <svg className="absolute bottom-0 left-0 w-full h-[30vh] pointer-events-none select-none fill-[#FADBB4]/60 mix-blend-multiply" viewBox="0 0 1440 200" preserveAspectRatio="none">
        <path d="M0,130 Q360,80 720,130 T1440,120 L1440,200 L0,200 Z" />
        <path d="M0,160 Q480,100 960,165 T1440,140 L1440,200 L0,200 Z" fill="#F0C79A" opacity="0.6" />
      </svg>

      {/* 2. Beautiful Bicyclist riding from Left to Right */}
      {mounted && (
        <motion.div 
          className="absolute bottom-[3.5vh] w-[140px] h-[140px] select-none z-50 cursor-pointer"
          initial={{ x: "-20vw" }}
          animate={controls}
          onClick={handleBicyclistClick}
        >
          {isSayingHi && (
            <div className="absolute top-[-30px] right-[-10px] bg-white text-gray-800 px-4 py-2 rounded-2xl shadow-lg border border-gray-100 font-bold text-sm animate-bounce z-30 pointer-events-none">
              Hi! 👋
              <div className="absolute bottom-[-5px] left-[15px] w-3 h-3 bg-white transform rotate-45 border-b border-r border-gray-100"></div>
            </div>
          )}
          
          <svg viewBox="0 0 160 160" className="w-full h-full pointer-events-none">
            {/* Bicycle Mudguards */}
            <path d="M14,90 A18,18 0 0,1 46,90" stroke="#EA580C" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M74,90 A18,18 0 0,1 106,90" stroke="#EA580C" strokeWidth="3" fill="none" strokeLinecap="round" />
            
            {/* Front & Rear Wheels (Spinning) */}
            <g style={{ transformOrigin: "30px 90px", animation: isPaused ? "none" : "spin-wheels 0.8s infinite linear" }}>
              <circle cx="30" cy="90" r="18" stroke="#1C1917" strokeWidth="3.5" fill="none" />
              <circle cx="30" cy="90" r="15" stroke="#F59E0B" strokeWidth="2.5" fill="none" />
              <line x1="12" y1="90" x2="48" y2="90" stroke="#1C1917" strokeWidth="1" />
              <line x1="30" y1="72" x2="30" y2="108" stroke="#1C1917" strokeWidth="1" />
              <line x1="17.3" y1="77.3" x2="42.7" y2="102.7" stroke="#1C1917" strokeWidth="1" />
              <line x1="17.3" y1="102.7" x2="42.7" y2="77.3" stroke="#1C1917" strokeWidth="1" />
            </g>
            <g style={{ transformOrigin: "90px 90px", animation: isPaused ? "none" : "spin-wheels 0.8s infinite linear" }}>
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
            
            {/* Handlebar & Seat */}
            <path d="M82,45 L88,43 L84,39" stroke="#1C1917" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M42,52 L54,52" stroke="#1C1917" strokeWidth="4.5" fill="none" strokeLinecap="round" />
  
            {/* Bouncing Rider Body */}
            <g style={{ animation: isPaused ? "none" : "body-bounce 0.4s infinite ease-in-out" }}>
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
              <circle cx="51" cy="17" r="1.2" fill="#1C1917" /> 
              <path d="M49,21 C51,21 52,20 52,19" stroke="#1C1917" strokeWidth="1" fill="none" strokeLinecap="round" /> 
              {/* Pom-pom beanie */}
              <path d="M39,16 C39,7 55,7 55,16 Z" fill="#1D4ED8" />
              <circle cx="47" cy="5" r="4" fill="#FFE4E6" />
              {/* Hair */}
              <path d="M42,16 C42,16 46,24 40,26" stroke="#5C2D1F" strokeWidth="4" fill="none" strokeLinecap="round" />
              {/* Arms reaching to handlebar (or waving!) */}
              <g style={{ 
                transformOrigin: "46px 33px", 
                animation: isPaused ? "wave-arm 0.4s infinite alternate ease-in-out" : "none" 
              }}>
                <path 
                  d={isPaused ? "M46,33 L60,15 L65,10" : "M46,33 L66,45 L78,45"} 
                  stroke="#1E3A8A" 
                  strokeWidth="5.5" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </g>
            </g>
          </svg>
        </motion.div>
      )}
  
      {/* 3. Form Content Area */}
      <div className="relative z-20 flex-1 w-full flex items-center justify-center">
        {children}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-wheels {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes body-bounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes wave-arm {
          from { transform: rotate(-15deg); }
          to { transform: rotate(15deg); }
        }
      ` }} />
    </div>
  );
}
