"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, User, Hash, GraduationCap, ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', studentId: '', department: '', gender: 'male' });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if(res.ok) {
        toast.success("Account created! Redirecting to login...");
        setTimeout(() => router.push('/login'), 1500);
      } else {
        toast.error(data.error || "Sign up failed. Please try again.");
      }
    } catch(e) { toast.error("Connection error. Please try again."); }
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

      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/15 via-transparent to-brand-purple/15" />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/4 right-1/4 w-72 h-72 bg-brand-accent/25 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
          className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-brand-purple/25 rounded-full blur-[120px]"
        />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22><path d=%22M0 20 L40 20 M20 0 L20 40%22 stroke=%22%23ffffff%22 stroke-width=%220.25%22 opacity=%220.03%22/></svg>')]"/>
      </div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg"
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
            className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-white/5 border border-white/10"
          >
            <Sparkles size={14} className="text-brand-accent animate-pulse" />
            <span className="text-xs font-medium text-gray-300">CREATE ACCOUNT</span>
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Join <span className="text-gradient-accent">ULSAN CAMPUS+</span>
          </h1>
          <p className="text-sm text-brand-accent uppercase tracking-widest font-bold">
            Next-Gen Campus Platform
          </p>
        </div>

        {/* Signup Form Card - Enhanced */}
        <Card
          variant="glow"
          className="shadow-2xl shadow-black/50 p-6 sm:p-8 backdrop-blur-2xl relative overflow-hidden"
        >
          {/* Subtle glow effect at top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-brand-accent/50 to-transparent" />

          <form onSubmit={handleSignup} className="space-y-4 relative z-10">
            {/* Name & Gender Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Full Name"
                  icon={User}
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-2 block uppercase tracking-wider font-bold">
                  Gender
                </label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-accent focus:shadow-[0_0_20px_rgba(0,245,255,0.2)] transition-all duration-300 min-h-[48px] hover:border-white/20"
                  value={formData.gender}
                  onChange={e => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="male">Male (Mr.)</option>
                  <option value="female">Female (Ms.)</option>
                </select>
              </div>
            </div>

            {/* Email */}
            <div>
              <Input
                label="Email Address"
                icon={Mail}
                type="email"
                placeholder="student@ulsan.edu"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            {/* Student ID & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Student ID"
                  icon={Hash}
                  placeholder="2026xxxx"
                  value={formData.studentId}
                  onChange={e => setFormData({...formData, studentId: e.target.value})}
                  required
                />
              </div>
              <div>
                <Input
                  label="Major / Dept"
                  icon={GraduationCap}
                  placeholder="Computer Science"
                  value={formData.department}
                  onChange={e => setFormData({...formData, department: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Input
                label="Password"
                icon={Lock}
                type="password"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required
                minLength={6}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                isLoading={isLoading}
                size="lg"
                variant="accent"
                glow
                className="w-full"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Login Link - Enhanced */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-gray-500 mt-6 text-sm"
        >
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-brand-accent hover:text-white font-medium transition-colors border-b border-transparent hover:border-brand-accent/50"
          >
            Log in
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
