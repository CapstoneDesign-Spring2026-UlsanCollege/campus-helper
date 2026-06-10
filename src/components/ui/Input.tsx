import React from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  error?: string;
  label?: string;
  variant?: 'default' | 'filled' | 'bordered';
  showPasswordToggle?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon: Icon, error, label, variant = 'default', showPasswordToggle = false, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const canTogglePassword = showPasswordToggle && type === 'password';
    const resolvedType = canTogglePassword ? (showPassword ? 'text' : 'password') : type;
    const baseClass = "w-full min-w-0 rounded-2xl text-white placeholder:text-slate-500 outline-none transition-all duration-200";

    const variants = {
      default: "border border-white/10 bg-[rgba(255,255,255,0.03)] hover:border-white/16 focus:bg-white/[0.06]",
      filled: "border border-transparent bg-[rgba(255,255,255,0.06)] hover:border-white/16 focus:bg-white/[0.08]",
      bordered: "border border-white/16 bg-transparent hover:border-white/24 focus:bg-white/[0.03]",
    };

    const focusClass = error
      ? "focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(255,108,134,0.1)]"
      : "focus:border-brand-indigo focus:shadow-[0_0_0_4px_rgba(124,233,208,0.08)]";

    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
            {label}
          </label>
        )}
        <div className="relative flex w-full min-w-0 items-center">
          {Icon && (
            <div className="absolute left-4 text-slate-500 flex-shrink-0 transition-colors group-focus-within:text-brand-indigo">
              <Icon size={18} />
            </div>
          )}
          <input
            ref={ref}
            type={resolvedType}
            className={cn(
              baseClass,
              variants[variant],
              focusClass,
              Icon ? "pl-11" : "pl-4",
              canTogglePassword ? "pr-12" : "pr-4",
              "py-3.5 text-base md:text-sm",
              error && "border-red-500 focus:border-red-500",
              "min-h-[48px]",
              className
            )}
            {...props}
          />
          {canTogglePassword && (
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/5 hover:text-white"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
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
