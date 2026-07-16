"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Spark {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export default function AmbientSparks() {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    if (mediaQuery.matches) return;

    // Generate random sparks and glowing orbs
    const generatedSparks = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // random start X %
      y: 110, // Start below screen
      size: Math.random() * 6 + 2, // 2px to 8px
      duration: Math.random() * 10 + 15, // 15s to 25s floating time
      delay: Math.random() * -20, // Negative delay to pre-populate screen
      opacity: Math.random() * 0.5 + 0.2, // 0.2 to 0.7
    }));
    
    setSparks(generatedSparks);
  }, []);

  if (prefersReducedMotion || sparks.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden mix-blend-screen">
      {sparks.map((spark) => (
        <motion.div
          key={spark.id}
          className="absolute rounded-full"
          initial={{
            x: `${spark.x}vw`,
            y: `${spark.y}vh`,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            y: "-10vh",
            x: [`${spark.x}vw`, `${spark.x - 5}vw`, `${spark.x + 5}vw`, `${spark.x}vw`],
            opacity: [0, spark.opacity, spark.opacity, 0],
            scale: [0, 1, 1, 0.5],
          }}
          transition={{
            duration: spark.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: spark.delay,
          }}
          style={{
            width: spark.size,
            height: spark.size,
            background: `radial-gradient(circle, rgba(232, 160, 60, 1) 0%, rgba(193, 68, 14, 0.5) 50%, rgba(0,0,0,0) 100%)`,
            boxShadow: `0 0 ${spark.size * 2}px ${spark.size}px rgba(193, 68, 14, 0.4)`,
            filter: `blur(${Math.random() > 0.5 ? 1 : 0}px)`,
          }}
        />
      ))}
    </div>
  );
}
