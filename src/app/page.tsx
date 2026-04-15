"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, CalendarDays, MessageSquareText, ShieldCheck } from 'lucide-react';

const featurePills = [
  { icon: MessageSquareText, label: 'AI study help' },
  { icon: CalendarDays, label: 'Campus schedule' },
  { icon: BookOpen, label: 'Notes and resources' },
  { icon: ShieldCheck, label: 'Student account' },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-white">
      <div className="absolute inset-0 bg-[url('/campus_bg.png')] bg-cover bg-center opacity-45" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,8,7,0.96)_0%,rgba(3,8,7,0.72)_46%,rgba(3,8,7,0.34)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:56px_56px] opacity-35" />

      <section className="relative z-10 flex min-h-screen items-center px-5 py-10 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="w-full max-w-5xl"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200/25 bg-black/35 px-3 py-1.5 text-xs font-semibold text-emerald-100 backdrop-blur">
            Ulsan Campus+ command center
          </div>

          <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-tight text-white sm:text-6xl md:text-7xl">
            ULSAN CAMPUS<span className="text-emerald-200">+</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 md:text-lg">
            A calmer, faster student workspace for AI assistance, schedules, notes, campus chat, marketplace posts, and everyday academic flow.
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            {featurePills.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm text-slate-200 backdrop-blur"
              >
                <item.icon size={16} className="text-emerald-200" />
                {item.label}
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/login">
              <Button size="lg" className="w-full gap-2 px-6 sm:w-auto">
                Login
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="glass" className="w-full border-white/15 bg-black/35 px-6 sm:w-auto">
                Create account
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
