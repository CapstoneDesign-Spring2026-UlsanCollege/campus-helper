"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, ChevronRight, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardNavItems } from '@/lib/navigation';
import { useBodyScrollLock } from '@/lib/use-body-scroll-lock';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function MobileNav({ isOpen, onClose, onLogout }: MobileNavProps) {
  const pathname = usePathname();
  useBodyScrollLock(isOpen);

  const isNavItemActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/dashboard') return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

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
            className="glass-panel fixed bottom-0 left-0 top-0 z-50 flex w-[300px] max-w-[85vw] flex-col border-r border-white/15 md:hidden"
          >
            {/* Header with glow effect */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-brand-indigo/60 via-brand-accent/50 to-transparent" />
              <Link href="/dashboard" className="text-lg font-bold tracking-tight text-white" onClick={onClose}>
                Campus<span className="text-brand-accent">+</span>
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
              {dashboardNavItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = isNavItemActive(item.href);

                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <Link href={item.href} onClick={onClose}>
                      <div className={cn(
                        "group relative flex items-center justify-between overflow-hidden rounded-[18px] px-4 py-3.5 transition-all duration-300",
                        isActive
                          ? "border border-white/14 bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_25px_rgba(0,0,0,0.22)]"
                          : "border border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-white"
                      )}>
                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r bg-gradient-to-b from-brand-indigo to-brand-accent" />
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

            <div className="border-t border-white/10 p-4">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 text-sm font-semibold text-red-100 transition hover:bg-red-500/15"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
