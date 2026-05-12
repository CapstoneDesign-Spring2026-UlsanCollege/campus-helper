"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2, Calendar as CalendarIcon, X, Layers3, Building2, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CommandHero } from '@/components/layout/CommandHero';
import { fetchWithAuth, readApiError } from '@/lib/client-api';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface TimetableClass { _id: string; day: string; subject: string; time: string; room?: string; }
interface TimetableEntry extends TimetableClass { kind: 'official' | 'custom'; }
interface SemesterOption { _id: string; name: string; status: string; }

export default function TimetablePage() {
  const [templates, setTemplates] = useState<TimetableClass[]>([]);
  const [customClasses, setCustomClasses] = useState<TimetableClass[]>([]);
  const [semesters, setSemesters] = useState<SemesterOption[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [department, setDepartment] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSemesterMenuOpen, setIsSemesterMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ day: 'Monday', subject: '', time: '', room: '' });
  const [isLoading, setIsLoading] = useState(false);

  const fetchTimetable = useCallback(async (semesterId: string) => {
    if (!semesterId) return;
    try {
      const res = await fetchWithAuth(`/api/timetable?semesterId=${semesterId}`);
      const data = await res.json();
      if (res.ok) {
        setTemplates(Array.isArray(data.templates) ? data.templates : []);
        setCustomClasses(Array.isArray(data.custom) ? data.custom : []);
        setDepartment(data.department || '');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load timetable data.');
    }
  }, []);

  useEffect(() => {
    const loadSemesters = async () => {
      try {
        const [semesterRes] = await Promise.all([
          fetch('/api/semesters'),
        ]);
        const semesterData = await semesterRes.json();
        if (semesterRes.ok && Array.isArray(semesterData)) {
          setSemesters(semesterData);
          const storedUser = localStorage.getItem('user');
          const parsedUser = storedUser ? JSON.parse(storedUser) as { currentSemesterId?: string } : {};
          const activeSemester = semesterData.find((semester) => semester.status === 'active') || semesterData[0];
          const nextSemesterId = parsedUser.currentSemesterId || activeSemester?._id || '';
          setSelectedSemesterId(nextSemesterId);
          if (nextSemesterId) {
            void fetchTimetable(nextSemesterId);
          }
        }
      } catch {
        // ignore
      }
    };

    void loadSemesters();
  }, [fetchTimetable]);

  useEffect(() => {
    if (selectedSemesterId) {
      void fetchTimetable(selectedSemesterId);
    }
  }, [fetchTimetable, selectedSemesterId]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetchWithAuth('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, semesterId: selectedSemesterId })
      });
      if (res.ok) {
         setFormData({ day: 'Monday', subject: '', time: '', room: '' });
         setIsAdding(false);
         void fetchTimetable(selectedSemesterId);
      } else {
         toast.error(await readApiError(res, 'Could not save the class.'));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save the class.');
    } finally { setIsLoading(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetchWithAuth(`/api/timetable?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error(await readApiError(res, 'Could not delete the class.'));
      }
      void fetchTimetable(selectedSemesterId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete the class.');
    }
  };

  const mergedByDay = useMemo(() => {
    const allClasses: TimetableEntry[] = [
      ...templates.map((item) => ({ ...item, kind: 'official' as const })),
      ...customClasses.map((item) => ({ ...item, kind: 'custom' as const })),
    ];
    return DAYS.map((day) => ({
      day,
      classes: allClasses.filter((item) => item.day === day),
    }));
  }, [customClasses, templates]);

  const selectedSemester = useMemo(
    () => semesters.find((semester) => semester._id === selectedSemesterId) || null,
    [selectedSemesterId, semesters]
  );

  useEffect(() => {
    if (!isSemesterMenuOpen) return;

    const closeMenu = () => setIsSemesterMenuOpen(false);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [isSemesterMenuOpen]);

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <div className="space-y-4">
        <CommandHero
          eyebrow="Schedule Matrix"
          title="Timetable"
          description="Load your semester template, layer in custom classes, and keep the week readable on both desktop and mobile."
          icon={CalendarIcon}
          stats={[
            { label: 'Official entries', value: templates.length, tone: 'mint' },
            { label: 'Custom entries', value: customClasses.length, tone: 'accent' },
          ]}
        />
        <div className="flex justify-end">
          <Button
            onClick={() => setIsAdding(!isAdding)}
            variant={isAdding ? "ghost" : "primary"}
            className="min-h-[44px]"
          >
            {isAdding ? <><X size={18} className="mr-2" /> Cancel</> : <><Plus size={18} className="mr-2" /> Add Class</>}
          </Button>
        </div>
      </div>

      <Card className="border border-white/10 bg-black/35">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Semester</label>
            <div className="relative">
              <Layers3 size={18} className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-500" />
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsSemesterMenuOpen((current) => !current);
                }}
                className="flex h-12 w-full items-center justify-between rounded-xl border border-white/10 bg-black/45 pl-11 pr-4 text-left text-white outline-none transition hover:border-white/20 focus:border-brand-accent"
              >
                <div className="min-w-0">
                  <span className="block truncate text-base font-medium">
                    {selectedSemester?.name || 'Select a semester'}
                  </span>
                  {selectedSemester?.status && (
                    <span className="mt-0.5 block text-[10px] uppercase tracking-[0.2em] text-slate-500">
                      {selectedSemester.status}
                    </span>
                  )}
                </div>
                <ChevronDown
                  size={18}
                  className={`ml-3 flex-shrink-0 text-slate-400 transition-transform ${isSemesterMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {isSemesterMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-2xl border border-white/10 bg-[#060b15] shadow-2xl shadow-black/50"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="max-h-72 overflow-y-auto p-2">
                      {semesters.map((semester) => {
                        const isSelected = semester._id === selectedSemesterId;
                        return (
                          <button
                            key={semester._id}
                            type="button"
                            onClick={() => {
                              setSelectedSemesterId(semester._id);
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
                            {isSelected && <Check size={16} className="ml-3 flex-shrink-0 text-brand-accent" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Department template</p>
            <p className="mt-2 text-lg font-semibold text-white">{department || 'Not set'}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Loaded entries</p>
            <p className="mt-2 text-lg font-semibold text-emerald-100">{templates.length} official / {customClasses.length} custom</p>
          </div>
        </div>
      </Card>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border border-brand-purple/50 bg-brand-purple/5 overflow-hidden">
              <form onSubmit={handleAddSubmit} className="flex flex-col gap-4 p-4">
                 <div>
                   <label className="text-xs text-gray-400 mb-1 block">Day</label>
                   <select
                     className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-purple/50 transition-colors min-h-[44px]"
                     value={formData.day} onChange={e => setFormData({...formData, day: e.target.value})}
                   >
                     {DAYS.map(d => <option key={d} value={d} className="bg-black text-white">{d}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="text-xs text-gray-400 mb-1 block">Time</label>
                   <Input
                     placeholder="e.g. 09:00 AM - 10:30 AM"
                     value={formData.time}
                     onChange={e => setFormData({...formData, time: e.target.value})}
                     required
                     className="min-h-[44px]"
                   />
                 </div>
                 <div>
                   <label className="text-xs text-gray-400 mb-1 block">Subject & Room</label>
                   <Input
                     placeholder="e.g. Algorithms (Room 101)"
                     value={formData.subject}
                     onChange={e => setFormData({...formData, subject: e.target.value})}
                     required
                     className="min-h-[44px]"
                   />
                 </div>
                 <div>
                   <label className="text-xs text-gray-400 mb-1 block">Room / Note</label>
                   <Input
                     placeholder="e.g. ICT 304"
                     value={formData.room}
                     onChange={e => setFormData({...formData, room: e.target.value})}
                     className="min-h-[44px]"
                   />
                 </div>
                 <Button type="submit" isLoading={isLoading} className="min-h-[44px]">
                   Save Custom Class
                 </Button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Day Tabs for Mobile */}
      <div className="lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {DAYS.map(day => {
            const count = templates.filter(c => c.day === day).length + customClasses.filter(c => c.day === day).length;
            return (
              <button
                key={day}
                onClick={() => {
                  const el = document.getElementById(`day-${day}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="flex-shrink-0 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                {day.slice(0, 3)} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {mergedByDay.map(({ day, classes: dayClasses }, index) => {
           if(dayClasses.length === 0 && !isAdding) return null;

           return (
             <motion.div
               key={day}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.05 }}
             >
               <Card id={`day-${day}`} className="flex flex-col border border-white/10 p-0 overflow-hidden shadow-xl h-full">
                 <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center gap-2">
                   <CalendarIcon size={16} className="text-brand-accent flex-shrink-0" />
                   <h3 className="font-bold text-white truncate">{day}</h3>
                 </div>
                 <div className="p-4 space-y-3 flex-1">
                   {dayClasses.length === 0 ? (
                     <p className="text-sm text-gray-500 italic">No classes.</p>
                   ) : (
                     dayClasses.map((cls, i) => (
                       <motion.div
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ delay: i * 0.05 }}
                         key={cls._id}
                         className="group relative p-3 rounded-xl bg-white/5 border border-white/5 hover:border-brand-purple/50 transition-all"
                       >
                         <p className="text-xs font-semibold text-brand-purple mb-1">{cls.time}</p>
                          <h4 className="text-white text-sm font-medium pr-8 break-words">{cls.subject}</h4>
                          {cls.room && (
                            <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                              <Building2 size={11} />
                              {cls.room}
                            </p>
                          )}
                          {cls.kind === 'custom' ? (
                            <button
                              onClick={() => handleDelete(cls._id)}
                              className="absolute right-2 top-2 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
                              aria-label="Delete class"
                            >
                              <Trash2 size={14} />
                            </button>
                          ) : (
                            <span className="absolute right-2 top-2 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-200">
                              Official
                            </span>
                          )}
                       </motion.div>
                     ))
                   )}
                 </div>
               </Card>
             </motion.div>
           );
        })}
      </div>
    </div>
  );
}
