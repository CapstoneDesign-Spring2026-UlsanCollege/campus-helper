"use client";

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, Book, Calendar, Sparkles, Zap, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [userName, setUserName] = useState("Student");
  const [prefix, setPrefix] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
          const u = JSON.parse(storedUser);
          setUserName(u.name.split(' ')[0]);
          if(u.gender === 'male') setPrefix('Mr. ');
          else if(u.gender === 'female') setPrefix('Ms. ');
      }
      setIsLoaded(true);
    } catch(e) {
      setIsLoaded(true);
    }
  }, []);

  const quickActions = [
    {
      title: "AI Assistant",
      icon: Bot,
      href: "/dashboard/ai",
      desc: "Ask questions & get instant help.",
      color: "text-brand-accent",
      gradient: "from-brand-accent/25 to-brand-purple/25",
      bgGradient: "from-cyan-500/10 to-purple-500/10",
      border: "hover:border-cyan-500/30"
    },
    {
      title: "My Timetable",
      icon: Calendar,
      href: "/dashboard/timetable",
      desc: "View your weekly schedule.",
      color: "text-brand-purple",
      gradient: "from-brand-purple/25 to-brand-indigo/25",
      bgGradient: "from-purple-500/10 to-indigo-500/10",
      border: "hover:border-purple-500/30"
    },
    {
      title: "Campus Notes",
      icon: Book,
      href: "/dashboard/notes",
      desc: "Access study materials.",
      color: "text-brand-indigo",
      gradient: "from-brand-indigo/25 to-brand-accent/25",
      bgGradient: "from-indigo-500/10 to-cyan-500/10",
      border: "hover:border-indigo-500/30"
    }
  ];

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-6 overflow-hidden rounded-lg border border-white/10 bg-black/45 p-5 shadow-2xl shadow-black/30"
      >
        <div className="absolute inset-0 bg-[url('/campus_bg.png')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,8,7,0.94),rgba(3,8,7,0.74))]" />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 rounded-full bg-emerald-300/10 border border-emerald-200/20"
          >
            <Zap size={12} className="text-emerald-200" />
            <span className="text-xs font-medium text-emerald-100">Dashboard Overview</span>
          </motion.div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2 text-white">
            Welcome back,{' '}
            <span className="text-emerald-200">
              {prefix}{userName}
            </span>
          </h1>
          <p className="text-sm md:text-base text-gray-400 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-200" />
            Here's what's happening today.
          </p>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {quickActions.map((action, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 + 0.2, duration: 0.4 }}
          >
            <Link href={action.href}>
              <Card
                hover
                variant="bordered"
                className="h-full group cursor-pointer border border-white/10 bg-black/45 transition-all duration-300 hover:border-emerald-200/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="p-3.5 rounded-lg bg-emerald-300/10 text-emerald-100 shadow-xl shadow-black/30 ring-1 ring-white/10"
                  >
                    <action.icon size={22} />
                  </motion.div>
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                  <ArrowRight size={18} className="text-gray-500 group-hover:text-emerald-200 transition-colors" />
                  </motion.div>
                </div>
                <h3 className="text-base md:text-lg font-bold text-white group-hover:text-emerald-100 transition-colors">{action.title}</h3>
                <p className="text-xs md:text-sm text-gray-500 mt-1.5 leading-relaxed">{action.desc}</p>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Info Cards - Enhanced */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Announcements */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card variant="elevated" className="h-full border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full blur-[50px] pointer-events-none" />

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10 relative z-10">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles size={18} className="text-brand-accent" />
              </motion.div>
              <h3 className="text-base md:text-lg font-bold text-white">Latest Announcements</h3>
            </div>

            <div className="flex flex-col items-center justify-center py-8 md:py-10 relative z-10">
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(0, 245, 255, 0.1)",
                    "0 0 40px rgba(0, 245, 255, 0.2)",
                    "0 0 20px rgba(0, 245, 255, 0.1)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-brand-accent/10 to-brand-purple/10 flex items-center justify-center mb-4 border border-brand-accent/20 shadow-inner"
              >
                <Bot size={28} className="text-brand-accent" />
              </motion.div>
              <p className="text-sm md:text-base text-gray-400 text-center px-4">
                No new announcements.
              </p>
              <span className="text-xs text-gray-500 mt-2 inline-flex items-center gap-1">
                <Sparkles size={12} />
                Check back later for updates
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card variant="elevated" className="h-full border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/5 rounded-full blur-[50px] pointer-events-none" />

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10 relative z-10">
              <Calendar size={18} className="text-brand-purple" />
              <h3 className="text-base md:text-lg font-bold text-white">Today's Schedule</h3>
            </div>

            <div className="space-y-3 relative z-10">
              {/* Active Class */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="p-4 rounded-xl glass-panel flex items-center justify-between border-l-4 border-brand-purple group hover:bg-white/10 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-medium text-brand-purple whitespace-nowrap">09:00 AM - 10:30 AM</p>
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-brand-purple/20 rounded-full text-[10px] text-brand-purple font-semibold border border-brand-purple/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-pulse"></span>
                      Live
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm md:text-lg truncate">Advanced Algorithms</h4>
                  <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                    Room 304, ICT Building
                  </p>
                </div>
              </motion.div>

              {/* Upcoming Class */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="p-4 rounded-xl bg-white/5 flex items-center justify-between border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 whitespace-nowrap mb-1">11:00 AM - 12:30 PM</p>
                  <h4 className="font-bold text-gray-300 text-sm md:text-lg truncate group-hover:text-white transition-colors">Machine Learning</h4>
                  <p className="text-xs text-gray-600 truncate flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                    Room 412, AI Center
                  </p>
                </div>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
