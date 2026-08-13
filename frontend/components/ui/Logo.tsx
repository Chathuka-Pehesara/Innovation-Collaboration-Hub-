'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import logoImg from '@/images/logo.png';

interface LogoProps {
  size?: number;
  animate?: boolean;
  className?: string;
  withText?: boolean;
  textClassName?: string;
}

export default function Logo({
  size = 40,
  animate = true,
  className = '',
  withText = false,
  textClassName = '',
}: LogoProps) {
  // Container variants for the floating breath effect
  const containerVariants = {
    initial: { y: 0 },
    animate: animate
      ? {
          y: [0, -1.5, 0],
          transition: {
            duration: 5.0,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }
      : {},
  };

  // Glow ring variants on hover
  const glowVariants = {
    initial: { opacity: 0.15, scale: 0.8 },
    hover: {
      opacity: 0.3,
      scale: 1.05,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  };

  // Image wrapper hover variants (spring mechanics)
  const imageVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.03,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 15,
      },
    },
  };

  // Shimmer effect variants
  const shimmerVariants = {
    initial: { x: '-150%' },
    hover: {
      x: '150%',
      transition: {
        duration: 1.4,
        ease: 'easeInOut',
      },
    },
  };

  const logoSizeStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <motion.div
        className="relative flex items-center justify-center shrink-0"
        style={logoSizeStyle}
        variants={containerVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
      >
        {/* Ambient backing glow aura */}
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-tr from-accent-primary to-accent-secondary blur-md pointer-events-none"
          style={{
            // Fallback colors matching the theme in case custom tailwind config is resolved dynamically
            background: 'linear-gradient(135deg, var(--accent-primary, #B23220) 0%, var(--accent-secondary, #F59E0B) 100%)',
          }}
          variants={glowVariants}
        />

        {/* Logo wrapper */}
        <motion.div
          className="relative w-full h-full overflow-hidden flex items-center justify-center cursor-pointer rounded-lg"
          variants={imageVariants}
        >
          {/* Logo PNG Image */}
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={logoImg}
              alt="Innovation Hub Logo"
              width={size * 1.5}
              height={size * 1.5}
              priority
              className="object-contain w-full h-full"
            />
          </div>

          {/* Shimmer Light-Sweep Overlay */}
          <motion.div
            className="absolute top-0 bottom-0 w-[40%] skew-x-[-25deg] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"
            variants={shimmerVariants}
          />
        </motion.div>
      </motion.div>

      {withText && (
        <span
          className={`font-bold tracking-tight font-display ${
            textClassName || 'text-lg bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
          }`}
        >
          Innovation Hub
        </span>
      )}
    </div>
  );
}
