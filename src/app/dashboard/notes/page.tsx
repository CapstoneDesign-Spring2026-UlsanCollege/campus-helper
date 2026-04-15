"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { UploadCloud, FileText, Download, Heart, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [filterDept, setFilterDept] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Computer Science');

  useEffect(() => {
    fetchNotes();
  }, [filterDept]);

  const fetchNotes = async () => {
    try {
      const url = filterDept ? `/api/notes?department=${filterDept}` : '/api/notes';
      const res = await fetch(url);
      const data = await res.json();
      if(Array.isArray(data)) setNotes(data);
    } catch(e) {}
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !department) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('department', department);

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setTitle('');
        setFile(null);
        fetchNotes();
      }
    } catch(e) {} finally { setIsUploading(false); }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Campus Notes</h1>
          <p className="text-gray-400">Share and discover study resources.</p>
        </div>
      </header>

      {/* Upload Section */}
      <Card className="border border-white/10 bg-black/20">
        <h3 className="text-lg font-bold text-white mb-4">Upload a Note</h3>
        <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4 items-end">
           <div className="w-full md:w-1/3">
             <label className="text-xs text-gray-400 mb-1 block">Title</label>
             <Input placeholder="e.g. Chapter 4 Algorithms Summary" value={title} onChange={e => setTitle(e.target.value)} required />
           </div>
           <div className="w-full md:w-1/4">
             <label className="text-xs text-gray-400 mb-1 block">Department</label>
             <select 
               className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-purple"
               value={department} onChange={e => setDepartment(e.target.value)}
             >
               <option value="Computer Science" className="bg-black text-white">Computer Science</option>
               <option value="Business" className="bg-black text-white">Business</option>
               <option value="Design" className="bg-black text-white">Design</option>
               <option value="Engineering" className="bg-black text-white">Engineering</option>
             </select>
           </div>
           <div className="w-full md:w-1/3 flex-1 relative">
             <input type="file" id="file_upload" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
             <label htmlFor="file_upload" className="w-full bg-white/5 border border-dashed border-white/20 hover:border-brand-accent transition-colors rounded-xl px-4 py-3 text-gray-400 flex items-center justify-center cursor-pointer h-full min-h-[50px]">
                <UploadCloud size={18} className="mr-2 shrink-0" />
                <span className="truncate">{file ? file.name : "Choose File (PDF/Img)"}</span>
             </label>
           </div>
           <Button type="submit" isLoading={isUploading} disabled={!file || !title} className="mb-1 bg-brand-indigo w-full md:w-auto">
             Upload
           </Button>
        </form>
      </Card>

      {/* Filter and Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <Filter size={18} className="text-gray-400" />
          <select 
             className="bg-transparent border-none text-white text-sm outline-none cursor-pointer p-0"
             value={filterDept} onChange={e => setFilterDept(e.target.value)}
          >
             <option value="" className="bg-black text-white">All Departments</option>
             <option value="Computer Science" className="bg-black text-white">Computer Science</option>
             <option value="Business" className="bg-black text-white">Business</option>
             <option value="Design" className="bg-black text-white">Design</option>
             <option value="Engineering" className="bg-black text-white">Engineering</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {notes.length === 0 ? (
             <div className="col-span-full py-12 text-center text-gray-500">
               <FileText size={48} className="mx-auto mb-4 opacity-20" />
               <p>No notes found for this department yet.</p>
             </div>
          ) : (
            notes.map((note) => (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={note._id}>
                <Card className="flex flex-col h-full hover:border-brand-purple/50 transition-colors cursor-default relative overflow-hidden group p-5">
                  <div className="absolute top-0 left-0 w-full h-1 gradient-bg opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex-1 mt-2">
                    <div className="flex justify-between items-start mb-3">
                       <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-brand-purple/20 text-brand-purple">
                         {note.department}
                       </span>
                       <button className="text-gray-500 hover:text-red-400 transition-colors"><Heart size={16} /></button>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 leading-tight">{note.title}</h3>
                    <p className="text-[11px] text-gray-500">Uploaded {new Date(note.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center"><Heart size={12} className="mr-1" /> {note.likes?.length || 0}</span>
                    <a href={note.fileUrl} target="_blank" rel="noreferrer" className="shrink-0">
                      <Button variant="ghost" className="text-brand-accent hover:bg-brand-accent/10 px-3 py-1 h-8 text-xs">
                        <Download size={14} className="mr-1" /> View Note
                      </Button>
                    </a>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
