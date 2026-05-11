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
      <div className="absolute inset-0 bg-[url('/campus_bg.png')] bg-cover bg-center opacity-50" />
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(5,9,17,0.97)_0%,rgba(5,9,17,0.78)_46%,rgba(5,9,17,0.4)_100%)]" />

      <section className="relative z-10 flex min-h-screen items-center px-5 py-10 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="w-full max-w-6xl"
        >
          <div className="hero-surface max-w-5xl p-6 md:p-10">
            <div className="relative z-10 max-w-4xl">
              <div className="section-kicker">Ulsan Campus+ command center</div>

              <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.94] tracking-tight text-white sm:text-6xl md:text-7xl">
                The campus workspace that feels built for real student flow.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 md:text-lg">
                AI help, semester schedules, notes, campus chat, marketplace activity, and student coordination inside one sharper sci-fi dashboard.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {featurePills.map((item) => (
                  <div
                    key={item.label}
                    className="status-pill bg-black/30 text-slate-200 backdrop-blur"
                  >
                    <item.icon size={14} className="text-emerald-200" />
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
                  <Button size="lg" variant="glass" className="w-full px-6 sm:w-auto">
                    Create account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
