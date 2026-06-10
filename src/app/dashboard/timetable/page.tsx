"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  X,
  Layers3,
  Building2,
  Check,
  ChevronDown,
  Clock3,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CommandHero } from '@/components/layout/CommandHero';
import { fetchWithAuth, readApiError } from '@/lib/client-api';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_ABBREVIATIONS: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};
const DAY_ACCENTS: Record<string, string> = {
  Monday: 'from-cyan-500/30 to-sky-500/10',
  Tuesday: 'from-emerald-500/30 to-teal-500/10',
  Wednesday: 'from-indigo-500/30 to-violet-500/10',
  Thursday: 'from-fuchsia-500/30 to-purple-500/10',
  Friday: 'from-amber-500/25 to-orange-500/10',
  Saturday: 'from-rose-500/25 to-pink-500/10',
  Sunday: 'from-slate-500/25 to-slate-400/10',
};

interface TimetableClass { _id: string; day: string; subject: string; time: string; room?: string; }
interface TimetableEntry extends TimetableClass { kind: 'official' | 'custom'; }
interface SemesterOption { _id: string; name: string; status: string; }
interface TimetableSlot extends TimetableEntry {
  startMinutes: number | null;
  endMinutes: number | null;
  displayTime: string;
}
interface ConflictInfo {
  day: string;
  count: number;
  entries: TimetableSlot[];
}

function normalizeWhitespace(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function formatTimeLabel(value: string) {
  return normalizeWhitespace(value)
    .replace(/\s*-\s*/g, ' - ')
    .replace(/\s+/g, ' ');
}

function parseSingleTime(raw: string) {
  const clean = raw.trim().toUpperCase().replace(/\./g, '');
  const match = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2] || '0');
  const meridiem = match[3];

  if (Number.isNaN(hour) || Number.isNaN(minute) || minute > 59) return null;

  if (meridiem) {
    if (hour < 1 || hour > 12) return null;
    if (meridiem === 'AM' && hour === 12) hour = 0;
    if (meridiem === 'PM' && hour !== 12) hour += 12;
  } else if (hour > 23) {
    return null;
  }

  return hour * 60 + minute;
}

function parseTimeRange(value: string) {
  const normalized = formatTimeLabel(value);
  const parts = normalized.split(' - ');
  const start = parseSingleTime(parts[0] || '');
  const end = parseSingleTime(parts[1] || '');

  return {
    startMinutes: start,
    endMinutes: end,
    displayTime: normalized,
  };
}

function overlaps(a: TimetableSlot, b: TimetableSlot) {
  if (a.day !== b.day || a.startMinutes === null || b.startMinutes === null) return false;
  const aEnd = a.endMinutes ?? a.startMinutes + 60;
  const bEnd = b.endMinutes ?? b.startMinutes + 60;
  return a.startMinutes < bEnd && b.startMinutes < aEnd;
}

