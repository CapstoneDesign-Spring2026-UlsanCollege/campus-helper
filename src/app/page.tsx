"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Shield, Globe } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Enhanced Cyberpunk Background */}
      <div className="absolute inset-0 -z-10">
        {/* Animated grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%23000000/%22/><path d=%22M0 50 L100 50 M50 0 L50 100%22 stroke=%22%230F0F33/%22 stroke-width=%220.5/%22/><path d=%22M0 0 L100 100 M100 0 L0 100%22 stroke=%22%230F0F33/%22 stroke-width=%220.25/%22/%3E</svg>')] opacity-25 animate-move"/>
        {/* Multi-layer ambient glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(147,51,234,0.08)_0%,_transparent_70%)] mix-blend-screen animate-pulse"/>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.06)_0%,_transparent_70%)] mix-blend-screen"/>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(0,245,255,0.06)_0%,_transparent_70%)] mix-blend-screen"/>
      </div>

      {/* Floating Neon Orbs - Enhanced */}
      <div className="absolute inset-0 -z-5 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[10%] left-[5%] w-[20%] h-[25%] rounded-full bg-brand-purple/15 blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-[15%] right-[10%] w-[25%] h-[30%] rounded-full bg-brand-indigo/15 blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-[60%] left-[70%] w-[15%] h-[20%] rounded-full bg-brand-accent/15 blur-[80px]"
        />
        <motion.div
          animate={{
            scale: [1.1, 0.9, 1.1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 7, repeat: Infinity }}
          className="absolute bottom-[20%] left-[15%] w-[12%] h-[18%] rounded-full bg-brand-danger/15 blur-[70px]"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-3xl px-6">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full glass-panel border border-brand-accent/30"
        >
          <Sparkles size={14} className="text-brand-accent" />
          <span className="text-xs font-medium text-brand-accent tracking-wide">NEXT-GEN CAMPUS PLATFORM</span>
        </motion.div>

        {/* Retro-Futuristic Headline */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl sm:text-7xl md:text-8xl font-display tracking-tighter mb-6 leading-none relative"
        >
          <span className="relative inline-block">
            <span className="relative z-10">ULSAN CAMPUS</span>
            {/* Glow effect behind text */}
            <span className="absolute inset-0 -z-10 bg-brand-purple/30 blur-[20px] scale-75"></span>
          </span>
          <motion.span
            animate={{
              textShadow: [
                "0 0 10px rgba(0,245,255,0.5)",
                "0 0 30px rgba(0,245,255,0.8)",
                "0 0 10px rgba(0,245,255,0.5)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="ml-3 text-brand-accent text-5xl sm:text-6xl md:text-7xl"
          >
            +
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg text-gray-300 mb-4 max-w-2xl leading-relaxed mx-auto"
        >
          The next-generation smart campus platform
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-sm sm:text-base text-brand-accent/90 mb-10 max-w-xl leading-relaxed mx-auto"
        >
          AI-powered intelligent notes • Dynamic schedules • Unified communication nexus
        </motion.p>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-10"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300">
            <Zap size={14} className="text-brand-accent" />
            AI-Powered
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300">
            <Shield size={14} className="text-brand-purple" />
            Secure
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300">
            <Globe size={14} className="text-brand-indigo" />
            Connected
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" glow className="w-full sm:w-[180px] font-display tracking-wider">
              <span className="w-2 h-2 rounded-full bg-brand-purple animate-pulse"></span>
              Login
            </Button>
          </Link>
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" variant="accent" glow className="w-full sm:w-[220px] font-display tracking-wider">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>
              Init Student Node
            </Button>
          </Link>
        </motion.div>

        {/* Decorative Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-16 flex items-center justify-center gap-4"
        >
          <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-brand-purple/50"></div>
          <div className="flex items-center gap-1 text-brand-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" style={{ animationDelay: '300ms' }}></span>
          </div>
          <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-brand-indigo/50"></div>
        </motion.div>
      </div>
    </div>
  );
}
