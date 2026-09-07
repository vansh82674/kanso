'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-zinc-800 selection:text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-zinc-100 flex items-center justify-center">
              <span className="text-zinc-900 font-bold text-[10px] tracking-tighter">K</span>
            </div>
            <span className="font-semibold text-sm tracking-tight">KANSO</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors">
              Sign In
            </Link>
            <Link href="/login" className="text-xs font-medium bg-zinc-100 text-zinc-900 px-3 py-1.5 rounded-md hover:bg-zinc-200 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400/90">Kanso v1.0 is now live</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-zinc-100 leading-tight">
            The high-throughput <br className="hidden sm:block" />
            <span className="text-zinc-400">team productivity OS.</span>
          </h1>
          
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Designed with precision typography, zero artificial clutter, and real-time kanban state synchronization. Built for engineering teams that move fast.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-100 text-zinc-900 px-6 py-3 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors"
            >
              Start Building
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="https://github.com/nexus/kanso"
              target="_blank"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-900 text-zinc-300 border border-zinc-800 px-6 py-3 rounded-lg text-sm font-medium hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
            >
              View on GitHub
            </Link>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-24 text-left"
        >
          <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4">
              <span className="text-xl">⚡</span>
            </div>
            <h3 className="text-sm font-semibold text-zinc-100 mb-2">Real-time Sync</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">Changes propagate instantly across your team using Supabase real-time subscriptions.</p>
          </div>
          <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4">
              <span className="text-xl">🔒</span>
            </div>
            <h3 className="text-sm font-semibold text-zinc-100 mb-2">Secure Tenancy</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">Enterprise-grade isolation ensures your workspace data is only visible to invited members.</p>
          </div>
          <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4">
              <span className="text-xl">🎨</span>
            </div>
            <h3 className="text-sm font-semibold text-zinc-100 mb-2">Minimalist Design</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">No distractions. Just your tasks, beautifully presented in Geist Mono and Inter.</p>
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-zinc-900 py-8 text-center">
        <p className="text-xs font-mono text-zinc-500">© 2026 Kanso OS. Built with Next.js & Supabase.</p>
      </footer>
    </div>
  );
}
