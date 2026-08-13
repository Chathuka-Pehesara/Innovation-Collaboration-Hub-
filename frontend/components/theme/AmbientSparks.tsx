"use client";

import React, { useEffect, useRef, useState } from "react";

interface LeafPhysics {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVy: number;
  size: number;
  swayPhase: number;
  swaySpeed: number;
  swayAmount: number;
  rotation: number;
  rotationSpeed: number;
  leafImage: string;
  opacity: number;
}

export default function AmbientSparks() {
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const leavesData = useRef<LeafPhysics[]>([]);
  const mouse = useRef({ x: -1000, y: -1000 });
  const leafNodes = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    setIsClient(true);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    // Initialize 25 leaves
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    leavesData.current = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * w,
      y: Math.random() * h - h, // Start above or across screen
      vx: 0,
      vy: Math.random() * 0.5 + 0.5,
      baseVy: Math.random() * 0.5 + 0.5, // Natural falling speed
      size: Math.random() * 30 + 30, // 30px to 60px
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.02 + 0.01,
      swayAmount: Math.random() * 0.5 + 0.2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 1.5,
      leafImage: `/leaf${Math.floor(Math.random() * 3) + 1}.png`,
      opacity: Math.random() * 0.4 + 0.5
    }));

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    
    // Mouse leaves screen -> remove repulsion
    const handleMouseLeave = () => {
      mouse.current = { x: -1000, y: -1000 };
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    let animationFrameId: number;

    const loop = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      leavesData.current.forEach((leaf, i) => {
        // Antigravity / Repulsion Physics
        const dx = leaf.x + leaf.size/2 - mouse.current.x;
        const dy = leaf.y + leaf.size/2 - mouse.current.y;
        const distSq = dx * dx + dy * dy;
        const radius = 250; // Effect radius
        const radiusSq = radius * radius;

        if (distSq < radiusSq) {
          const force = (1 - distSq / radiusSq) * 1.5; // Strength of repulsion
          const angle = Math.atan2(dy, dx);
          leaf.vx += Math.cos(angle) * force;
          leaf.vy += Math.sin(angle) * force;
        }

        // Apply friction and natural forces
        leaf.vx *= 0.95; // Horizontal friction
        leaf.vy = leaf.vy * 0.98 + leaf.baseVy * 0.02; // Gradually return to base falling speed

        // Apply sway
        leaf.swayPhase += leaf.swaySpeed;
        const swayX = Math.sin(leaf.swayPhase) * leaf.swayAmount;
        
        leaf.x += leaf.vx + swayX;
        leaf.y += leaf.vy;
        leaf.rotation += leaf.rotationSpeed + leaf.vx * 0.5; // Spin faster when pushed

        // Wrap around screen
        if (leaf.y > height + 100) {
          leaf.y = -100;
          leaf.x = Math.random() * width;
          leaf.vx = 0;
        }
        if (leaf.x > width + 100) leaf.x = -100;
        if (leaf.x < -100) leaf.x = width + 100;

        // Update DOM node directly for high performance
        const node = leafNodes.current[i];
        if (node) {
          node.style.transform = `translate3d(${leaf.x}px, ${leaf.y}px, 0) rotate(${leaf.rotation}deg)`;
        }
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (!isClient) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[0] pointer-events-none overflow-hidden">
      {leavesData.current.map((leaf, i) => (
        <img
          key={leaf.id}
          ref={(el) => { leafNodes.current[i] = el; }}
          src={leaf.leafImage}
          alt=""
          className="absolute top-0 left-0 filter drop-shadow-lg object-contain"
          style={{
            width: `${leaf.size}px`,
            height: 'auto',
            opacity: leaf.opacity,
            willChange: 'transform',
            transform: `translate3d(${leaf.x}px, ${leaf.y}px, 0) rotate(${leaf.rotation}deg)`
          }}
        />
      ))}
    </div>
  );
}
