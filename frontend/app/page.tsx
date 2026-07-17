'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import GlowCard from '@/components/ui/GlowCard';
import Magnetic from '@/components/ui/Magnetic';
import Logo from '@/components/ui/Logo';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Footer from '@/components/layout/Footer';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring', stiffness: 180, damping: 20 }
    },
  };

  return (
    <main className="relative min-h-screen bg-transparent overflow-hidden flex flex-col justify-between">
      {/* Animated ambient background glow layers */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none animate-blob-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none animate-blob-slow [animation-delay:4s]" />

      {/* Top Header */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 flex justify-between items-center">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <Logo size={64} withText textClassName="text-gray-900 font-bold text-xl tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent font-display" />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
            Sign In
          </Link>
          <Magnetic>
            <Link href="/register" className="btn-primary py-2 px-5 text-sm">
              Get Started
            </Link>
          </Magnetic>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-5xl w-full mx-auto px-6 py-16 text-center my-auto"
      >
        <motion.div 
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/50 border border-black/10 mb-8 backdrop-blur-md shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-gray-700 text-xs font-bold tracking-wide uppercase">Collaborate & Innovate</span>
        </motion.div>

        <motion.h1 
          variants={itemVariants}
          className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight font-display"
        >
          Where Big Ideas Find Their{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-600 to-amber-700 filter drop-shadow-sm">
            Perfect Teams
          </span>
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          className="text-gray-600 font-medium text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Launch campus initiatives, assemble multidisciplinary squads with AI skills compatibility, and build tomorrow's solutions together.
        </motion.p>

        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Magnetic>
            <Link href="/register" className="btn-primary px-8 py-3.5 text-base w-full sm:w-auto">
              Create Free Account
            </Link>
          </Magnetic>
          <Magnetic>
            <Link href="/students" className="btn-secondary px-8 py-3.5 text-base w-full sm:w-auto hover:bg-black/5 text-gray-700 border-black/10">
              Browse Innovators &rarr;
            </Link>
          </Magnetic>
        </motion.div>

        {/* Feature Highlights Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left"
        >
          <motion.div variants={itemVariants}>
            <GlowCard className="p-6 h-full flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 mb-4 text-xl shadow-inner">
                  🤝
                </div>
                <h3 className="text-gray-900 font-bold text-lg mb-2 font-display">AI-Powered Team Up</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Find partners automatically based on technical expertise, proficiency synergy, and role compatibility.
                </p>
              </div>
            </GlowCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlowCard className="p-6 h-full flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 mb-4 text-xl shadow-inner">
                  💡
                </div>
                <h3 className="text-gray-900 font-bold text-lg mb-2 font-display">Idea Evaluator</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Get immediate structured feedback, domain breakdown, and technical skill list recommendations from LLMs.
                </p>
              </div>
            </GlowCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlowCard className="p-6 h-full flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-600/10 border border-amber-600/20 flex items-center justify-center text-amber-700 mb-4 text-xl shadow-inner">
                  💬
                </div>
                <h3 className="text-gray-900 font-bold text-lg mb-2 font-display">AI Mentorship</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Stuck on architectural flow or server details? Chat with custom virtual mentors specialized in engineering.
                </p>
              </div>
            </GlowCard>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
