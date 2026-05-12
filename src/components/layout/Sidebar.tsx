"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { dashboardNavItems } from '@/lib/navigation';

export function Sidebar() {
  const pathname = usePathname();
  const isNavItemActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/dashboard') return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <motion.aside
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass-panel fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-white/10 px-4 pb-6 pt-24 lg:flex"
    >
      <nav className="flex-1 space-y-2 overflow-y-auto">
        {dashboardNavItems.map((item, index) => {
          const isActive = isNavItemActive(item.href);
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
                  "group relative flex items-center gap-3 overflow-hidden rounded-[18px] px-4 py-3.5 transition-all duration-300",
                  isActive
                    ? "border border-white/14 bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_25px_rgba(0,0,0,0.22)]"
                    : "border border-transparent text-slate-400 hover:border-white/8 hover:bg-white/[0.04] hover:text-white"
                )}>
                  {/* Active glow effect */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-indigo to-brand-accent" />
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

                  <span className="truncate font-medium">{item.label}</span>

                  {/* Hover glow */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-indigo/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </motion.aside>
  );
}
