"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Camera,
  Edit2,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash,
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

type MarketSeller = {
  _id: string;
  name: string;
  department?: string;
  profilePicture?: string;
};

type MarketItem = {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageUrls: string[];
  sellerId: MarketSeller;
  status?: 'available' | 'sold';
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

export default function MarketPage() {
  const router = useRouter();
  const [items, setItems] = useState<MarketItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'available' | 'sold' | 'all'>('available');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-low' | 'price-high'>('newest');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [statusText, setStatusText] = useState('Ready to publish');
  const [myId, setMyId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('query', searchQuery.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/market${params.toString() ? `?${params.toString()}` : ''}`);
      if (res.ok) setItems(await res.json());
    } catch {
      // ignore
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    void fetchItems();
    const stored = localStorage.getItem('user');
    if (stored) setMyId(JSON.parse(stored).id);
  }, [fetchItems]);

  useEffect(() => {
    const openComposer = () => setIsComposerOpen(true);
    const pendingComposer = sessionStorage.getItem('campus:open-composer');

    if (pendingComposer === '/dashboard/market' || window.location.search.includes('compose=1')) {
      setIsComposerOpen(true);
      sessionStorage.removeItem('campus:open-composer');
    }

    window.addEventListener('campus:open-composer', openComposer);
    return () => window.removeEventListener('campus:open-composer', openComposer);
  }, []);

  const sortedItems = useMemo(() => {
    const copy = [...items];
    copy.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });
    return copy;
  }, [items, sortBy]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      const res = await fetchWithAuth(`/api/market?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Listing removed.');
        void fetchItems();
      } else {
        toast.error(await readApiError(res, 'Failed to delete item.'));
      }
    } catch {
      toast.error('Network error while deleting listing.');
    }
  };

  const prepareEdit = (item: MarketItem) => {
    setEditingId(item._id);
    setIsComposerOpen(true);
    setTitle(item.title);
    setDescription(item.description);
    setPrice(item.price.toString());
    setStatusText('Editing active listing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsComposerOpen(false);
    setTitle('');
    setDescription('');
    setPrice('');
    setFiles([]);
    setStatusText('Ready to publish');
  };

  const openChatForSellerAboutItem = (seller: MarketSeller, itemTitle: string) => {
    if (!seller?._id || seller._id === myId) return;

    const params = new URLSearchParams({
      userId: seller._id,
      name: seller.name || 'Campus user',
      context: 'market',
      draft: `Hi, I'm interested in "${itemTitle}". Is it still available?`,
    });

    if (seller.department) params.set('department', seller.department);
    if (seller.profilePicture) params.set('profilePicture', seller.profilePicture);

    router.push(`/dashboard/chat?${params.toString()}`);
  };

  const shouldOfferPhotoFallback = (message: string) => {
    const normalized = message.toLowerCase();
    return (
      normalized.includes('upload') ||
      normalized.includes('network') ||
      normalized.includes('configured') ||
      normalized.includes('cloudinary') ||
      normalized.includes('500') ||
      normalized.includes('503')
    );
  };

  const handleAIPolishListing = async () => {
    if (isAiDrafting) return;

    if (!title.trim() && !description.trim()) {
      toast.error('Add an item name or rough details first.');
      return;
    }

    setIsAiDrafting(true);
    setStatusText('AI is polishing the listing');

    try {
      const res = await fetchWithAuth('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'marketplace',
          payload: { title, description, price },
        }),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, 'AI could not polish this listing.'));
      }

      const data = await res.json().catch(() => null) as { title?: string; description?: string } | null;
      if (data?.title) setTitle(data.title);
      if (data?.description) setDescription(data.description);

      setStatusText('AI draft ready');
      toast.success('AI polished your listing.');
    } catch (error) {
      setStatusText('AI assist failed');
      toast.error(error instanceof Error ? error.message : 'AI could not polish this listing.');
    } finally {
      setIsAiDrafting(false);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !description) return;
    setIsPosting(true);

    try {
      let imageUrls: string[] = [];

      if (!editingId && files.length > 0) {
        setStatusText('Uploading listing photos');
        try {
          for (const file of files) {
            const asset = await uploadAsset(file, 'ulsan_marketplace');
            imageUrls.push(asset.url);
          }
        } catch (uploadError) {
          const uploadMessage =
            uploadError instanceof Error ? uploadError.message : 'Photo upload failed.';

          if (!shouldOfferPhotoFallback(uploadMessage)) {
            throw uploadError;
          }

          const continueWithoutImages = window.confirm(
            `${uploadMessage}\n\nWould you like to publish this listing without photos instead?`
          );

          if (!continueWithoutImages) {
            throw uploadError;
          }

          imageUrls = [];
          setStatusText('Publishing listing without photos');
          toast('Photos were skipped. Publishing listing without images.', {
            icon: 'ℹ️',
          });
        }
      }

      setStatusText(editingId ? 'Saving listing changes' : 'Publishing listing to the marketplace');

      const res = await fetchWithAuth('/api/market', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editingId
            ? {
                _id: editingId,
                title,
                description,
                price: Number(price),
                status: items.find((item) => item._id === editingId)?.status || 'available',
              }
            : { title, description, price: Number(price), imageUrls }
        ),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, 'Failed to publish listing.'));
      }

      toast.success(editingId ? 'Listing updated.' : 'Listing published successfully.');
      cancelEdit();
      await fetchItems();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Network error.';
      setStatusText('Publish failed');
      toast.error(message);
    } finally {
      setIsPosting(false);
    }
  };

  const toggleMarketStatus = async (item: MarketItem) => {
    const nextStatus = item.status === 'sold' ? 'available' : 'sold';
    try {
      const res = await fetchWithAuth('/api/market', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: item._id,
          title: item.title,
          description: item.description,
          price: item.price,
          status: nextStatus,
        }),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, 'Could not update listing status.'));
      }

      toast.success(nextStatus === 'sold' ? 'Listing marked as sold.' : 'Listing marked as available.');
      await fetchItems();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update listing status.');
    }
  };

  return (
    <div className="responsive-page space-y-6 md:space-y-8">
      <StudioHero
        badge="Campus Trade Deck"
        title="Marketplace"
        description="List books, gadgets, and everyday student gear with clearer status, stronger identity cues, and faster follow-up chat."
        icon={ShoppingBag}
        accentClassName="text-brand-purple"
      />

      <div className="sticky-action-band -mt-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-brand-purple">Create</p>
          <p className="mt-1 text-xs text-slate-400">Start a new campus listing when you are ready.</p>
        </div>
        {!isComposerOpen && !editingId ? (
          <Button
            type="button"
            onClick={() => setIsComposerOpen(true)}
            className="min-h-[46px] min-w-[150px] sm:min-w-[170px]"
          >
            <Plus size={18} className="mr-2" />
            Add listing
          </Button>
        ) : null}
      </div>

      {(isComposerOpen || editingId) ? (
      <Card className={`overflow-hidden border-white/10 p-0 ${editingId ? 'bg-brand-purple/10' : 'bg-black/45'}`}>
        <div className="p-4 sm:p-5 lg:p-7">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-brand-purple">
                  {editingId ? 'Listing Edit Console' : 'Sell Something Well'}
                </p>
                <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                  {editingId ? 'Refine your active listing' : 'Build a campus listing that looks trustworthy'}
                </h3>
              </div>
              {editingId && (
                <Button onClick={cancelEdit} variant="ghost" className="h-11 rounded-xl border border-red-400/20 px-3 text-red-300 hover:bg-red-500/15">
                  <X size={16} className="mr-2" />
                  Cancel edit
                </Button>
              )}
              {!editingId && isComposerOpen && (
                <Button onClick={cancelEdit} variant="ghost" className="h-11 rounded-xl border border-red-400/20 px-3 text-red-300 hover:bg-red-500/15">
                  <X size={16} className="mr-2" />
                  Close
                </Button>
              )}
            </div>

            <form onSubmit={handlePost} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
                <Input
                  label="Item Name"
                  placeholder="Algorithm textbook, iPad keyboard, dorm lamp"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <Input
                  label="Price (KRW / USD)"
                  type="number"
                  icon={Tag}
                  placeholder="50.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min={0}
                />
              </div>

              <div>
                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <label className="block text-xs font-bold uppercase tracking-[0.24em] text-gray-400">Description</label>
                  <Button
                    type="button"
                    variant="ghost"
                    isLoading={isAiDrafting}
                    onClick={() => void handleAIPolishListing()}
                    className="min-h-[40px] rounded-xl border border-brand-purple/25 bg-brand-purple/10 px-3 text-[10px] uppercase tracking-[0.22em] text-white hover:bg-brand-purple/15"
                  >
                    <Sparkles size={14} className="mr-2" />
                    AI polish
                  </Button>
                </div>
                <textarea
                  className="focus-ring min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-base text-white outline-none transition focus:border-brand-purple md:text-sm"
                  placeholder="Condition, edition, what's included, and where you can meet."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {!editingId && (
                <div className="rounded-3xl border border-dashed border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 sm:p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">Add listing photos</p>
                      <p className="mt-1 text-sm text-gray-400">Multiple images are supported now, and they will render as a gallery in the card.</p>
                    </div>
                    <input
                      type="file"
                      id="assets"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setFiles(Array.from(e.target.files || []))}
                    />
                    <label
                      htmlFor="assets"
                      className="inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-brand-purple/30 bg-brand-purple/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-brand-purple hover:bg-brand-purple/15"
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
              )}

              <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/35 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className={`h-5 w-5 ${isPosting ? 'text-brand-accent' : 'text-brand-purple'}`} />
                  <div>
                    <p className="text-sm font-semibold text-white">Publish status</p>
                    <p className="text-xs uppercase tracking-[0.24em] text-gray-500">{statusText}</p>
                  </div>
                </div>
                <Button type="submit" isLoading={isPosting} className="w-full bg-brand-purple text-white hover:bg-violet-400 md:w-auto">
                  {editingId ? 'Save listing' : 'Publish listing'}
                </Button>
              </div>
            </form>
          </div>
      </Card>
      ) : null}

      <Card className="border-white/10 bg-black/45 p-4 lg:p-5">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.7fr]">
          <Input
            label="Search listings"
            icon={Search}
            placeholder="Search books, electronics, dorm items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-gray-400">Status filter</label>
            <div className="flex gap-2 rounded-2xl border border-white/10 bg-black/35 p-1">
              {(['available', 'sold', 'all'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={`flex-1 rounded-xl px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] transition ${
                    statusFilter === value ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {value === 'all' ? 'All' : value}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-gray-400">Sort by</label>
            <select
              className="focus-ring min-h-[48px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition focus:border-brand-purple md:text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            >
              <option value="newest" className="bg-black text-white">Newest first</option>
              <option value="oldest" className="bg-black text-white">Oldest first</option>
              <option value="price-low" className="bg-black text-white">Lowest price</option>
              <option value="price-high" className="bg-black text-white">Highest price</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sortedItems.length === 0 ? (
          <Card className="col-span-full border-white/10 bg-black/35 py-12 text-center">
            <ShoppingBag size={48} className="mx-auto mb-4 text-brand-purple/50" />
            <p className="text-lg font-semibold text-white">No marketplace listings found</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">Try another search/filter or publish the first listing for this view.</p>
          </Card>
        ) : sortedItems.map((item, i) => {
          const isOwner = item.sellerId?._id === myId;

          return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={item._id}>
              <Card className={`flex h-full flex-col overflow-hidden border-white/10 bg-black/60 p-0 ${isOwner ? 'ring-1 ring-brand-purple/20' : ''} ${item.status === 'sold' ? 'opacity-80' : ''}`}>
                <div className="relative p-3 pb-0 sm:p-4 sm:pb-0">
                  {isOwner && (
                    <div className="absolute left-6 top-6 z-20 flex flex-wrap gap-2 sm:left-7 sm:top-7">
                      <button
                        type="button"
                        onClick={() => prepareEdit(item)}
                        className="rounded-full border border-white/10 bg-black/80 p-2 text-brand-purple transition hover:bg-brand-purple hover:text-white"
                        title="Edit Listing"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        className="rounded-full border border-white/10 bg-black/80 p-2 text-red-400 transition hover:bg-red-500 hover:text-white"
                        title="Delete Listing"
                      >
                        <Trash size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleMarketStatus(item)}
                        className={`rounded-full border border-white/10 bg-black/80 p-2 transition ${
                          item.status === 'sold'
                            ? 'text-emerald-300 hover:bg-emerald-500 hover:text-white'
                            : 'text-amber-300 hover:bg-amber-500 hover:text-black'
                        }`}
                        title={item.status === 'sold' ? 'Mark Available' : 'Mark Sold'}
                      >
                        <ShoppingBag size={14} />
                      </button>
                    </div>
                  )}

                  <MediaGallery
                    images={item.imageUrls}
                    alt={item.title}
                    icon={Camera}
                    accentClassName="text-brand-purple"
                  />

                  <div className="pointer-events-none absolute right-6 top-6 max-w-[45%] truncate rounded-2xl border border-white/10 bg-black/75 px-3 py-1 text-sm font-black text-brand-purple backdrop-blur-md sm:right-7 sm:top-7 sm:text-base">
                    ${item.price}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand-purple">
                        {isOwner ? 'Your listing' : 'Campus seller'}
                      </p>
                      <h4 className="mt-2 text-xl font-bold leading-tight text-white">{item.title}</h4>
                    </div>
                    <div className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] ${
                      item.status === 'sold' ? 'bg-amber-500/15 text-amber-200' : 'bg-emerald-500/15 text-emerald-200'
                    }`}>
                      {item.status || 'available'}
                    </div>
                  </div>

                  <p className="text-sm leading-6 text-gray-400">{item.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.22em] text-slate-500">
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
                      Verified campus identity
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
                      Posted {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>

                  <div className="mt-auto flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar src={item.sellerId?.profilePicture} name={isOwner ? 'You' : item.sellerId?.name} className="h-10 w-10 text-sm" />
                      <div className="min-w-0">
                        <p className={`truncate text-sm font-semibold ${isOwner ? 'text-brand-purple' : 'text-brand-accent'}`}>
                          {isOwner ? 'You (Owner)' : item.sellerId?.name}
                        </p>
                        <p className="truncate text-[10px] uppercase tracking-[0.24em] text-gray-500">{item.sellerId?.department}</p>
                      </div>
                    </div>
                    {!isOwner && (
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={item.status === 'sold'}
                        onClick={() => openChatForSellerAboutItem(item.sellerId, item.title)}
                        className="min-h-[44px] w-full rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-brand-purple/20 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                      >
                        {item.status === 'sold' ? 'Sold' : 'Message'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
