"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, UploadCloud, Tag, Trash, Edit2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Avatar } from '@/components/ui/Avatar';

function SelectedPhotoPreview({ file }: { file: File }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    const nextSrc = URL.createObjectURL(file);
    setSrc(nextSrc);
    return () => URL.revokeObjectURL(nextSrc);
  }, [file]);

  return (
    <div className="aspect-square overflow-hidden rounded-lg border border-white/10 bg-black/40">
      {src && <img src={src} alt={file.name} className="h-full w-full object-cover" />}
    </div>
  );
}

export default function MarketPage() {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [myId, setMyId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { 
    fetchItems();
    const stored = localStorage.getItem('user');
    if (stored) setMyId(JSON.parse(stored).id);
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/market');
      if (res.ok) setItems(await res.json());
    } catch(e) {}
  };

  const handleDelete = async (id: string) => {
     if(!confirm("Are you sure you want to permanently delete this listing?")) return;
     try {
       const res = await fetch(`/api/market?id=${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
       });
       if(res.ok) {
          toast.success("Item permanently removed.");
          fetchItems();
       } else toast.error("Failed to delete item.");
     } catch(e) { toast.error("Network error"); }
  };

  const prepareEdit = (item: any) => {
     setEditingId(item._id);
     setTitle(item.title);
     setDescription(item.description);
     setPrice(item.price.toString());
     window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
     setEditingId(null);
     setTitle('');
     setDescription('');
     setPrice('');
     setFiles([]);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !description) return;
    setIsPosting(true);
    
    try {
      const imageUrls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!uploadRes.ok) {
          const error = await uploadRes.json().catch(() => ({ error: 'Image upload failed' }));
          throw new Error(error.error || 'Image upload failed');
        }
        const uploaded = await uploadRes.json();
        if (!uploaded.url) throw new Error('Image upload did not return a URL');
        imageUrls.push(uploaded.url);
      }

      const method = editingId ? 'PUT' : 'POST';
      const bodyPayload = editingId 
          ? { _id: editingId, title, description, price: Number(price) }
          : { title, description, price: Number(price), imageUrls };

      const res = await fetch('/api/market', {
         method: method,
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
         body: JSON.stringify(bodyPayload)
      });
      if(res.ok) {
         toast.success(editingId ? "Listing Modified Successfully!" : "Item successfully listed!");
         cancelEdit();
         fetchItems();
      } else toast.error("Processing failed.");
    } catch(e) {
      toast.error(e instanceof Error ? e.message : "Network error.");
    } finally { setIsPosting(false); }
  };

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3 mb-2">
           <ShoppingBag className="text-brand-purple" /> Marketplace
        </h1>
        <p className="text-gray-400">Buy, sell, and trade items with other students on campus.</p>
      </header>

      {/* Creation / Edit form */}
      <Card className={`border-white/5 backdrop-blur-xl transition-all ${editingId ? 'bg-brand-purple/10 border-brand-purple/50 shadow-[0_0_50px_rgba(167,139,250,0.1)]' : 'bg-black/40'}`}>
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-brand-purple tracking-widest uppercase">
               {editingId ? 'Modify Active Listing' : 'Post a New Item'}
            </h3>
            {editingId && (
               <Button onClick={cancelEdit} variant="ghost" className="text-red-400 hover:bg-red-400/20 h-8 px-3 rounded-xl border border-red-400/20">
                  <X size={16} className="mr-2" /> Cancel Edit
               </Button>
            )}
         </div>

         <form onSubmit={handlePost} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-2 block">Item Name</label>
                  <Input placeholder="e.g. Algorithm Textbook..." value={title} onChange={e => setTitle(e.target.value)} required />
               </div>
               <div>
                  <label className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-2 block">Price (₩ / USD)</label>
                  <Input type="number" icon={Tag} placeholder="50.00" value={price} onChange={e => setPrice(e.target.value)} required min={0} />
               </div>
            </div>
            <div>
               <label className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-2 block">Item Description</label>
               <textarea className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-brand-purple min-h-[100px] transition-colors" placeholder="Condition, Edition, Pickup location..." value={description} onChange={e => setDescription(e.target.value)} required />
            </div>
            {!editingId && (
              <div>
                 <label className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-2 block">Photos (Optional)</label>
                 <input type="file" id="assets" multiple accept="image/*" className="hidden" onChange={e => setFiles(Array.from(e.target.files || []))} />
                 <label htmlFor="assets" className="w-full border border-dashed border-white/20 hover:border-brand-purple bg-white/5 rounded-xl flex flex-col items-center justify-center py-8 cursor-pointer transition-colors text-gray-400 hover:text-white">
                    <UploadCloud size={24} className="mb-2" />
                    {files.length > 0 ? <span className="text-brand-purple font-bold">{files.length} Photo(s) Selected</span> : "Upload Pictures"}
                 </label>
                 {files.length > 0 && (
                   <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
                     {files.map((file) => (
                       <SelectedPhotoPreview key={`${file.name}-${file.lastModified}`} file={file} />
                     ))}
                   </div>
                 )}
              </div>
            )}
            <Button type="submit" isLoading={isPosting} className="bg-brand-purple font-bold text-white shadow-brand-purple/30 hover:shadow-[0_0_20px_rgba(167,139,250,0.5)]">
               {editingId ? 'Save Modifications' : 'Publish Listing'}
            </Button>
         </form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {items.map((item, i) => {
            const isOwner = item.sellerId?._id === myId;

            return (
              <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} transition={{delay: i*0.05}} key={item._id}>
                 <Card className={`p-0 overflow-hidden group hover:border-brand-purple/50 cursor-pointer h-full flex flex-col shadow-2xl relative ${isOwner ? 'bg-[#0f0a1f] border-brand-purple/30' : 'bg-black/60'}`}>
                    
                    {/* Owner Manipulation Matrix */}
                    {isOwner && (
                       <div className="absolute top-2 left-2 z-20 flex gap-2">
                          <button onClick={() => prepareEdit(item)} className="p-2 bg-black/80 backdrop-blur border border-white/10 rounded-full text-brand-purple hover:bg-brand-purple hover:text-white transition-colors" title="Edit Listing">
                             <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(item._id)} className="p-2 bg-black/80 backdrop-blur border border-white/10 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors" title="Delete Listing">
                             <Trash size={14} />
                          </button>
                       </div>
                    )}

                    <div className="h-52 bg-white/5 relative overflow-hidden flex items-center justify-center">
                       {item.imageUrls?.length > 0 ? (
                          <img src={item.imageUrls[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                       ) : <ShoppingBag size={48} className="opacity-10" />}
                       <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 text-brand-purple font-black text-lg shadow-xl shadow-black">
                          ${item.price}
                       </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col relative z-10 bg-gradient-to-t from-black via-black/80 to-transparent">
                       <h4 className="font-bold text-xl text-white leading-tight mb-2 truncate">{item.title}</h4>
                       <p className="text-gray-400 text-xs mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
                       
                       <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                             <Avatar src={item.sellerId?.profilePicture} name={isOwner ? 'You' : item.sellerId?.name} className="h-10 w-10 text-sm" />
                             <div className="min-w-0">
                             <p className={`text-xs font-bold tracking-tight ${isOwner ? 'text-brand-purple' : 'text-brand-accent'}`}>
                                {isOwner ? 'You (Owner)' : item.sellerId?.name}
                             </p>
                             <p className="text-[9px] text-gray-500 uppercase tracking-widest">{item.sellerId?.department}</p>
                             </div>
                          </div>
                          {!isOwner && (
                             <Button variant="ghost" className="text-white hover:bg-brand-purple/20 bg-white/5 text-[10px] uppercase font-bold tracking-widest h-8 px-3 transition-colors border border-white/5">Message</Button>
                          )}
                       </div>
                    </div>
                 </Card>
              </motion.div>
            )
         })}
      </div>
    </div>
  );
}
