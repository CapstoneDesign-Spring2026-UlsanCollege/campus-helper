"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');

  useEffect(() => {
     if(!token) {
        toast.error("Invalid secure gateway link detected.");
     }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(password !== confirmPassword) return toast.error("Cryptographic strings explicitly do not match.");
    if(password.length < 6) return toast.error("String length mathematically insufficient.");

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      
      if(res.ok) {
         toast.success("Security token bypassed and re-written. Proceeding to Authorization.");
         setTimeout(() => router.push('/login'), 1500);
      } else {
         toast.error(data.error || "System rejected protocol block.");
      }
    } catch(err) {
      toast.error("Major intercept. Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) return <div className="min-h-screen bg-background flex text-white items-center justify-center font-bold uppercase tracking-widest text-brand-accent">Decryption Invalid</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <Toaster position="top-center" toastOptions={{ style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 w-full max-w-md">
        <Card className="border border-brand-accent/20 bg-[#060606]/90 shadow-[0_0_50px_rgba(56,189,248,0.05)] p-8 backdrop-blur-3xl">
          <div className="text-center mb-8">
             <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Re-secure System</h1>
             <p className="text-gray-400 text-sm">You have verified your identity token logic. Recreate your password now.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
             <div>
               <label className="text-xs text-brand-accent mb-2 block uppercase tracking-wider font-bold">New Matrix Configuration</label>
               <Input icon={Lock} type="password" placeholder="Enter new password string" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
             </div>
             <div>
               <label className="text-xs text-brand-accent mb-2 block uppercase tracking-wider font-bold">Confirm Overwrite</label>
               <Input icon={Lock} type="password" placeholder="Re-enter to verify" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
             </div>
             <div className="pt-4">
               <Button type="submit" isLoading={isLoading} className="w-full h-12 text-lg font-bold bg-brand-accent text-black hover:bg-white border-none shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                   Rewrite Database  <ArrowRight size={18} className="ml-2 inline-block" />
               </Button>
             </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-white">Loading Security Protocols...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
