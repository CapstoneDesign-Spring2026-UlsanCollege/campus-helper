"use client";

import React, { useState, useEffect } from 'react';
import type { IUser } from '@/models/User';
import type { IAnnouncement } from '@/models/Announcement';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Shield, Trash2, Megaphone, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'announcements'>('users');

  useEffect(() => {
    fetchUsers();
    fetchAnnouncements();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if(Array.isArray(data)) setUsers(data);
    } catch {}
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/admin/announcements');
      const data = await res.json();
      if(Array.isArray(data)) setAnnouncements(data);
    } catch {}
  };

  const handleDeleteUser = async (id: string) => {
    if(!confirm("Are you sure you want to delete this user? All their uploaded assets will be purged.")) return;
    try {
      await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch {}
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPosting(true);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      if(res.ok) {
        setTitle('');
        setContent('');
        fetchAnnouncements();
      }
    } catch {} finally { setIsPosting(false); }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
             <Shield className="text-brand-accent p-2 bg-brand-accent/10 rounded-xl" size={42} /> Admin Control Node
          </h1>
          <p className="text-gray-400 pl-1">Manage user governance and global broadcast systems.</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-4">
         <button onClick={() => setActiveTab('users')} className={`px-4 py-2 font-bold rounded-xl transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
           <Users size={18} /> Base Protocol Records
         </button>
         <button onClick={() => setActiveTab('announcements')} className={`px-4 py-2 font-bold rounded-xl transition-all flex items-center gap-2 ${activeTab === 'announcements' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
           <Megaphone size={18} /> Global Broadcaster
         </button>
      </div>

      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border border-white/10 bg-black/20 p-0 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest border-b border-white/10">
                   <tr>
                     <th className="px-6 py-5 font-semibold">Student Profiling</th>
                     <th className="px-6 py-5 font-semibold">Contact Node</th>
                     <th className="px-6 py-5 font-semibold">Sector</th>
                     <th className="px-6 py-5 font-semibold">Authority</th>
                     <th className="px-6 py-5 font-semibold text-right">Termination</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/10">
                   {users.length === 0 ? (
                     <tr><td colSpan={5} className="text-center py-12 text-gray-500">System records are clean. No signals detected.</td></tr>
                   ) : users.map(user => (
                     <tr key={user._id.toString()} className="hover:bg-white/5 transition-colors group">
                       <td className="px-6 py-4">
                         <div className="flex flex-col">
                           <span className="font-bold text-white">{user.name}</span>
                           <span className="text-xs text-brand-purple tracking-widest uppercase">{user.studentId}</span>
                         </div>
                       </td>
                       <td className="px-6 py-4 text-gray-400 text-sm">{user.email}</td>
                       <td className="px-6 py-4">
                         <span className="px-3 py-1 rounded-full bg-brand-indigo/20 text-brand-indigo text-xs font-bold whitespace-nowrap">{user.department}</span>
                       </td>
                       <td className="px-6 py-4 text-gray-400">
                         {user.role === 'admin' ? <span className="flex items-center text-brand-accent font-bold text-xs"><Shield size={14} className="mr-1" /> Root</span> : <span className="text-xs">User</span>}
                       </td>
                       <td className="px-6 py-4 text-right">
                         {user.role !== 'admin' && (
                           <button onClick={() => handleDeleteUser(user._id.toString())} className="text-gray-500 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-colors opacity-50 group-hover:opacity-100">
                             <Trash2 size={18} />
                           </button>
                         )}
                       </td>
                     </tr>
                   ))}
                 </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {activeTab === 'announcements' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <Card className="border border-brand-accent/30 bg-brand-accent/5 shadow-[0_0_50px_rgba(56,189,248,0.05)]">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-brand-accent/20 pb-3 block">Engage Global Push</h3>
            <form onSubmit={handlePostAnnouncement} className="space-y-4 pt-2">
              <div>
                <label className="text-xs tracking-widest uppercase text-brand-accent mb-2 block">Event Header</label>
                <Input placeholder="System Maintenence Protocol engaged..." value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase text-brand-accent mb-2 block">Payload Content</label>
                <textarea 
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 outline-none focus:border-brand-accent transition-colors min-h-[140px]"
                  placeholder="Insert critical signals here..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" isLoading={isPosting} className="w-full md:w-auto bg-brand-accent text-black hover:bg-brand-accent-light hover:glowing-shadow shadow-brand-accent/50 font-bold px-8">
                  Deploy Broadcast
                </Button>
              </div>
            </form>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {announcements.map((post, i) => (
                <Card key={i} className="border border-white/10 hover:border-brand-accent/50 transition-colors flex flex-col h-full bg-black/40">
                   <div className="flex justify-between items-start mb-3">
                     <h4 className="font-bold text-white text-lg pr-4">{post.title}</h4>
                     <span className="text-[10px] text-brand-accent font-bold uppercase tracking-widest border border-brand-accent/30 px-2 py-1 rounded bg-black/50 backdrop-blur-md">Live</span>
                   </div>
                   <p className="text-gray-400 text-sm whitespace-pre-wrap leading-relaxed flex-1">{post.content}</p>
                   <div className="mt-4 border-t border-white/10 pt-3 flex justify-between items-center text-[11px] text-gray-500 font-mono tracking-wider uppercase">
                      <span>Ref::ID {String(post._id).slice(-6)}</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                   </div>
                </Card>
             ))}
          </div>
        </motion.div>
      )}

    </div>
  );
}