function formatClockLabel(minutes: number | null) {
  if (minutes === null) return 'TBD';
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${suffix}`;
}

export default function TimetablePage() {
  const [templates, setTemplates] = useState<TimetableClass[]>([]);
  const [customClasses, setCustomClasses] = useState<TimetableClass[]>([]);
  const [semesters, setSemesters] = useState<SemesterOption[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [department, setDepartment] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSemesterMenuOpen, setIsSemesterMenuOpen] = useState(false);
  const [semesterMenuPosition, setSemesterMenuPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [formData, setFormData] = useState({ day: 'Monday', subject: '', time: '', room: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [activeDay] = useState(() => {
    const now = new Date();
    const dayIndex = (now.getDay() + 6) % 7;
    return DAYS[dayIndex] || 'Monday';
  });
  const semesterButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const fetchTimetable = useCallback(async (semesterId: string) => {
    if (!semesterId) return;
    try {
      setIsBootstrapping(true);
      const res = await fetchWithAuth(`/api/timetable?semesterId=${semesterId}`);
      const data = await res.json();
      if (res.ok) {
        setTemplates(Array.isArray(data.templates) ? data.templates : []);
        setCustomClasses(Array.isArray(data.custom) ? data.custom : []);
        setDepartment(data.department || '');
      } else {
        toast.error(typeof data?.error === 'string' ? data.error : 'Could not load timetable data.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load timetable data.');
    } finally {
      setIsBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    const loadSemesters = async () => {
      try {
        const semesterRes = await fetch('/api/semesters');
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
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not load semesters.');
      } finally {
        setIsBootstrapping(false);
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
    const subject = normalizeWhitespace(formData.subject);
    const time = formatTimeLabel(formData.time);
    const room = normalizeWhitespace(formData.room);

    if (!selectedSemesterId) {
      setFormError('Choose a semester before adding a class.');
      return;
    }
    if (subject.length < 2) {
      setFormError('Class name should be at least 2 characters long.');
      return;
    }
    if (!time) {
      setFormError('Class time is required.');
      return;
    }

    setFormError('');
    setIsLoading(true);
    try {
      const res = await fetchWithAuth('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semesterId: selectedSemesterId,
          day: formData.day,
          subject,
          time,
          room,
        })
      });
      if (res.ok) {
         setFormData({ day: activeDay, subject: '', time: '', room: '' });
         setIsAdding(false);
         toast.success('Custom class added to your week.');
         void fetchTimetable(selectedSemesterId);
      } else {
         const message = await readApiError(res, 'Could not save the class.');
         setFormError(message);
         toast.error(message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save the class.';
      setFormError(message);
      toast.error(message);
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

  const allEntries = useMemo<TimetableSlot[]>(() => {
    return [
      ...templates.map((item) => ({ ...item, kind: 'official' as const })),
      ...customClasses.map((item) => ({ ...item, kind: 'custom' as const })),
    ]
      .map((item) => {
        const parsed = parseTimeRange(item.time);
        return {
          ...item,
          ...parsed,
        };
      })
      .sort((a, b) => {
        if (a.day !== b.day) return DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
        if (a.startMinutes === null && b.startMinutes === null) return a.displayTime.localeCompare(b.displayTime);
        if (a.startMinutes === null) return 1;
        if (b.startMinutes === null) return -1;
        return a.startMinutes - b.startMinutes;
      });
  }, [customClasses, templates]);

  const mergedByDay = useMemo(() => {
    return DAYS.map((day) => ({
      day,
      classes: allEntries.filter((item) => item.day === day),
    }));
  }, [allEntries]);

  const conflictMap = useMemo(() => {
    const conflicts = new Map<string, number>();

    for (let i = 0; i < allEntries.length; i += 1) {
      for (let j = i + 1; j < allEntries.length; j += 1) {
        if (overlaps(allEntries[i], allEntries[j])) {
          conflicts.set(allEntries[i]._id, (conflicts.get(allEntries[i]._id) || 0) + 1);
          conflicts.set(allEntries[j]._id, (conflicts.get(allEntries[j]._id) || 0) + 1);
        }
      }
    }

    return conflicts;
  }, [allEntries]);

  const conflictGroups = useMemo<ConflictInfo[]>(() => {
    return mergedByDay
      .map(({ day, classes }) => ({
        day,
        entries: classes.filter((entry) => conflictMap.has(entry._id)),
      }))
      .filter((group) => group.entries.length > 0)
      .map((group) => ({
        day: group.day,
        count: group.entries.length,
        entries: group.entries,
      }));
  }, [conflictMap, mergedByDay]);

  const todayEntries = useMemo(
    () => allEntries.filter((entry) => entry.day === activeDay),
    [activeDay, allEntries],
  );

  const nextClass = useMemo(() => {
    const now = new Date();
    const todayIndex = (now.getDay() + 6) % 7;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (let offset = 0; offset < DAYS.length; offset += 1) {
      const day = DAYS[(todayIndex + offset) % DAYS.length];
      const candidate = allEntries
        .filter((entry) => entry.day === day)
        .find((entry) => {
          if (entry.startMinutes === null) return offset > 0;
          return offset > 0 || entry.startMinutes >= currentMinutes;
        });

      if (candidate) {
        return {
          ...candidate,
          relativeDay: offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : day,
        };
      }
    }

    return null;
  }, [allEntries]);

  const selectedSemester = useMemo(
    () => semesters.find((semester) => semester._id === selectedSemesterId) || null,
    [selectedSemesterId, semesters]
  );

  useEffect(() => {
    if (!isSemesterMenuOpen) return;

    const closeMenu = () => setIsSemesterMenuOpen(false);
    const updatePosition = () => {
      const rect = semesterButtonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setSemesterMenuPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener('click', closeMenu);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('click', closeMenu);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isSemesterMenuOpen]);

  const summaryStats = useMemo(() => {
    return [
      {
        label: 'Today',
        value: todayEntries.length ? `${todayEntries.length} class${todayEntries.length > 1 ? 'es' : ''}` : 'Open day',
        tone: 'mint' as const,
      },
      {
        label: 'Next class',
        value: nextClass ? `${nextClass.subject} · ${formatClockLabel(nextClass.startMinutes)}` : 'No upcoming class',
        tone: 'accent' as const,
      },
      {
        label: 'Conflicts',
        value: conflictGroups.length ? `${conflictGroups.length} day${conflictGroups.length > 1 ? 's' : ''}` : 'None',
        tone: conflictGroups.length ? 'warn' as const : 'default' as const,
      },
    ];
  }, [conflictGroups.length, nextClass, todayEntries.length]);

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <div className="space-y-4">
        <CommandHero
          eyebrow="Schedule Matrix"
          title="Timetable"
          description="Load your semester template, layer in your own classes, and keep the week readable enough that you always know what is next."
          icon={CalendarIcon}
          stats={summaryStats}
        />
        <div className="flex justify-end">
          <Button
            onClick={() => {
              setFormError('');
              setIsAdding(!isAdding);
              if (!isAdding) {
                setFormData((current) => ({ ...current, day: activeDay }));
              }
            }}
            variant={isAdding ? "ghost" : "primary"}
            className="min-h-[44px]"
          >
            {isAdding ? <><X size={18} className="mr-2" /> Cancel</> : <><Plus size={18} className="mr-2" /> Add Class</>}
          </Button>
        </div>
      </div>

      <Card className="overflow-visible border border-white/10 bg-black/35">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Semester</label>
            <div className="relative z-20">
              <Layers3 size={18} className="pointer-events-none absolute left-4 top-6 z-10 -translate-y-1/2 text-slate-500" />
              <button
                ref={semesterButtonRef}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsSemesterMenuOpen((current) => !current);
                }}
                className="flex min-h-[88px] w-full items-center justify-between rounded-2xl border border-white/10 bg-black/45 pl-11 pr-4 py-4 text-left text-white outline-none transition hover:border-white/20 focus:border-brand-accent"
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

      {hasMounted && isSemesterMenuOpen && semesterMenuPosition
        ? createPortal(
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="fixed z-[140] overflow-hidden rounded-2xl border border-white/10 bg-[#060b15] shadow-2xl shadow-black/60"
                style={{
                  top: semesterMenuPosition.top,
                  left: semesterMenuPosition.left,
                  width: semesterMenuPosition.width,
                }}
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
            </AnimatePresence>,
            document.body
          )
        : null}

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="border border-white/10 bg-black/35 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Planner pulse</p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                {activeDay} looks {todayEntries.length ? 'busy' : 'open'}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                {nextClass
                  ? `${nextClass.relativeDay} at ${formatClockLabel(nextClass.startMinutes)}, ${nextClass.subject} is your next class.`
                  : 'No upcoming class is scheduled yet, so this is a good spot to fill your week intentionally.'}
              </p>
            </div>
            <div className="hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:block">
              <Clock3 size={18} className="text-brand-accent" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-100/70">Today&apos;s classes</p>
              <p className="mt-2 text-2xl font-semibold text-white">{todayEntries.length}</p>
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-100/70">Next class starts</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {nextClass ? formatClockLabel(nextClass.startMinutes) : 'TBD'}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 sm:col-span-2 xl:col-span-1">
              <p className="text-[10px] uppercase tracking-[0.22em] text-amber-100/70">Conflict watch</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {conflictGroups.length ? `${conflictGroups.length} day${conflictGroups.length > 1 ? 's' : ''}` : 'Clear'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border border-white/10 bg-black/35 p-5">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-brand-accent" />
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Planner insights</p>
          </div>
          <div className="mt-4 space-y-3">
            {nextClass ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{nextClass.relativeDay}</p>
                <p className="mt-2 text-lg font-semibold text-white">{nextClass.subject}</p>
                <p className="mt-1 text-sm text-slate-300">{nextClass.displayTime}{nextClass.room ? ` · ${nextClass.room}` : ''}</p>
              </div>
            ) : isBootstrapping ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
                Loading your next class snapshot...
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-slate-400">
                Nothing is scheduled next yet. Add a custom class or load another semester to flesh out the week.
              </div>
            )}

            {conflictGroups.length > 0 ? (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/6 p-4">
                <div className="flex items-center gap-2 text-amber-200">
                  <AlertTriangle size={16} />
                  <span className="text-sm font-medium">Conflict watch</span>
                </div>
                <div className="mt-3 space-y-2">
                  {conflictGroups.slice(0, 3).map((group) => (
                    <p key={group.day} className="text-sm text-amber-50/90">
                      {group.day}: {group.entries.map((entry) => entry.subject).join(', ')}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/6 p-4 text-sm text-emerald-50/90">
                No overlapping time blocks detected in this semester view.
              </div>
            )}
          </div>
        </Card>
      </div>

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
                   <label className="text-xs text-gray-400 mb-1 block">Subject</label>
                   <Input
                     placeholder="e.g. Algorithms"
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
                 {formError && (
                   <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                     {formError}
                   </div>
                 )}
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
            const count = mergedByDay.find((group) => group.day === day)?.classes.length || 0;
            const isToday = day === activeDay;
            return (
              <button
                key={day}
                onClick={() => {
                  const el = document.getElementById(`day-${day}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className={`flex-shrink-0 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  isToday
                    ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-100'
                    : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {day.slice(0, 3)} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule Grid */}
      {isBootstrapping ? (
        <Card className="border border-white/10 bg-black/35 p-8 text-center text-sm text-slate-400">
          Loading your timetable board...
        </Card>
      ) : allEntries.length === 0 && !isAdding ? (
        <Card className="border border-dashed border-white/10 bg-black/30 p-8 text-center">
          <div className="mx-auto max-w-xl space-y-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Open week</p>
            <h3 className="text-2xl font-semibold text-white">This semester timetable is still empty.</h3>
            <p className="text-sm leading-6 text-slate-300">
              Try another semester, wait for an official department template, or add your own class blocks to start shaping the week.
            </p>
          </div>
        </Card>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {mergedByDay.map(({ day, classes: dayClasses }, index) => {
           if(dayClasses.length === 0 && !isAdding) return null;
           const isToday = day === activeDay;
           const hasConflicts = dayClasses.some((cls) => conflictMap.has(cls._id));

           return (
             <motion.div
               key={day}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.05 }}
             >
               <Card
                 id={`day-${day}`}
                 className={`flex h-full flex-col overflow-hidden border p-0 shadow-xl ${
                   isToday ? 'border-cyan-400/30' : 'border-white/10'
                 }`}
               >
                 <div className={`bg-gradient-to-r ${DAY_ACCENTS[day]} border-b border-white/10 px-4 py-3`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                   <CalendarIcon size={16} className="text-brand-accent flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-white truncate">{day}</h3>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">
                          {isToday ? 'Today' : DAY_ABBREVIATIONS[day]}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasConflicts && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-amber-100">
                          <AlertTriangle size={11} />
                          Conflict
                        </span>
                      )}
                      <span className="inline-flex rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-200">
                        {dayClasses.length} item{dayClasses.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
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
                         className={`group relative rounded-2xl border p-3 transition-all ${
                           cls.kind === 'official'
                             ? 'border-cyan-400/20 bg-cyan-400/[0.07] hover:border-cyan-300/40'
                             : 'border-violet-400/20 bg-violet-400/[0.08] hover:border-violet-300/40'
                         } ${conflictMap.has(cls._id) ? 'ring-1 ring-amber-400/30' : ''}`}
                       >
                         <div className="mb-1 flex items-center justify-between gap-2 pr-8">
                           <p className={`text-xs font-semibold ${cls.kind === 'official' ? 'text-cyan-100' : 'text-violet-100'}`}>
                             {cls.displayTime}
                           </p>
                           <span className={`inline-flex rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${
                             cls.kind === 'official'
                               ? 'bg-cyan-400/10 text-cyan-100'
                               : 'bg-violet-400/10 text-violet-100'
                           }`}>
                             {cls.kind}
                           </span>
                         </div>
                          <h4 className="text-white text-sm font-medium pr-8 break-words">{cls.subject}</h4>
                          {cls.room && (
                            <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                              <Building2 size={11} />
                              {cls.room}
                            </p>
                          )}
                          {conflictMap.has(cls._id) && (
                            <p className="mt-2 flex items-center gap-1 text-[11px] text-amber-100/90">
                              <AlertTriangle size={11} />
                              Overlaps another class in this view.
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
                            <span className="absolute right-2 top-2 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/8 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-200">
                              Locked
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
      )}
    </div>
  );
}
