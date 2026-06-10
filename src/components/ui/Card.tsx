"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
  variant?: 'default' | 'elevated' | 'bordered' | 'glow';
  hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, children, ...props }, ref) => {
    const baseClass = "min-w-0 rounded-[20px] backdrop-blur-2xl";

    const variants = {
      default: "command-card p-6",
      elevated: "command-card p-6 shadow-[0_24px_60px_rgba(0,0,0,0.38)]",
      bordered: "border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))] p-6",
      glow: "command-card border-brand-indigo/20 p-6 shadow-[0_0_0_1px_rgba(124,233,208,0.06),0_24px_60px_rgba(124,233,208,0.08)]",
    };

    const hoverClass = hover
      ? "cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:border-white/14 hover:shadow-[0_28px_70px_rgba(0,0,0,0.42)]"
      : "";

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(baseClass, variants[variant], hoverClass, className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
