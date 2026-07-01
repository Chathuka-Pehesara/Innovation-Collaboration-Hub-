import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-[#0F1117] overflow-hidden flex flex-col justify-between">
      {/* Decorative background glow circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Innovation Hub
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="btn-primary py-2 px-5 text-sm">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl w-full mx-auto px-6 py-16 text-center my-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-gray-300 text-xs font-semibold tracking-wide uppercase">Collaborate & Innovate</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Where Big Ideas Find Their{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Perfect Teams
          </span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Launch campus initiatives, assemble multidisciplinary squads with AI skills compatibility, and build tomorrow's solutions together.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/register" className="btn-primary px-8 py-3.5 text-base w-full sm:w-auto">
            Create Free Account
          </Link>
          <Link href="/students" className="btn-secondary px-8 py-3.5 text-base w-full sm:w-auto hover:bg-white/10">
            Browse Innovators &rarr;
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
          <div className="glass-card p-6">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 text-xl">
              🤝
            </div>
            <h3 className="text-white font-bold text-lg mb-2">AI-Powered Team Up</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Find partners automatically based on technical expertise, proficiency synergy, and role compatibility.
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 text-xl">
              💡
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Idea Evaluator</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Get immediate structured feedback, domain breakdown, and technical skill list recommendations from LLMs.
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="w-10 h-10 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-4 text-xl">
              💬
            </div>
            <h3 className="text-white font-bold text-lg mb-2">AI Mentorship</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Stuck on architectural flow or server details? Chat with custom virtual mentors specialized in engineering.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-white/5 bg-[#0B0D12] text-center text-xs text-gray-600">
        <p>&copy; {new Date().getFullYear()} Innovation & Collaboration Hub. All rights reserved.</p>
      </footer>
    </main>
  );
}
