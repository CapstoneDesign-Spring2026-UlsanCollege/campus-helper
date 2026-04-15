import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  error?: string;
  label?: string;
  variant?: 'default' | 'filled' | 'bordered';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon: Icon, error, label, variant = 'default', ...props }, ref) => {
    const baseClass = "w-full rounded-lg text-white placeholder-gray-500 outline-none transition-all duration-300";

    const variants = {
      default: "bg-white/5 border border-white/10 hover:border-white/20 focus:bg-white/10",
      filled: "bg-white/10 border border-transparent hover:border-white/20 focus:bg-white/15",
      bordered: "bg-transparent border border-white/20 hover:border-white/30 focus:bg-white/5",
    };

    const focusClass = error
      ? "focus:border-red-500 focus:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
      : "focus:border-brand-purple focus:shadow-[0_0_20px_rgba(147,51,234,0.3)]";

    return (
      <div className="w-full">
        {label && (
          <label className="text-xs text-gray-400 mb-2 block uppercase tracking-wider font-bold">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {Icon && (
            <div className="absolute left-4 text-gray-400 flex-shrink-0 transition-colors group-focus-within:text-brand-purple">
              <Icon size={18} />
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              baseClass,
              variants[variant],
              focusClass,
              Icon ? "pl-11 pr-4" : "px-4",
              "py-3",
              error && "border-red-500 focus:border-red-500",
              "min-h-[48px]",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
