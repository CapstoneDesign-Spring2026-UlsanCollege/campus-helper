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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('Welcome back!');
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('accessToken', data.accessToken);
        router.push('/dashboard');
      } else {
        toast.error(data.error || 'Invalid credentials. Please try again.');
      }
    } catch {
      toast.error('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 sm:p-6">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(12px)',
            color: '#fff',
            border: '1px solid rgba(0, 245, 255, 0.2)',
            fontSize: '14px',
            boxShadow: '0 0 20px rgba(0, 245, 255, 0.1)',
          },
        }}
      />

      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/campus_bg.png')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(4,7,15,0.95),rgba(4,7,15,0.78),rgba(4,7,15,0.92))]" />
      </div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 transition-all duration-300 hover:text-brand-accent group"
        >
          <motion.div whileHover={{ x: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
            <ArrowLeft size={16} />
          </motion.div>
          <span className="group-hover:text-brand-accent">Back to Home</span>
        </Link>

        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="section-kicker mb-4"
          >
            <Zap size={14} className="text-brand-accent" />
            <span>Secure login</span>
          </motion.div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Welcome Back</h1>
          <p className="text-sm text-gray-400">
            Sign in to continue to <span className="font-medium text-brand-accent">ULSAN CAMPUS+</span>
          </p>
        </div>

        <Card variant="elevated" className="relative overflow-hidden p-6 shadow-2xl shadow-black/50 sm:p-8">
          <div className="absolute left-1/2 top-0 h-1 w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-accent/50 to-transparent" />

          <form onSubmit={handleLogin} className="relative z-10 space-y-5">
            <Input
              label="Email Address"
              icon={Mail}
              type="email"
              placeholder="student@ulsan.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Password</label>
                <Link href="/forgot-password" className="text-xs text-brand-accent transition-colors hover:text-white">
                  Forgot Password?
                </Link>
              </div>
              <Input
                icon={Lock}
                type="password"
                showPasswordToggle
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              size="lg"
              glow
              className="mt-2 w-full bg-gradient-to-r from-brand-purple to-brand-indigo hover:from-brand-purple/90 hover:to-brand-indigo/90"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </Card>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center text-sm text-gray-500"
        >
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="border-b border-transparent font-medium text-brand-accent transition-colors hover:border-brand-accent/50 hover:text-white"
          >
            Create Account
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
