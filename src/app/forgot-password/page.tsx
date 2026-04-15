"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if(res.ok) {
         setSubmitted(true);
         toast.success("Verification dispatched!");
      } else {
         toast.error("Failed to sequence logic.");
      }
    } catch(err) {
      toast.error("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <Toaster position="top-center" toastOptions={{ style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative z-10 w-full max-w-md">
        <Link href="/login" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-white transition-colors mb-6 group">
           <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Return to Gateway
        </Link>
        <Card className="border border-brand-accent/20 bg-[#060606]/90 shadow-[0_0_50px_rgba(56,189,248,0.05)] p-8 backdrop-blur-3xl">
          <div className="text-center mb-8">
             <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Password Recovery</h1>
             <p className="text-gray-400 text-sm">Enter your physical email location to receive clearance instructions.</p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-brand-accent mb-2 block uppercase tracking-wider font-bold">Secure Address</label>
                <Input icon={Mail} type="email" placeholder="student@ulsan.edu" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="pt-4">
                <Button type="submit" isLoading={isLoading} className="w-full h-12 text-lg font-bold bg-brand-accent text-black hover:bg-white border-none shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                   Dispatch Reset Sequence
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4 py-4">
               <div className="w-16 h-16 rounded-full bg-brand-accent/10 border border-brand-accent/30 mx-auto flex items-center justify-center mb-4 text-brand-accent">
                  <Mail size={28} />
               </div>
               <h3 className="text-lg font-bold text-white">Transmission Intercepted</h3>
               <p className="text-gray-400 text-sm leading-relaxed">We generated your cryptographic key successfully. Because we are bypassing physical SMTP arrays for local infrastructure testing, please navigate directly to your <strong className="text-white">Next.js Server Terminal logs</strong> to physically copy and execute the secure reset link!</p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
