"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Camera,
  Edit2,
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
  status?: string;
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

export default function MarketPage() {
  const router = useRouter();
  const [items, setItems] = useState<MarketItem[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [statusText, setStatusText] = useState('Ready to publish');
  const [myId, setMyId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/market');
      if (res.ok) setItems(await res.json());
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void fetchItems();
    const stored = localStorage.getItem('user');
    if (stored) setMyId(JSON.parse(stored).id);
  }, [fetchItems]);

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
    setTitle(item.title);
    setDescription(item.description);
    setPrice(item.price.toString());
    setStatusText('Editing active listing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setFiles([]);
    setStatusText('Ready to publish');
  };

  const openChatForSeller = (seller: MarketSeller) => {
    if (!seller?._id || seller._id === myId) return;

    const params = new URLSearchParams({
      userId: seller._id,
      name: seller.name || 'Campus user',
      context: 'market',
    });

    if (seller.department) params.set('department', seller.department);
    if (seller.profilePicture) params.set('profilePicture', seller.profilePicture);

    router.push(`/dashboard/chat?${params.toString()}`);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !description) return;
    setIsPosting(true);

    try {
      const imageUrls: string[] = [];

      if (!editingId && files.length > 0) {
        setStatusText('Uploading listing photos');
        for (const file of files) {
          const asset = await uploadAsset(file, 'ulsan_marketplace');
          imageUrls.push(asset.url);
        }
      }

      setStatusText(editingId ? 'Saving listing changes' : 'Publishing listing to the marketplace');

      const res = await fetchWithAuth('/api/market', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editingId
            ? { _id: editingId, title, description, price: Number(price) }
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

  return (
    <div className="space-y-8 pb-12">
      <StudioHero
        badge="Campus Trade Deck"
        title="Marketplace"
        description="List books, gadgets, and everyday student gear with stronger photo previews, cleaner posting feedback, and faster follow-up chat."
        icon={ShoppingBag}
        accentClassName="text-brand-purple"
      />

      <Card className={`overflow-hidden border-white/10 p-0 ${editingId ? 'bg-brand-purple/10' : 'bg-black/45'}`}>
        <div className="p-6 lg:p-7">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-brand-purple">
                  {editingId ? 'Listing Edit Console' : 'Sell Something Well'}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-white">
                  {editingId ? 'Refine your active listing' : 'Build a campus listing that looks trustworthy'}
                </h3>
              </div>
              {editingId && (
                <Button onClick={cancelEdit} variant="ghost" className="h-11 rounded-xl border border-red-400/20 px-3 text-red-300 hover:bg-red-500/15">
                  <X size={16} className="mr-2" />
                  Cancel edit
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
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-gray-400">Description</label>
                <textarea
                  className="min-h-[120px] w-full rounded-lg border border-white/10 bg-white/5 p-4 text-white outline-none transition focus:border-brand-purple"
                  placeholder="Condition, edition, what's included, and where you can meet."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {!editingId && (
                <div className="rounded-3xl border border-dashed border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5">
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, i) => {
          const isOwner = item.sellerId?._id === myId;

          return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={item._id}>
              <Card className={`flex h-full flex-col overflow-hidden border-white/10 bg-black/60 p-0 ${isOwner ? 'ring-1 ring-brand-purple/20' : ''}`}>
                <div className="relative p-4 pb-0">
                  {isOwner && (
                    <div className="absolute left-7 top-7 z-20 flex gap-2">
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
                    </div>
                  )}

                  <MediaGallery
                    images={item.imageUrls}
                    alt={item.title}
                    icon={Camera}
                    accentClassName="text-brand-purple"
                  />

                  <div className="pointer-events-none absolute right-7 top-7 rounded-2xl border border-white/10 bg-black/75 px-3 py-1 text-base font-black text-brand-purple backdrop-blur-md">
                    ${item.price}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand-purple">
                        {isOwner ? 'Your listing' : 'Campus seller'}
                      </p>
                      <h4 className="mt-2 text-xl font-bold leading-tight text-white">{item.title}</h4>
                    </div>
                  </div>

                  <p className="text-sm leading-6 text-gray-400">{item.description}</p>

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
                        onClick={() => openChatForSeller(item.sellerId)}
                        className="h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold uppercase tracking-[0.24em] text-white hover:bg-brand-purple/20"
                      >
                        Message
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
