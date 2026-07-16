"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import AmbientSparks from "./AmbientSparks";

export default function AutumnBackground({ children }: { children: React.ReactNode }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse position (-1 to 1)
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* 1. Base Layer (Static or Gradient Fallback) */}
      <div className="fixed inset-0 z-[-3] bg-background" />
      
      {/* 2. Parallax Image Layer */}
      {!prefersReducedMotion ? (
        <motion.div 
          className="fixed inset-0 z-[-2] bg-cover bg-center bg-no-repeat opacity-40"
          style={{ 
            backgroundImage: "url('/bg-autumn.png')",
            y: backgroundY,
            x: mousePosition.x * -10, // Slight mouse parallax
            scale: 1.05 // Prevent edges from showing during parallax
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
      ) : (
        <div 
          className="fixed inset-0 z-[-2] bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: "url('/bg-autumn.png')" }}
        />
      )}

      {/* 3. Ambient Glow Overlay */}
      <div 
        className="fixed inset-0 z-[-1] opacity-70 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, transparent 0%, var(--background) 100%)",
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
