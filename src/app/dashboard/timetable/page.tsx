"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2, Calendar as CalendarIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TimetablePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ day: 'Monday', subject: '', time: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const res = await fetch('/api/timetable');
      const data = await res.json();
      if(Array.isArray(data)) setClasses(data);
    } catch(e) {}
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
         setFormData({ day: 'Monday', subject: '', time: '' });
         setIsAdding(false);
         fetchTimetable();
      }
    } catch(e) {} finally { setIsLoading(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/timetable?id=${id}`, { method: 'DELETE' });
      fetchTimetable();
    } catch(e) {}
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">Timetable</h1>
          <p className="text-sm md:text-base text-gray-400">Manage your weekly schedule.</p>
        </div>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          variant={isAdding ? "ghost" : "primary"}
          className="min-h-[44px]"
        >
          {isAdding ? <><X size={18} className="mr-2" /> Cancel</> : <><Plus size={18} className="mr-2" /> Add Class</>}
        </Button>
      </header>

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
                 <Button type="submit" isLoading={isLoading} className="min-h-[44px]">
                   Save Class
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
            const count = classes.filter(c => c.day === day).length;
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
        {DAYS.map((day, index) => {
           const dayClasses = classes.filter(c => c.day === day);
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
                          <button
                            onClick={() => handleDelete(cls._id)}
                            className="absolute right-2 top-2 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
                            aria-label="Delete class"
                          >
                            <Trash2 size={14} />
                          </button>
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
