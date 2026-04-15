"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, BookOpen, MessageSquare, Settings, Users, ShoppingBag, MapPin, MessageCircle, X, ChevronRight, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with enhanced blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 md:hidden"
          />

          {/* Slide-out Panel - Enhanced */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-[300px] max-w-[85vw] glass-panel border-r border-white/15 z-50 md:hidden flex flex-col"
          >
            {/* Header with glow effect */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-brand-accent/50 via-brand-purple/50 to-transparent" />
              <Link href="/dashboard" className="text-lg font-bold tracking-tight text-white" onClick={onClose}>
                ULSAN CAMPUS<span className="text-brand-accent">+</span>
              </Link>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Navigation - Enhanced */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <Link href={item.href} onClick={onClose}>
                      <div className={cn(
                        "flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
                        isActive
                          ? "bg-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] border border-white/15"
                          : "text-gray-400 hover:text-white hover:bg-white/8"
                      )}>
                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-accent to-brand-purple rounded-r" />
                        )}

                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <Icon
                              size={20}
                              className={cn(
                                "transition-colors",
                                isActive ? "text-brand-accent" : "group-hover:text-brand-accent"
                              )}
                            />
                          </motion.div>
                          <span className="font-medium">{item.label}</span>
                        </div>

                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <ChevronRight size={16} className="text-brand-accent" />
                          </motion.div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Pro Card - Enhanced */}
            <div className="p-4 border-t border-white/10">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-xl gradient-bg shadow-lg cursor-pointer transform hover:scale-[1.02] transition-all duration-300 border border-white/10 group relative overflow-hidden"
              >
                {/* Animated shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Crown size={14} className="text-brand-accent" />
                    </motion.div>
                    <h4 className="text-sm font-bold text-white">Campus+ Pro</h4>
                  </div>
                  <p className="text-xs text-white/80">Unlock AI-powered features.</p>

                  <div className="mt-3 h-1 rounded-full bg-gradient-to-r from-brand-accent via-brand-purple to-brand-accent bg-[length:200%_100%] animate-shimmer" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
