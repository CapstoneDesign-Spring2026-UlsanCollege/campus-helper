"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Camera,
  MapPin,
  MessageSquareMore,
  Plus,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  UploadCloud,
  X,
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

function formatRelativeTime(value?: string) {
  if (!value) return 'Recently';
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return 'Recently';
  const diffMinutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return diffDays < 7 ? `${diffDays}d ago` : new Date(value).toLocaleDateString();
}

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
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'resolved' | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationFound, setLocation] = useState('');
  const [type, setType] = useState<'lost' | 'found'>('lost');
  const [files, setFiles] = useState<File[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [statusText, setStatusText] = useState('Ready to post');
  const [myId, setMyId] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('type', filter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('query', searchQuery.trim());
      const res = await fetch(`/api/lost-found${params.toString() ? `?${params.toString()}` : ''}`);
      if (res.ok) setItems(await res.json());
    } catch {
      // ignore
    }
  }, [filter, searchQuery, statusFilter]);

  useEffect(() => {
    void fetchItems();
    try {
      const stored = localStorage.getItem('user');
      if (stored) setMyId(String(JSON.parse(stored).id ?? ''));
    } catch {
      // ignore
    }
  }, [fetchItems]);

  useEffect(() => {
    const openComposer = () => setIsComposerOpen(true);
    const pendingComposer = sessionStorage.getItem('campus:open-composer');

    if (pendingComposer === '/dashboard/lost-found' || window.location.search.includes('compose=1')) {
      setIsComposerOpen(true);
      sessionStorage.removeItem('campus:open-composer');
    }

    window.addEventListener('campus:open-composer', openComposer);
    return () => window.removeEventListener('campus:open-composer', openComposer);
  }, []);

  const openChatForReporter = (reporter: LostFoundUser, itemTitle: string) => {
    if (!reporter?._id || reporter._id === myId) return;

    const params = new URLSearchParams({
      userId: reporter._id,
      name: reporter.name || 'Campus user',
      context: 'lost-found',
      draft: `Hi, I'm contacting you about "${itemTitle}". Is this item still available?`,
    });

    if (reporter.department) params.set('department', reporter.department);
    if (reporter.profilePicture) params.set('profilePicture', reporter.profilePicture);

    router.push(`/dashboard/chat?${params.toString()}`);
  };

  const handleAICleanReport = async () => {
    if (isAiDrafting) return;

    if (!title.trim() && !description.trim() && !locationFound.trim()) {
      toast.error('Add the item, location, or rough details first.');
      return;
    }

    setIsAiDrafting(true);
    setStatusText('AI is cleaning up the report');

    try {
      const res = await fetchWithAuth('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'lost-found',
          payload: { title, description, locationFound, type },
        }),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, 'AI could not clean up this report.'));
      }

      const data = await res.json().catch(() => null) as { title?: string; description?: string } | null;
      if (data?.title) setTitle(data.title);
      if (data?.description) setDescription(data.description);

      setStatusText('AI report draft ready');
      toast.success('AI cleaned up your report.');
    } catch (error) {
      setStatusText('AI assist failed');
      toast.error(error instanceof Error ? error.message : 'AI could not clean up this report.');
    } finally {
      setIsAiDrafting(false);
    }
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
      setIsComposerOpen(false);
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

  const toggleResolved = async (item: LostFoundItem) => {
    const nextStatus = item.status === 'resolved' ? 'active' : 'resolved';
    try {
      const res = await fetchWithAuth('/api/lost-found', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: item._id, status: nextStatus }),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, 'Could not update post status.'));
      }

      toast.success(nextStatus === 'resolved' ? 'Post marked as resolved.' : 'Post reopened.');
      await fetchItems();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update post status.');
    }
  };

  return (
    <div className="responsive-page space-y-6 md:space-y-8">
      <StudioHero
        badge="Campus Recovery Grid"
        title="Lost & Found"
        description="Report missing items and found objects with clearer status, stronger owner identity, and a calmer student-safe layout."
        icon={Radar}
        accentClassName="text-emerald-400"
      />

      <div className="sticky-action-band -mt-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-400">Report</p>
          <p className="mt-1 text-xs text-slate-400">Open a new lost or found post when you need it.</p>
        </div>
        {!isComposerOpen ? (
          <Button type="button" onClick={() => setIsComposerOpen(true)} className="min-h-[46px] min-w-[150px] bg-emerald-400 text-black hover:bg-emerald-300 sm:min-w-[170px]">
            <Plus size={18} className="mr-2" />
            Add report
          </Button>
        ) : null}
      </div>

      {isComposerOpen ? (
      <Card className="overflow-hidden border-white/10 bg-black/45 p-0">
        <div className="p-4 sm:p-5 lg:p-7">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-emerald-400">Post Console</p>
                <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl">Make a post that helps someone recognize the item fast</h3>
              </div>
              <Button
                type="button"
                onClick={() => {
                  setIsComposerOpen(false);
                  setStatusText('Ready to post');
                }}
                variant="ghost"
                className="h-11 rounded-xl border border-red-400/20 px-3 text-red-300 hover:bg-red-500/15"
              >
                <X size={16} className="mr-2" />
                Close
              </Button>
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
                    className="focus-ring min-h-[48px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition focus:border-emerald-400 md:text-sm"
                    value={type}
                    onChange={(e) => setType(e.target.value === 'found' ? 'found' : 'lost')}
                  >
                    <option value="lost" className="bg-black text-white">I lost this item</option>
                    <option value="found" className="bg-black text-white">I found this item</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <label className="block text-xs font-bold uppercase tracking-[0.24em] text-gray-400">Details</label>
                  <Button
                    type="button"
                    variant="ghost"
                    isLoading={isAiDrafting}
                    onClick={() => void handleAICleanReport()}
                    className="min-h-[40px] rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-3 text-[10px] uppercase tracking-[0.22em] text-white hover:bg-emerald-400/15"
                  >
                    <Sparkles size={14} className="mr-2" />
                    AI clean up
                  </Button>
                </div>
                <textarea
                  className="focus-ring min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-base text-white outline-none transition focus:border-emerald-400 md:text-sm"
                  placeholder="Color, identifying marks, when it was last seen, or how to return it safely."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="rounded-3xl border border-dashed border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 sm:p-5">
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
      ) : null}

      <Card className="border-white/10 bg-black/45 p-4 lg:p-5">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <Input
            label="Search posts"
            icon={Search}
            placeholder="Search wallets, IDs, earphones, places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-gray-400">Type filter</label>
            <div className="flex gap-2 rounded-2xl border border-white/10 bg-black/35 p-1">
              {(['all', 'lost', 'found'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`flex-1 rounded-xl px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] transition ${
                    filter === value ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-gray-400">Status filter</label>
            <div className="flex gap-2 rounded-2xl border border-white/10 bg-black/35 p-1">
              {(['active', 'resolved', 'all'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={`flex-1 rounded-xl px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] transition ${
                    statusFilter === value ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex max-w-full gap-2 overflow-x-auto rounded-2xl border border-white/5 bg-black/40 p-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] transition-all ${filter === 'all' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
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
        {items.length === 0 ? (
          <Card className="col-span-full border-white/10 bg-black/35 py-12 text-center">
            <Radar size={48} className="mx-auto mb-4 text-emerald-400/50" />
            <p className="text-lg font-semibold text-white">No lost or found posts found</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">Try another search/filter or create a clear report for the campus recovery grid.</p>
          </Card>
        ) : items.map((item, i) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={item._id}>
            <Card className={`flex h-full flex-col overflow-hidden border-white/10 bg-black/60 p-0 ${item.type === 'lost' ? 'ring-1 ring-red-500/20' : 'ring-1 ring-blue-500/20'} ${item.status === 'resolved' ? 'opacity-80' : ''}`}>
              <div className="p-3 pb-0 sm:p-4 sm:pb-0">
                <MediaGallery
                  images={item.imageUrls}
                  alt={item.title}
                  icon={Camera}
                  accentClassName={item.type === 'lost' ? 'text-red-300' : 'text-blue-300'}
                />
              </div>

              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.28em] ${item.type === 'lost' ? 'text-red-300' : 'text-blue-300'}`}>
                      {item.type === 'lost' ? 'Missing item' : 'Found item'}
                    </p>
                    <h4 className="mt-2 text-xl font-bold leading-tight text-white">{item.title}</h4>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] ${item.type === 'lost' ? 'bg-red-500/15 text-red-200' : 'bg-blue-500/15 text-blue-200'}`}>
                      {item.type}
                    </div>
                    <div className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] ${item.status === 'resolved' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-amber-500/15 text-amber-200'}`}>
                      {item.status || 'active'}
                    </div>
                  </div>
                </div>

                <p className="text-sm leading-6 text-gray-400">{item.description}</p>

                <div className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-gray-500">
                  <MapPin size={12} className={item.type === 'lost' ? 'text-red-300' : 'text-blue-300'} />
                  {item.locationFound}
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
                    Verified campus report
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
                    Posted {formatRelativeTime(item.createdAt)}
                  </span>
                </div>

                <div className="mt-auto flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar src={item.reportedBy?.profilePicture} name={item.reportedBy?.name} className="h-10 w-10 text-sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{item.reportedBy?.name}</p>
                      <p className="truncate text-[10px] uppercase tracking-[0.24em] text-gray-500">{item.reportedBy?.department}</p>
                    </div>
                  </div>
                  <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
                  {item.reportedBy?._id === myId && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => toggleResolved(item)}
                      className="min-h-[44px] w-full rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-emerald-500/20 sm:w-auto"
                    >
                      {item.status === 'resolved' ? 'Reopen' : 'Mark Resolved'}
                    </Button>
                  )}
                  {item.reportedBy?._id && item.reportedBy._id !== myId && (
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={item.status === 'resolved'}
                      onClick={() => openChatForReporter(item.reportedBy, item.title)}
                      className="min-h-[44px] w-full rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                    >
                      <MessageSquareMore size={14} className="mr-2" />
                      {item.status === 'resolved' ? 'Resolved' : 'Message'}
                    </Button>
                  )}
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
