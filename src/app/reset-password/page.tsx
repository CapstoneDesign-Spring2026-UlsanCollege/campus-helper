"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { PASSWORD_REQUIREMENTS, validateStrongPassword } from '@/lib/password-policy';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const passwordFeedback = validateStrongPassword(password);

  useEffect(() => {
     if(!token) {
        toast.error("This reset link is invalid or incomplete.");
     }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(password !== confirmPassword) return toast.error("Passwords do not match.");
    if(!passwordFeedback.isValid) return toast.error(passwordFeedback.issues[0]);

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      
      if(res.ok) {
         toast.success("Password reset successfully. Redirecting to login...");
         setTimeout(() => router.push('/login'), 1500);
      } else {
         toast.error(data.error || "Could not reset your password.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) return <div className="min-h-screen bg-background flex text-white items-center justify-center font-bold uppercase tracking-widest text-brand-accent">Invalid Reset Link</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <Toaster position="top-center" toastOptions={{ style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 w-full max-w-md">
        <Card className="border border-brand-accent/20 bg-[#060606]/90 shadow-[0_0_50px_rgba(56,189,248,0.05)] p-8 backdrop-blur-3xl">
          <div className="text-center mb-8">
             <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Create a New Password</h1>
             <p className="text-gray-400 text-sm">Choose a strong password to secure your account again.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
             <div>
               <label className="text-xs text-brand-accent mb-2 block uppercase tracking-wider font-bold">New Password</label>
               <Input icon={Lock} type="password" showPasswordToggle placeholder="Enter a strong new password" value={password} onChange={e => setPassword(e.target.value)} required minLength={10} />
             </div>
             <div>
               <label className="text-xs text-brand-accent mb-2 block uppercase tracking-wider font-bold">Confirm Password</label>
               <Input icon={Lock} type="password" showPasswordToggle placeholder="Re-enter to verify" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={10} />
             </div>
             <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
               <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand-accent">Password requirements</p>
               <div className="mt-3 grid gap-2">
                 {PASSWORD_REQUIREMENTS.map((requirement) => {
                   const satisfied = !passwordFeedback.issues.some((issue) => {
                     if (requirement === 'At least 10 characters') return issue.includes('10 characters');
                     if (requirement === 'At least one uppercase letter') return issue.includes('uppercase');
                     if (requirement === 'At least one lowercase letter') return issue.includes('lowercase');
                     if (requirement === 'At least one number') return issue.includes('number');
                     if (requirement === 'At least one special character') return issue.includes('special character');
                     if (requirement === 'No spaces') return issue.includes('spaces');
                     return false;
                   });

                   return (
                     <div key={requirement} className="flex items-center gap-2 text-sm">
                       <span className={`inline-block h-2.5 w-2.5 rounded-full ${satisfied ? 'bg-emerald-400' : 'bg-white/15'}`} />
                       <span className={satisfied ? 'text-emerald-200' : 'text-gray-400'}>{requirement}</span>
                     </div>
                   );
                 })}
               </div>
               {password && passwordFeedback.issues.length > 0 && (
                 <p className="mt-3 text-sm text-amber-200">{passwordFeedback.issues[0]}</p>
               )}
             </div>
             <div className="pt-4">
               <Button type="submit" isLoading={isLoading} className="w-full h-12 text-lg font-bold bg-brand-accent text-black hover:bg-white border-none shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                   Reset Password <ArrowRight size={18} className="ml-2 inline-block" />
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
