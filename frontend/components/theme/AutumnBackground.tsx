"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import AmbientSparks from "./AmbientSparks";

export default function AutumnBackground({ children }: { children: React.ReactNode }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const { scrollYProgress } = useScroll();
  
  // Smooth out scroll progress for parallax
  const smoothScrollY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Background moves slightly slower than scrolling (parallax)
  const backgroundY = useTransform(smoothScrollY, [0, 1], ["0%", "15%"]);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    if (mediaQuery.matches) return;
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* 1. Base Layer (Static or Gradient Fallback) */}
      <div className="fixed inset-0 z-[-3] bg-background" />
      
      {/* 2. Parallax Image Layer (Faded for absolute text legibility) */}
      {!prefersReducedMotion ? (
        <motion.div 
          className="fixed inset-0 z-[-2] bg-cover bg-top bg-no-repeat opacity-[0.15]"
          style={{ 
            backgroundImage: "url('/bg-autumn-light.png')",
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
      ) : (
        <div 
          className="fixed inset-0 z-[-2] bg-cover bg-top bg-no-repeat opacity-[0.15]"
          style={{ backgroundImage: "url('/bg-autumn-light.png')" }}
        />
      )}

      {/* 3. Ambient Glow Overlay (Soft light enhancement) */}
      <div 
        className="fixed inset-0 z-[-1] opacity-40 pointer-events-none"
        style={{
          background: "radial-gradient(circle at top right, rgba(255, 255, 255, 0.4) 0%, transparent 60%)",
        }}
      />

      {/* 4. Particle Layer (Ambient Sparks) */}
      <AmbientSparks />

      {/* Main Content */}
      <div className="relative z-0">
        {children}
      </div>
    </div>
  );
}
