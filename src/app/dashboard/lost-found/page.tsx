"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MapPin, UploadCloud, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function LostFoundPage() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationFound, setLocation] = useState('');
  const [type, setType] = useState('lost');
  const [files, setFiles] = useState<File[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => { fetchItems(); }, [filter]);

  const fetchItems = async () => {
    try {
      const res = await fetch(`/api/lost-found${filter ? `?type=${filter}` : ''}`);
      if (res.ok) setItems(await res.json());
    } catch(e) {}
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    setIsPosting(true);
    
    try {
      const imageUrls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if(uploadRes.ok) imageUrls.push((await uploadRes.json()).url);
      }

      const res = await fetch('/api/lost-found', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
         body: JSON.stringify({ title, description, locationFound, type, imageUrls })
      });
      if(res.ok) {
         toast.success("Post submitted successfully!");
         setTitle(''); setDescription(''); setLocation(''); setFiles([]);
         fetchItems();
      }
    } catch(e) { toast.error("Failed to submit."); } finally { setIsPosting(false); }
  };

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3 mb-2">
           <MapPin className="text-emerald-400" /> Lost & Found
        </h1>
        <p className="text-gray-400">Post items you've lost or report items you've found on campus.</p>
      </header>

      {/* Creation form */}
      <Card className="bg-black/40 border-emerald-400/10 backdrop-blur-xl">
         <h3 className="text-lg font-bold text-emerald-400 tracking-widest uppercase mb-4">Create a Post</h3>
         <form onSubmit={handlePost} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                  <label className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-2 block">Item Name</label>
                  <Input placeholder="e.g. AirPods Pro..." value={title} onChange={e => setTitle(e.target.value)} required />
               </div>
               <div>
                  <label className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-2 block">Location</label>
                  <Input icon={Target} placeholder="Library Floor 2..." value={locationFound} onChange={e => setLocation(e.target.value)} required />
               </div>
               <div>
                  <label className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase mb-2 block animate-pulse">Post Type</label>
                  <select className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 h-[50px] text-white outline-none focus:border-emerald-400 transition-colors" value={type} onChange={e => setType(e.target.value)}>
                     <option value="lost">I lost this item (Lost)</option>
                     <option value="found">I found this item (Found)</option>
                  </select>
               </div>
            </div>
            <div>
               <label className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-2 block">Details & Description</label>
               <textarea className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-emerald-400 min-h-[80px] transition-colors" placeholder="Describe the item, color, or where to meet..." value={description} onChange={e => setDescription(e.target.value)} required />
            </div>
            <div>
               <label className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-2 block">Photos (Optional)</label>
               <input type="file" id="assetsLF" multiple accept="image/*" className="hidden" onChange={e => setFiles(Array.from(e.target.files || []))} />
               <label htmlFor="assetsLF" className="w-full border border-dashed border-white/20 hover:border-emerald-400 bg-black/40 rounded-xl flex flex-col items-center justify-center py-6 cursor-pointer transition-colors text-gray-400 hover:text-emerald-400">
                  <UploadCloud size={24} className="mb-2" />
                  {files.length > 0 ? <span className="font-bold text-emerald-400">{files.length} Photo(s) Selected</span> : "Upload Photos"}
               </label>
            </div>
            <Button type="submit" isLoading={isPosting} className="bg-emerald-500 text-black shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:bg-emerald-400 font-bold">Submit Post</Button>
         </form>
      </Card>

      <div className="flex gap-2 bg-black/40 p-2 rounded-2xl border border-white/5 w-max">
         <button onClick={() => setFilter('')} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${filter === '' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>All Items</button>
         <button onClick={() => setFilter('lost')} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${filter === 'lost' ? 'bg-red-500/20 text-red-500' : 'text-gray-500 hover:text-red-400'}`}>Lost Only</button>
         <button onClick={() => setFilter('found')} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${filter === 'found' ? 'bg-blue-500/20 text-blue-500' : 'text-gray-500 hover:text-blue-400'}`}>Found Only</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {items.map((item, i) => (
            <motion.div initial={{opacity:0, scale: 0.95}} animate={{opacity:1, scale: 1}} transition={{delay: i*0.05}} key={item._id}>
               <Card className={`p-0 overflow-hidden border-t-[3px] ${item.type === 'lost' ? 'border-red-500/80' : 'border-blue-500/80'} flex flex-col h-full bg-black/60 shadow-2xl`}>
                  <div className="h-44 relative overflow-hidden flex items-center justify-center bg-white/5">
                     {item.imageUrls?.length > 0 ? (
                        <img src={item.imageUrls[0]} alt={item.title} className="w-full h-full object-cover" />
                     ) : <Target size={56} className="opacity-10 text-emerald-400" />}
                     <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase shadow-xl backdrop-blur-md ${item.type === 'lost' ? 'bg-red-500/80 text-white' : 'bg-blue-500/80 text-white border border-blue-400'}`}>
                        {item.type}
                     </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col relative">
                     <h4 className="font-bold text-lg text-white mb-2 leading-tight">{item.title}</h4>
                     <p className="text-gray-400 text-xs mb-3 line-clamp-3 leading-relaxed">{item.description}</p>
                     
                     <div className="mt-auto pt-4 border-t border-white/5 flex flex-col gap-2">
                        <span className="text-[10px] text-gray-500 font-mono flex items-center gap-2 tracking-widest"><MapPin size={10} className={item.type === 'lost' ? 'text-red-400' : 'text-blue-400'}/> LOCATION: {item.locationFound}</span>
                        <div className="flex items-center justify-between mt-1">
                           <span className="text-[10px] text-brand-accent uppercase font-bold tracking-widest truncate">{item.reportedBy?.name}</span>
                           <Button variant="ghost" className="text-white hover:bg-emerald-500/20 border border-emerald-500/30 text-[10px] uppercase font-bold tracking-widest h-7 px-3">Message</Button>
                        </div>
                     </div>
                  </div>
               </Card>
            </motion.div>
         ))}
      </div>
    </div>
  );
}
