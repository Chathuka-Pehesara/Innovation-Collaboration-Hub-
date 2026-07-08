'use client';

import React, { useRef } from 'react';
import { motion, HTMLMotionProps, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';

interface GlowCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  tiltEffect?: boolean;
}

export default function GlowCard({ children, className = '', tiltEffect = true, ...props }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Mouse coordinates inside card
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Elastic springs for tilt
  const rotateX = useSpring(0, { stiffness: 120, damping: 18 });
  const rotateY = useSpring(0, { stiffness: 120, damping: 18 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    mouseX.set(x);
    mouseY.set(y);

    if (tiltEffect) {
      // Cap rotation at ±3 degrees for premium feel (subtle, not gimmicky)
      const rx = ((y - height / 2) / (height / 2)) * -3;
      const ry = ((x - width / 2) / (width / 2)) * 3;
      rotateX.set(rx);
      rotateY.set(ry);
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    rotateX.set(0);
    rotateY.set(0);
    
    // Invoke parent mouse leave handler if defined
    if (props.onMouseLeave) {
      props.onMouseLeave(e);
    }
  };

  // Masked border glowing spotlight
  const borderBackground = useMotionTemplate`
    radial-gradient(
      320px circle at ${mouseX}px ${mouseY}px,
      var(--accent-primary),
      transparent 80%
    )
  `;

  // Ambient backdrop glow follow
  const ambientBackground = useMotionTemplate`
    radial-gradient(
      350px circle at ${mouseX}px ${mouseY}px,
      rgba(139, 92, 246, 0.08),
      transparent 80%
    )
  `;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
        ...props.style,
      }}
      className={`glass-card p-6 overflow-hidden relative group cursor-pointer ${className}`}
      {...props}
    >
      {/* Interactive Border Spotlight Glow */}
      <motion.div
        className="absolute inset-[-1px] rounded-[inherit] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
        style={{
          background: borderBackground,
          WebkitMaskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '1px',
        }}
      />
      
      {/* Background Ambient Glow */}
      <motion.div
        className="absolute -inset-px rounded-[inherit] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
        style={{
          background: ambientBackground,
        }}
      />

      <div className="relative z-10" style={{ transform: 'translateZ(10px)' }}>{children}</div>
    </motion.div>
  );
}
