"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, ArrowLeft, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if(res.ok) {
        toast.success("Welcome back!");
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('accessToken', data.accessToken);
        router.push('/dashboard');
      } else {
        toast.error(data.error || "Invalid credentials. Please try again.");
      }
    } catch { toast.error("Connection error. Please try again."); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(12px)',
            color: '#fff',
            border: '1px solid rgba(0, 245, 255, 0.2)',
            fontSize: '14px',
            boxShadow: '0 0 20px rgba(0, 245, 255, 0.1)'
          }
        }}
      />

      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/campus_bg.png')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(4,7,15,0.95),rgba(4,7,15,0.78),rgba(4,7,15,0.92))]" />
      </div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-brand-accent transition-all duration-300 mb-6 group"
        >
          <motion.div
            whileHover={{ x: -4 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <ArrowLeft size={16} />
          </motion.div>
          <span className="group-hover:text-brand-accent">Back to Home</span>
        </Link>

        {/* Header with enhanced styling */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          className="section-kicker mb-4"
          >
            <Zap size={14} className="text-brand-accent" />
            <span>Secure login</span>
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-400">
            Sign in to continue to <span className="text-brand-accent font-medium">ULSAN CAMPUS+</span>
          </p>
        </div>

        {/* Login Form Card - Enhanced */}
        <Card
          variant="elevated"
          className="relative overflow-hidden p-6 shadow-2xl shadow-black/50 sm:p-8"
        >
          {/* Subtle glow effect at top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-brand-accent/50 to-transparent" />

          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            <div>
              <Input
                label="Email Address"
                icon={Mail}
                type="email"
                placeholder="student@ulsan.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-400 block uppercase tracking-wider font-bold">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-brand-accent hover:text-white transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <Input
                icon={Lock}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              size="lg"
              glow
              className="w-full mt-2 bg-gradient-to-r from-brand-purple to-brand-indigo hover:from-brand-purple/90 hover:to-brand-indigo/90"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </Card>

        {/* Sign Up Link - Enhanced */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-gray-500 mt-6 text-sm"
        >
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="text-brand-accent hover:text-white font-medium transition-colors border-b border-transparent hover:border-brand-accent/50"
          >
            Create Account
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
