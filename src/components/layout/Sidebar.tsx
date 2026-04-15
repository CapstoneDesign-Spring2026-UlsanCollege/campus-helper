"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, BookOpen, MessageSquare, Settings, Users, ShoppingBag, MapPin, MessageCircle, Sparkles, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Calendar, label: 'Timetable', href: '/dashboard/timetable' },
  { icon: BookOpen, label: 'Notes', href: '/dashboard/notes' },
  { icon: ShoppingBag, label: 'Marketplace', href: '/dashboard/market' },
  { icon: MapPin, label: 'Lost & Found', href: '/dashboard/lost-found' },
  { icon: Users, label: 'Network', href: '/dashboard/network' },
  { icon: MessageCircle, label: 'Chat', href: '/dashboard/chat' },
  { icon: MessageSquare, label: 'AI Assistant', href: '/dashboard/ai' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 pt-24 pb-6 px-4 glass-panel border-r border-white/10 z-30"
    >
      <nav className="flex-1 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
                  isActive
                    ? "bg-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] border border-white/15"
                    : "text-gray-400 hover:text-white hover:bg-white/8 hover:border-white/10"
                )}>
                  {/* Active glow effect */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-accent to-brand-purple" />
                  )}

                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Icon
                      size={20}
                      className={cn(
                        "transition-colors flex-shrink-0",
                        isActive ? "text-brand-accent" : "group-hover:text-brand-accent"
                      )}
                    />
                  </motion.div>

                  <span className="font-medium truncate">{item.label}</span>

                  {/* Hover glow */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Pro Card - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-auto"
      >
        <div className="p-4 rounded-xl gradient-bg shadow-lg cursor-pointer transform hover:scale-[1.02] transition-all duration-300 border border-white/10 group relative overflow-hidden">
          {/* Animated background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/10 via-brand-purple/10 to-transparent opacity-50 group-hover:opacity-70 transition-opacity" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Crown size={14} className="text-brand-accent" />
              </motion.div>
              <h4 className="text-sm font-bold text-white">Campus+ Pro</h4>
            </div>
            <p className="text-xs text-white/80">Unlock AI-powered features.</p>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-3 h-1 rounded-full bg-gradient-to-r from-brand-accent to-brand-purple"
            />
          </div>
        </div>
      </motion.div>
    </motion.aside>
  );
}
