"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, User, Hash, GraduationCap, ArrowLeft, Sparkles, Layers3, CalendarDays, ChevronDown, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { PASSWORD_REQUIREMENTS, validateStrongPassword } from '@/lib/password-policy';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    department: '',
    gender: 'male',
    currentSemesterId: '',
    admissionYear: new Date().getFullYear(),
  });
  const [semesters, setSemesters] = useState<Array<{ _id: string; name: string; status: string; year: number; term: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(true);
  const [isSemesterMenuOpen, setIsSemesterMenuOpen] = useState(false);
  const router = useRouter();

  const passwordFeedback = useMemo(
    () => validateStrongPassword(formData.password, { email: formData.email, name: formData.name }),
    [formData.password, formData.email, formData.name]
  );

  useEffect(() => {
    const loadSemesters = async () => {
      setIsLoadingSemesters(true);
      try {
        const res = await fetch('/api/semesters');
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setSemesters(data);
          const active = data.find((semester) => semester.status === 'active') || data[0];
          if (active) {
            setFormData((current) => ({ ...current, currentSemesterId: active._id }));
          }
        }
      } catch {
        toast.error('Could not load semester options.');
      } finally {
        setIsLoadingSemesters(false);
      }
    };

    void loadSemesters();
  }, []);

  useEffect(() => {
    if (!isSemesterMenuOpen) return;

    const closeMenu = () => setIsSemesterMenuOpen(false);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [isSemesterMenuOpen]);

  const semesterSummary = useMemo(() => {
    const selected = semesters.find((semester) => semester._id === formData.currentSemesterId);
    return selected ? `${selected.name} • ${selected.status}` : 'Select your current semester';
  }, [formData.currentSemesterId, semesters]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordFeedback.isValid) {
      toast.error(passwordFeedback.issues[0]);
      return;
    }
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
            className="section-kicker mb-4"
          >
            <Sparkles size={14} className="text-brand-accent animate-pulse" />
                <span>Semester-aware signup</span>
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
          className="relative overflow-hidden p-6 shadow-2xl shadow-black/50 sm:p-8"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-2 block uppercase tracking-wider font-bold">
                  Current Semester
                </label>
                <div className="relative z-20">
                  <Layers3 size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <button
                    type="button"
                    disabled={isLoadingSemesters}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (!isLoadingSemesters) {
                        setIsSemesterMenuOpen((current) => !current);
                      }
                    }}
                    className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 py-3 text-left text-white outline-none transition-all duration-300 min-h-[48px] hover:border-white/20 focus:border-brand-accent focus:shadow-[0_0_20px_rgba(0,245,255,0.2)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="truncate pr-3">
                      {semesters.find((semester) => semester._id === formData.currentSemesterId)?.name || 'Select semester'}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-white transition-transform ${isSemesterMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isSemesterMenuOpen && (
                    <div
                      className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-white/10 bg-[#060b15] shadow-2xl shadow-black/50"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="max-h-72 overflow-y-auto p-2">
                        {semesters.map((semester) => {
                          const isSelected = semester._id === formData.currentSemesterId;
                          return (
                            <button
                              key={semester._id}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, currentSemesterId: semester._id });
                                setIsSemesterMenuOpen(false);
                              }}
                              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                                isSelected
                                  ? 'bg-brand-accent/15 text-white'
                                  : 'text-slate-200 hover:bg-white/5'
                              }`}
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{semester.name}</p>
                                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                                  {semester.status}
                                </p>
                              </div>
                              {isSelected && <Check size={16} className="ml-3 shrink-0 text-brand-accent" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-cyan-200/80">
                  {semesterSummary}
                </p>
              </div>
              <div>
                <Input
                  label="Admission Year"
                  icon={CalendarDays}
                  type="number"
                  min={2000}
                  max={2100}
                  value={String(formData.admissionYear)}
                  onChange={e => setFormData({ ...formData, admissionYear: Number(e.target.value) })}
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
                showPasswordToggle
                placeholder="Use a strong password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required
                minLength={10}
              />
              <div className="mt-3 rounded-2xl border border-white/10 bg-black/25 p-4">
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
                {formData.password && passwordFeedback.issues.length > 0 && (
                  <p className="mt-3 text-sm text-amber-200">{passwordFeedback.issues[0]}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                isLoading={isLoading}
                disabled={isLoadingSemesters || !formData.currentSemesterId}
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
