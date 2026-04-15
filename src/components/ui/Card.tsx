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
    const baseClass = "rounded-2xl backdrop-blur-2xl";

    const variants = {
      default: "glass-panel p-6",
      elevated: "glass-panel p-6 shadow-2xl shadow-black/50",
      bordered: "bg-white/5 border border-white/15 p-6",
      glow: "glass-panel p-6 border-brand-accent/30 shadow-[0_0_30px_rgba(0,245,255,0.1)]",
    };

    const hoverClass = hover
      ? "transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-purple/10 cursor-pointer"
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
