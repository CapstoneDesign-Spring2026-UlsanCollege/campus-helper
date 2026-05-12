"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Camera,
  MapPin,
  MessageSquareMore,
  Radar,
  ShieldCheck,
  Target,
  UploadCloud,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Avatar } from '@/components/ui/Avatar';
import { useRouter } from 'next/navigation';
import { fetchWithAuth, readApiError, uploadAsset } from '@/lib/client-api';
import { MediaGallery } from '@/components/media/MediaGallery';
import { StudioHero } from '@/components/media/StudioHero';

type LostFoundUser = {
  _id: string;
  name: string;
  email?: string;
  department?: string;
  profilePicture?: string;
};

type LostFoundItem = {
  _id: string;
  title: string;
  description: string;
  locationFound: string;
  imageUrls: string[];
  reportedBy: LostFoundUser;
  type: 'lost' | 'found';
  status?: 'active' | 'resolved';
  createdAt?: string;
};

function SelectedPhotoPreview({ file }: { file: File }) {
  const objectUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  return (
    <div className="aspect-square overflow-hidden rounded-2xl border border-white/10 bg-black/40">
      <img src={objectUrl} alt={file.name} className="h-full w-full object-cover" />
    </div>
  );
}

export default function LostFoundPage() {
  const router = useRouter();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [filter, setFilter] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationFound, setLocation] = useState('');
  const [type, setType] = useState<'lost' | 'found'>('lost');
  const [files, setFiles] = useState<File[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [statusText, setStatusText] = useState('Ready to post');
  const [myId, setMyId] = useState('');

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`/api/lost-found${filter ? `?type=${filter}` : ''}`);
      if (res.ok) setItems(await res.json());
    } catch {
      // ignore
    }
  }, [filter]);

  useEffect(() => {
    void fetchItems();
    try {
      const stored = localStorage.getItem('user');
      if (stored) setMyId(String(JSON.parse(stored).id ?? ''));
    } catch {
      // ignore
    }
  }, [fetchItems]);

  const openChatForReporter = (reporter: LostFoundUser) => {
    if (!reporter?._id || reporter._id === myId) return;

    const params = new URLSearchParams({
      userId: reporter._id,
      name: reporter.name || 'Campus user',
      context: 'lost-found',
    });

    if (reporter.department) params.set('department', reporter.department);
    if (reporter.profilePicture) params.set('profilePicture', reporter.profilePicture);

    router.push(`/dashboard/chat?${params.toString()}`);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !locationFound) return;
    setIsPosting(true);

    try {
      const imageUrls: string[] = [];
      if (files.length > 0) {
        setStatusText('Uploading item photos');
        for (const file of files) {
          const asset = await uploadAsset(file, 'ulsan_lost_found');
          imageUrls.push(asset.url);
        }
      }

      setStatusText('Publishing to the campus board');

      const res = await fetchWithAuth('/api/lost-found', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, locationFound, type, imageUrls }),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, 'Failed to submit post.'));
      }

      toast.success('Post submitted successfully.');
      setTitle('');
      setDescription('');
      setLocation('');
      setType('lost');
      setFiles([]);
      setStatusText('Published to the campus board');
      await fetchItems();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to submit.';
      setStatusText('Submit failed');
      toast.error(message);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <StudioHero
        badge="Campus Recovery Grid"
        title="Lost & Found"
        description="Report missing items and found objects with clearer photos, stronger publishing feedback, and a calmer student-safe layout."
        icon={Radar}
        accentClassName="text-emerald-400"
      />

      <Card className="overflow-hidden border-white/10 bg-black/45 p-0">
        <div className="p-6 lg:p-7">
            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-emerald-400">Post Console</p>
              <h3 className="mt-2 text-2xl font-bold text-white">Make a post that helps someone recognize the item fast</h3>
            </div>

            <form onSubmit={handlePost} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input
                  label="Item Name"
                  placeholder="AirPods Pro, student ID, black wallet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <Input
                  label="Location"
                  icon={Target}
                  placeholder="Library floor 2, cafeteria, bus stop"
                  value={locationFound}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-gray-400">Post Type</label>
                  <select
                    className="min-h-[48px] w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                    value={type}
                    onChange={(e) => setType(e.target.value === 'found' ? 'found' : 'lost')}
                  >
                    <option value="lost" className="bg-black text-white">I lost this item</option>
                    <option value="found" className="bg-black text-white">I found this item</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-gray-400">Details</label>
                <textarea
                  className="min-h-[120px] w-full rounded-lg border border-white/10 bg-white/5 p-4 text-white outline-none transition focus:border-emerald-400"
                  placeholder="Color, identifying marks, when it was last seen, or how to return it safely."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="rounded-3xl border border-dashed border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Add item photos</p>
                    <p className="mt-1 text-sm text-gray-400">Photos now go through the same reliable upload path as the rest of the app.</p>
                  </div>
                  <input
                    type="file"
                    id="assetsLF"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  />
                  <label
                    htmlFor="assetsLF"
                    className="inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-emerald-400 hover:bg-emerald-400/15"
                  >
                    <UploadCloud size={18} />
                    Choose photos
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                    {files.map((file) => (
                      <SelectedPhotoPreview key={`${file.name}-${file.lastModified}`} file={file} />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/35 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className={`h-5 w-5 ${isPosting ? 'text-brand-accent' : 'text-emerald-400'}`} />
                  <div>
                    <p className="text-sm font-semibold text-white">Post status</p>
                    <p className="text-xs uppercase tracking-[0.24em] text-gray-500">{statusText}</p>
                  </div>
                </div>
                <Button type="submit" isLoading={isPosting} className="w-full bg-emerald-400 text-black hover:bg-emerald-300 md:w-auto">
                  Submit post
                </Button>
              </div>
            </form>
          </div>
      </Card>

      <div className="flex max-w-full gap-2 overflow-x-auto rounded-2xl border border-white/5 bg-black/40 p-2">
        <button
          onClick={() => setFilter('')}
          className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] transition-all ${filter === '' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
        >
          All Items
        </button>
        <button
          onClick={() => setFilter('lost')}
          className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] transition-all ${filter === 'lost' ? 'bg-red-500/20 text-red-300' : 'text-gray-500 hover:text-red-300'}`}
        >
          Lost Only
        </button>
        <button
          onClick={() => setFilter('found')}
          className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] transition-all ${filter === 'found' ? 'bg-blue-500/20 text-blue-300' : 'text-gray-500 hover:text-blue-300'}`}
        >
          Found Only
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, i) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={item._id}>
            <Card className={`flex h-full flex-col overflow-hidden border-white/10 bg-black/60 p-0 ${item.type === 'lost' ? 'ring-1 ring-red-500/20' : 'ring-1 ring-blue-500/20'}`}>
              <div className="p-4 pb-0">
                <MediaGallery
                  images={item.imageUrls}
                  alt={item.title}
                  icon={Camera}
                  accentClassName={item.type === 'lost' ? 'text-red-300' : 'text-blue-300'}
                />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.28em] ${item.type === 'lost' ? 'text-red-300' : 'text-blue-300'}`}>
                      {item.type === 'lost' ? 'Missing item' : 'Found item'}
                    </p>
                    <h4 className="mt-2 text-xl font-bold leading-tight text-white">{item.title}</h4>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] ${item.type === 'lost' ? 'bg-red-500/15 text-red-200' : 'bg-blue-500/15 text-blue-200'}`}>
                    {item.type}
                  </div>
                </div>

                <p className="text-sm leading-6 text-gray-400">{item.description}</p>

                <div className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-gray-500">
                  <MapPin size={12} className={item.type === 'lost' ? 'text-red-300' : 'text-blue-300'} />
                  {item.locationFound}
                </div>

                <div className="mt-auto flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar src={item.reportedBy?.profilePicture} name={item.reportedBy?.name} className="h-10 w-10 text-sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{item.reportedBy?.name}</p>
                      <p className="truncate text-[10px] uppercase tracking-[0.24em] text-gray-500">{item.reportedBy?.department}</p>
                    </div>
                  </div>
                  {item.reportedBy?._id && item.reportedBy._id !== myId && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => openChatForReporter(item.reportedBy)}
                      className="h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold uppercase tracking-[0.24em] text-white hover:bg-emerald-500/20"
                    >
                      <MessageSquareMore size={14} className="mr-2" />
                      Message
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
