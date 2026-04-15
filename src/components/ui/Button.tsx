"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'accent' | 'glass' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  glow?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, glow = false, children, ...props }, ref) => {
    const baseClass = "relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed group";

    const sizeClasses = {
      sm: "px-4 py-2 text-sm min-h-[40px]",
      md: "px-6 py-2.5 text-base min-h-[48px]",
      lg: "px-8 py-3.5 text-lg min-h-[56px]",
    };

    const variants = {
      primary: "bg-gradient-to-r from-brand-purple to-brand-indigo text-white hover:shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:-translate-y-0.5",
      accent: "bg-gradient-to-r from-brand-accent to-cyan-400 text-black font-semibold hover:shadow-[0_0_30px_rgba(0,245,255,0.4)] hover:-translate-y-0.5",
      glass: "glass-panel text-white hover:bg-white/10 hover:border-white/25",
      ghost: "text-gray-300 hover:text-white hover:bg-white/10",
      danger: "bg-gradient-to-r from-brand-danger to-pink-500 text-white hover:shadow-[0_0_30px_rgba(255,0,110,0.4)] hover:-translate-y-0.5",
    };

    const glowEffect = glow ? "relative overflow-hidden" : "";

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        className={cn(baseClass, sizeClasses[size], variants[variant], glowEffect, className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {/* Glow overlay effect */}
        {glow && !isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        )}

        {isLoading ? (
           <span className="flex items-center gap-2">
             <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
             Processing...
           </span>
        ) : children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
