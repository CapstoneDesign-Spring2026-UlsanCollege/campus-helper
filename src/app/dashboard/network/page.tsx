"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, UserPlus, Check, X, Users, Ghost } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function NetworkPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => { fetchNetwork(); }, []);

  const fetchNetwork = async () => {
    try {
      const res = await fetch('/api/friends', {
         headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPending(data.pending || []);
        setFriends(data.connections || []);
      }
    } catch(e) {}
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if(!query) return;
    setIsSearching(true);
    try {
       const res = await fetch(`/api/friends?action=search&q=${encodeURIComponent(query)}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
       });
       const data = await res.json();
       if(res.ok) setResults(data);
    } catch(e) { toast.error("Search failed"); } finally { setIsSearching(false); }
  };

  const sendRequest = async (targetId: string) => {
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ targetId })
      });
      if(res.ok) {
         toast.success("Friend request sent!");
         setResults(results.filter(r => r._id !== targetId));
      }
      else toast.error((await res.json()).error || "Failed to send request");
    } catch(e) {}
  };

  const handleAction = async (friendshipId: string, action: 'accept'|'reject') => {
    try {
      const res = await fetch('/api/friends', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ friendshipId, action })
      });
      if(res.ok) {
         toast.success(action === 'accept' ? "Friend added" : "Request declined");
         fetchNetwork();
      }
    } catch(e) {}
  };

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3 mb-2">
           <Users className="text-brand-indigo" /> Student Network
        </h1>
        <p className="text-gray-400">Find and connect with other students on campus.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Search Node */}
          <Card className="bg-black/40 border border-white/5 backdrop-blur-xl">
             <form onSubmit={handleSearch} className="flex gap-4 items-end">
                <div className="flex-1">
                   <label className="text-xs text-brand-indigo mb-2 block font-bold uppercase tracking-widest">Search Students (Name or Major)</label>
                   <Input icon={Search} placeholder="e.g. Computer Science..." value={query} onChange={e => setQuery(e.target.value)} />
                </div>
                <Button type="submit" isLoading={isSearching} className="bg-brand-indigo text-white mb-1 shadow-brand-indigo/30 hover:shadow-[0_0_20px_rgba(102,126,234,0.4)]">Search</Button>
             </form>
             
             {results.length > 0 && (
               <div className="mt-8 space-y-3">
                 <h3 className="text-xs font-bold text-brand-accent uppercase tracking-widest pl-2">Search Results</h3>
                 {results.map((user, i) => (
                   <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: i*0.05}} key={user._id} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                      <div>
                         <h4 className="font-bold text-white text-lg tracking-tight">{user.name}</h4>
                         <span className="text-xs text-brand-purple tracking-widest uppercase">{user.department}</span>
                      </div>
                      <button onClick={() => sendRequest(user._id)} className="p-3 rounded-lg bg-brand-accent/10 text-brand-accent hover:bg-brand-accent hover:text-black hover:shadow-brand-accent transition-all duration-300">
                         <UserPlus size={20} />
                      </button>
                   </motion.div>
                 ))}
               </div>
             )}
          </Card>

          {/* Established Connections */}
          <div>
             <h3 className="text-lg font-bold text-white mb-4 block pl-2">My Friends</h3>
             {friends.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl bg-black/20 text-gray-500">
                  <Ghost size={48} className="mx-auto mb-4 opacity-20" />
                  You haven't added any friends yet. Search above to find classmates!
                </div>
             ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {friends.map((f, i) => {
                    const userStr = localStorage.getItem('user');
                    const myId = userStr ? JSON.parse(userStr).id : '';
                    const peer = f.requester._id === myId ? f.recipient : f.requester;
                    return (
                      <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} transition={{delay: i * 0.1}} key={f._id}>
                        <Card className="p-5 flex gap-4 items-center hover:border-brand-indigo/50 hover:bg-brand-indigo/5 transition-colors cursor-pointer group">
                           <div className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-2xl uppercase group-hover:shadow-[0_0_20px_rgba(102,126,234,0.4)] transition-all">
                              {peer.name.charAt(0)}
                           </div>
                           <div className="flex flex-col flex-1 truncate">
                              <h4 className="font-bold text-white text-lg leading-tight truncate">{peer.name}</h4>
                              <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase truncate">{peer.department}</span>
                           </div>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
             )}
          </div>
        </div>

        {/* Action Center - Sidebar */}
        <div className="space-y-6">
           <Card className="bg-brand-accent/5 border border-brand-accent/20 sticky top-24">
              <h3 className="text-sm font-bold text-brand-accent mb-4 uppercase tracking-widest flex items-center gap-2"><Check size={16}/> Friend Requests</h3>
              {pending.length === 0 ? <p className="text-xs text-gray-500 text-center py-6">No pending requests.</p> : (
                 <div className="space-y-4">
                    {pending.map(req => (
                       <div key={req._id} className="p-4 bg-black/40 rounded-xl border border-white/5 shadow-2xl">
                          <div className="mb-4">
                             <p className="text-base text-white font-bold truncate">{req.requester.name}</p>
                             <p className="text-[10px] text-gray-500 font-mono uppercase">{req.requester.department}</p>
                          </div>
                          <div className="flex gap-2">
                             <Button onClick={() => handleAction(req._id, 'accept')} className="flex-1 text-xs py-1 h-9 bg-brand-accent text-black font-bold border-none hover:shadow-brand-accent shadow-md">Accept</Button>
                             <Button onClick={() => handleAction(req._id, 'reject')} variant="ghost" className="flex-1 text-xs py-1 h-9 hover:bg-red-500/20 hover:text-red-400">Decline</Button>
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </Card>
        </div>
      </div>
    </div>
  );
}
