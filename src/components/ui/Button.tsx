"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, 'children'> {
  variant?: 'primary' | 'accent' | 'glass' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  glow?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, glow = false, children, ...props }, ref) => {
    const baseClass = "focus-ring group relative inline-flex min-w-0 items-center justify-center gap-2 overflow-hidden rounded-2xl border text-center font-semibold leading-tight tracking-[0.01em] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50";

    const sizeClasses = {
      sm: "min-h-[40px] px-4 py-2 text-sm",
      md: "min-h-[48px] px-5 py-2.5 text-sm md:text-[15px]",
      lg: "min-h-[54px] px-7 py-3 text-base md:text-lg",
    };

    const variants = {
      primary: "border-transparent bg-[linear-gradient(135deg,#a8f3d7_0%,#7ce9d0_55%,#8bc9ff_100%)] text-[#041017] shadow-[0_14px_30px_rgba(124,233,208,0.18)] hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(124,233,208,0.24)]",
      accent: "border-transparent bg-[linear-gradient(135deg,#ffc071_0%,#ffd59e_100%)] text-[#17100a] shadow-[0_14px_30px_rgba(255,192,113,0.16)] hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(255,192,113,0.22)]",
      glass: "glass-panel border-white/10 bg-white/[0.03] text-white hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]",
      ghost: "border-white/8 bg-transparent text-slate-300 hover:border-white/14 hover:bg-white/[0.04] hover:text-white",
      danger: "border-red-400/20 bg-[linear-gradient(135deg,rgba(255,108,134,0.22),rgba(117,18,42,0.5))] text-white hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,rgba(255,108,134,0.3),rgba(117,18,42,0.62))]",
    };

    const glowEffect = glow ? "shadow-[0_0_0_1px_rgba(124,233,208,0.08),0_18px_40px_rgba(124,233,208,0.18)]" : "";

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.01 }}
        className={cn(baseClass, sizeClasses[size], variants[variant], glowEffect, className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {/* Glow overlay effect */}
        {glow && !isLoading && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        )}

        {isLoading ? (
          <span className="flex min-w-0 items-center justify-center gap-2">
             <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
             <span className="min-w-0 whitespace-normal">Processing...</span>
           </span>
        ) : (
          <span className="inline-flex min-w-0 items-center justify-center gap-2 whitespace-normal break-words">
            {children}
          </span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
