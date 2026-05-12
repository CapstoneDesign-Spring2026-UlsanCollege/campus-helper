"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  CalendarDays,
  Eye,
  Download,
  FileImage,
  FileText,
  Filter,
  Heart,
  Info,
  MessageSquareMore,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui/Avatar';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { fetchWithAuth, readApiError, uploadAsset } from '@/lib/client-api';
import { StudioHero } from '@/components/media/StudioHero';
import { useBodyScrollLock } from '@/lib/use-body-scroll-lock';

type NoteOwner = {
  _id: string;
  name: string;
  department?: string;
  profilePicture?: string;
};

type Note = {
  _id: string;
  title: string;
  department: string;
  fileUrl: string;
  fileName?: string;
  fileType?: string;
  thumbnailUrl?: string;
  createdAt: string;
  likes?: string[];
  uploadedBy?: NoteOwner;
};

function getFileLabel(fileType?: string, fileName?: string) {
  const lowerType = (fileType || '').toLowerCase();
  const lowerName = (fileName || '').toLowerCase();

  if (lowerType.startsWith('image/')) return 'Image note';
  if (lowerType.includes('pdf') || lowerName.endsWith('.pdf')) return 'PDF note';
  if (lowerName.endsWith('.doc') || lowerName.endsWith('.docx')) return 'Document';
  if (lowerName.endsWith('.ppt') || lowerName.endsWith('.pptx')) return 'Slides';
  return 'Study file';
}

function isImageAsset(fileType?: string) {
  return (fileType || '').toLowerCase().startsWith('image/');
}

function isPdfAsset(fileType?: string, fileName?: string) {
  const lowerType = (fileType || '').toLowerCase();
  const lowerName = (fileName || '').toLowerCase();
  return lowerType === 'application/pdf' || lowerName.endsWith('.pdf');
}

function getCardPreviewImage(note: Note) {
  if (note.thumbnailUrl) return note.thumbnailUrl;
  if (isImageAsset(note.fileType) && note.fileUrl) return note.fileUrl;
  return '/campus_bg.png';
}

function getDisplayFileName(note: Note) {
  return note.fileName?.trim() || `${note.title}.file`;
}

function getFileExtension(note: Note) {
  const fileName = getDisplayFileName(note);
  const extension = fileName.split('.').pop()?.trim();
  if (!extension || extension === fileName) return 'FILE';
  return extension.toUpperCase();
}

function SelectedNotePreview({ file }: { file: File }) {
  const objectUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  const isImage = file.type.startsWith('image/');

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/35 p-3">
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        {isImage ? (
          <img src={objectUrl} alt={file.name} className="h-full w-full object-cover" />
        ) : (
          <FileText className="h-7 w-7 text-brand-accent" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{file.name}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.24em] text-gray-500">{getFileLabel(file.type, file.name)}</p>
      </div>
    </div>
  );
}

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filterDept, setFilterDept] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [statusText, setStatusText] = useState('Ready to upload');
  const [storageMode, setStorageMode] = useState<'cloudinary' | 'local' | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [myId, setMyId] = useState('');
  const [pendingLikeId, setPendingLikeId] = useState<string | null>(null);
  const [pendingDownloadId, setPendingDownloadId] = useState<string | null>(null);
  const [previewNote, setPreviewNote] = useState<Note | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  useBodyScrollLock(Boolean(previewNote));

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const fetchNotes = useCallback(async () => {
    try {
      const url = filterDept ? `/api/notes?department=${encodeURIComponent(filterDept)}` : '/api/notes';
      const res = await fetchWithAuth(url);
      const data = await res.json().catch(() => []);
      if (Array.isArray(data)) setNotes(data);
    } catch {
      // ignore
    }
  }, [filterDept]);

  useEffect(() => {
    void fetchNotes();
    try {
      const stored = localStorage.getItem('user');
      if (stored) setMyId(String(JSON.parse(stored).id ?? ''));
    } catch {
      // ignore
    }
  }, [fetchNotes]);

  const openChatForUploader = (user: NoteOwner) => {
    if (!user?._id || user._id === myId) return;

    const params = new URLSearchParams({
      userId: user._id,
      name: user.name || 'Campus user',
      context: 'notes',
    });

    if (user.department) params.set('department', user.department);
    if (user.profilePicture) params.set('profilePicture', user.profilePicture);

    router.push(`/dashboard/chat?${params.toString()}`);
  };

  const toggleLike = async (noteId: string) => {
    if (!myId || pendingLikeId) return;

    const snapshot = notes;
    const currentNote = notes.find((note) => note._id === noteId);
    if (!currentNote) return;

    const currentLikes = Array.isArray(currentNote.likes) ? currentNote.likes : [];
    const liked = currentLikes.includes(myId);
    const nextLikes = liked
      ? currentLikes.filter((userId) => userId !== myId)
      : [...currentLikes, myId];

    setPendingLikeId(noteId);
    setNotes((current) =>
      current.map((note) =>
        note._id === noteId
          ? { ...note, likes: nextLikes }
          : note
      )
    );

    try {
      const res = await fetchWithAuth(`/api/notes/${noteId}/like`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, 'Failed to update like.'));
      }

      const data = await res.json().catch(() => null);
      if (data && Array.isArray(data.likes)) {
        setNotes((current) =>
          current.map((note) =>
            note._id === noteId
              ? { ...note, likes: data.likes }
              : note
          )
        );
      }
    } catch (error) {
      setNotes(snapshot);
      toast.error(error instanceof Error ? error.message : 'Failed to update like.');
    } finally {
      setPendingLikeId(null);
    }
  };

  const handleDownload = async (note: Note) => {
    if (pendingDownloadId) return;

    setPendingDownloadId(note._id);

    try {
      const frame = document.createElement('iframe');
      frame.style.display = 'none';
      frame.src = `/api/notes/${note._id}/download`;
      document.body.appendChild(frame);

      window.setTimeout(() => {
        frame.remove();
      }, 4000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download note.');
    } finally {
      window.setTimeout(() => {
        setPendingDownloadId((current) => (current === note._id ? null : current));
      }, 1200);
    }
  };

  useEffect(() => {
    if (!previewNote) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPreviewNote(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previewNote]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !department) return;

    setIsUploading(true);
    setStatusText('Preparing file');

    try {
      setStatusText('Uploading asset');
      const asset = await uploadAsset(file, 'ulsan_notes');
      setStorageMode(asset.storage || null);
      setStatusText('Saving note record');

      const res = await fetchWithAuth('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          department,
          fileUrl: asset.url,
          fileName: asset.fileName || file.name,
          fileType: asset.fileType || file.type,
          thumbnailUrl: asset.thumbnailUrl,
        }),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, 'Failed to save note.'));
      }

      const createdNote = (await res.json().catch(() => null)) as Note | null;
      setTitle('');
      setFile(null);
      setStorageMode(null);
      setStatusText('Completed');
      toast.success('Note uploaded successfully.');
      if (createdNote?._id) {
        setNotes((current) => [createdNote, ...current.filter((note) => note._id !== createdNote._id)]);
      } else {
        await fetchNotes();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload note.';
      if (message.toLowerCase().includes('session')) {
        setStatusText('Session expired');
      } else if (message.toLowerCase().includes('file uploaded') || message.toLowerCase().includes('saving the note')) {
        setStatusText('The file uploaded, but saving the note failed');
      } else if (message.toLowerCase().includes('upload')) {
        setStatusText('Could not upload the file');
      } else {
        setStatusText('Upload failed');
      }
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <StudioHero
        badge="Academic Media Bay"
        title="Campus Notes"
        description="Publish clean study files, image notes, and revision packs with a sharper, calmer student upload flow."
        icon={FileText}
        accentClassName="text-brand-indigo"
      />

      <Card className="overflow-hidden border-white/10 bg-black/45 p-0">
        <div className="p-6 lg:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-brand-indigo">Upload Console</p>
                <h3 className="mt-2 text-2xl font-bold text-white">Share a note that someone will actually want to open</h3>
              </div>
              <Sparkles className="hidden h-6 w-6 text-brand-indigo md:block" />
            </div>

            <form onSubmit={handleUpload} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                <Input
                  label="Title"
                  placeholder="Algorithms midterm summary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-gray-400">Department</label>
                  <select
                    className="min-h-[48px] w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-brand-indigo"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="Computer Science" className="bg-black text-white">Computer Science</option>
                    <option value="Business" className="bg-black text-white">Business</option>
                    <option value="Design" className="bg-black text-white">Design</option>
                    <option value="Engineering" className="bg-black text-white">Engineering</option>
                  </select>
                </div>
              </div>

              <div className="rounded-3xl border border-dashed border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Add an image, PDF, or study document</p>
                    <p className="mt-1 text-sm text-gray-400">PDF and image previews are supported. The file stays linked to your uploader profile.</p>
                  </div>
                  <input
                    type="file"
                    id="file_upload"
                    className="hidden"
                    accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <label
                    htmlFor="file_upload"
                    className="inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-brand-indigo/30 bg-brand-indigo/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-brand-indigo hover:bg-brand-indigo/15"
                  >
                    <UploadCloud size={18} />
                    Choose file
                  </label>
                </div>

                {file && (
                  <div className="mt-4">
                    <SelectedNotePreview file={file} />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/35 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className={`h-5 w-5 ${isUploading ? 'text-brand-accent' : 'text-brand-indigo'}`} />
                  <div>
                    <p className="text-sm font-semibold text-white">Upload status</p>
                    <p className="text-xs uppercase tracking-[0.24em] text-gray-500">{statusText}</p>
                    {process.env.NODE_ENV !== 'production' && storageMode && (
                      <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-brand-accent">
                        Storage: {storageMode}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  type="submit"
                  isLoading={isUploading}
                  disabled={!file || !title || !department}
                  className="w-full bg-brand-indigo text-black hover:bg-cyan-200 md:w-auto"
                >
                  Publish note
                </Button>
              </div>
            </form>
          </div>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-gray-400" />
            <p className="text-sm font-semibold text-white">Filter by department</p>
          </div>
          <select
            className="min-h-[44px] rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-indigo"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
          >
            <option value="" className="bg-black text-white">All Departments</option>
            <option value="Computer Science" className="bg-black text-white">Computer Science</option>
            <option value="Business" className="bg-black text-white">Business</option>
            <option value="Design" className="bg-black text-white">Design</option>
            <option value="Engineering" className="bg-black text-white">Engineering</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {notes.length === 0 ? (
            <Card className="col-span-full border-white/10 bg-black/35 py-12 text-center">
              <FileText size={48} className="mx-auto mb-4 text-brand-indigo/50" />
              <p className="text-lg font-semibold text-white">No notes yet in this view</p>
              <p className="mt-2 text-sm text-gray-400">Upload the first study file and it will appear here immediately.</p>
            </Card>
          ) : (
            notes.map((note, index) => {
              const label = getFileLabel(note.fileType, note.fileName);
              const previewImage = getCardPreviewImage(note);
              const hasPreview = Boolean(previewImage);
              const likeCount = note.likes?.length || 0;
              const isLiked = Boolean(myId && note.likes?.includes(myId));
              const isLikePending = pendingLikeId === note._id;
              const isDownloadPending = pendingDownloadId === note._id;
              const fileName = getDisplayFileName(note);

              return (
                <motion.div
                  key={note._id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="flex h-full flex-col overflow-hidden border-white/10 bg-black/55 p-0">
                    <div className="relative border-b border-white/10">
                      <div className="flex aspect-[16/10] items-center justify-center overflow-hidden bg-[linear-gradient(180deg,rgba(18,30,40,0.95),rgba(7,10,20,1))]">
                        {hasPreview ? (
                          <>
                            <img
                              src={previewImage}
                              alt={note.title}
                              className={`h-full w-full object-cover ${!isImageAsset(note.fileType) ? 'scale-110 blur-xl opacity-40' : ''}`}
                              />
                            {!isImageAsset(note.fileType) && (
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(3,7,18,0.55)_55%,rgba(3,7,18,0.88)_100%)]" />
                            )}
                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#050812] via-[#050812]/65 to-transparent" />
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-3 text-center">
                            {isImageAsset(note.fileType) ? (
                              <FileImage className="h-10 w-10 text-brand-indigo" />
                            ) : (
                              <FileText className="h-10 w-10 text-brand-accent" />
                            )}
                            <p className="text-[10px] uppercase tracking-[0.28em] text-gray-500">{label}</p>
                          </div>
                        )}
                      </div>
                      <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-white">
                        {note.department}
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewNote(note)}
                        className="absolute bottom-4 right-4 inline-flex items-center rounded-full border border-white/10 bg-black/65 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-white transition hover:bg-white/10"
                      >
                        <Eye size={12} className="mr-1.5" />
                        Preview
                      </button>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand-indigo">{label}</p>
                          <h3 className="mt-2 text-xl font-bold leading-tight text-white">{note.title}</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => void toggleLike(note._id)}
                          disabled={isLikePending || !myId}
                          aria-label={isLiked ? 'Unlike note' : 'Like note'}
                          className={`rounded-full border px-3 py-2 transition ${
                            isLiked
                              ? 'border-red-400/30 bg-red-500/15 text-red-300'
                              : 'border-white/10 bg-black/25 text-gray-500 hover:text-red-300'
                          } ${isLikePending ? 'opacity-70' : ''}`}
                        >
                          <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                        </button>
                      </div>

                      <p className="text-xs uppercase tracking-[0.24em] text-gray-500">
                        Uploaded {new Date(note.createdAt).toLocaleDateString()}
                      </p>

                      <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-gray-500">File name</p>
                        <p className="mt-1 truncate text-sm font-medium text-white/90">{fileName}</p>
                      </div>

                      {note.uploadedBy && (
                        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                          <Avatar src={note.uploadedBy.profilePicture} name={note.uploadedBy.name} className="h-10 w-10 text-sm" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white">{note.uploadedBy.name}</p>
                            <p className="truncate text-[10px] uppercase tracking-[0.24em] text-gray-500">
                              {note.uploadedBy.department || note.department}
                            </p>
                          </div>
                          {note.uploadedBy._id !== myId && (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => openChatForUploader(note.uploadedBy!)}
                              className="h-10 shrink-0 rounded-xl border border-white/10 bg-black/30 px-3 text-[10px] uppercase tracking-[0.24em] text-white hover:bg-brand-indigo/20"
                            >
                              <MessageSquareMore size={14} className="mr-2" />
                              Message
                            </Button>
                          )}
                        </div>
                      )}

                      <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="button"
                          onClick={() => void toggleLike(note._id)}
                          disabled={isLikePending || !myId}
                          className={`inline-flex items-center rounded-xl border px-3 py-2 text-xs transition ${
                            isLiked
                              ? 'border-red-400/30 bg-red-500/10 text-red-200'
                              : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                          } ${isLikePending ? 'opacity-70' : ''}`}
                        >
                          <Heart size={12} className={`mr-2 ${isLiked ? 'fill-current' : ''}`} />
                          {likeCount}
                        </button>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setPreviewNote(note)}
                            className="h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white hover:bg-white/10"
                          >
                            <Eye size={14} className="mr-2" />
                            Preview
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            isLoading={isDownloadPending}
                            onClick={() => void handleDownload(note)}
                            className="h-10 rounded-xl border border-brand-indigo/20 bg-brand-indigo/10 px-4 text-sm text-white hover:bg-brand-indigo/15"
                          >
                              <Download size={14} className="mr-2" />
                              Download note
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {hasMounted && previewNote
        ? createPortal(
            <div
              className="fixed inset-0 z-[120] flex items-center justify-center bg-black/82 p-4 backdrop-blur-md"
              onClick={() => setPreviewNote(null)}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,233,208,0.12),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(255,188,92,0.08),transparent_28%)]" />
              <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[#050812] shadow-2xl shadow-black/60">
                <div
                  className="relative flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 md:px-6"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="status-pill border-brand-indigo/15 bg-brand-indigo/10 text-brand-indigo">
                        {getFileLabel(previewNote.fileType, previewNote.fileName)}
                      </span>
                      <span className="status-pill border-white/10 bg-white/[0.03] text-slate-400">
                        {getFileExtension(previewNote)}
                      </span>
                    </div>
                    <h3 className="truncate text-lg font-semibold text-white md:text-xl">{previewNote.title}</h3>
                    <p className="mt-1 truncate text-xs uppercase tracking-[0.22em] text-gray-500">
                      {getDisplayFileName(previewNote)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewNote(null)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                      aria-label="Close preview"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div
                  className="min-h-[55vh] flex-1 bg-black"
                  onClick={(event) => event.stopPropagation()}
                >
                  {isImageAsset(previewNote.fileType) ? (
                    <img
                      src={`/api/notes/${previewNote._id}/view`}
                      alt={previewNote.title}
                      className="h-full max-h-[75vh] w-full object-contain"
                    />
                  ) : isPdfAsset(previewNote.fileType, previewNote.fileName) ? (
                    <iframe
                      src={`/api/notes/${previewNote._id}/view`}
                      title={previewNote.title}
                      className="h-[75vh] w-full border-0"
                    />
                  ) : (
                    <div className="grid h-full min-h-[55vh] grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_320px]">
                      <div className="relative overflow-hidden border-b border-white/10 lg:border-b-0 lg:border-r">
                        <img
                          src={getCardPreviewImage(previewNote)}
                          alt={previewNote.title}
                          className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl opacity-35"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,18,0.62),rgba(4,8,18,0.9))]" />
                        <div className="relative z-10 flex h-full min-h-[320px] flex-col items-center justify-center px-6 py-10 text-center">
                          <div className="mb-5 rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                            <FileText className="h-14 w-14 text-brand-accent" />
                          </div>
                          <p className="max-w-lg text-xl font-semibold text-white">
                            This file opens best as a reference card, then downloads as the original document.
                          </p>
                          <p className="mt-3 max-w-xl text-sm leading-7 text-gray-300">
                            We can show the note identity, uploader, format, and upload date here even when the browser cannot render the document inline.
                          </p>
                          <p className="mt-5 text-[11px] uppercase tracking-[0.26em] text-slate-500">
                            Preview unavailable in browser
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 bg-[linear-gradient(180deg,rgba(8,12,20,0.96),rgba(6,10,18,0.98))] p-5 md:p-6">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                          <div className="flex items-start gap-3">
                            <Info className="mt-0.5 h-4 w-4 text-brand-accent" />
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-[0.28em] text-gray-500">File name</p>
                              <p className="mt-1 truncate text-sm font-semibold text-white">{getDisplayFileName(previewNote)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left">
                            <div className="flex items-start gap-3">
                              <CalendarDays className="mt-0.5 h-4 w-4 text-brand-indigo" />
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.28em] text-gray-500">Uploaded</p>
                                <p className="mt-1 text-sm font-semibold text-white">
                                  {new Date(previewNote.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left">
                            <div className="flex items-start gap-3">
                              <FileText className="mt-0.5 h-4 w-4 text-brand-accent" />
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.28em] text-gray-500">Format</p>
                                <p className="mt-1 text-sm font-semibold text-white">{getFileLabel(previewNote.fileType, previewNote.fileName)}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {previewNote.uploadedBy && (
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                            <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-gray-500">Uploaded by</p>
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={previewNote.uploadedBy.profilePicture}
                                name={previewNote.uploadedBy.name}
                                className="h-11 w-11 text-sm"
                              />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white">{previewNote.uploadedBy.name}</p>
                                <p className="truncate text-xs uppercase tracking-[0.18em] text-slate-500">
                                  {previewNote.uploadedBy.department || previewNote.department}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-auto pt-2">
                          <Button
                            type="button"
                            variant="glass"
                            onClick={() => void handleDownload(previewNote)}
                            className="h-11 w-full rounded-2xl border-brand-indigo/20 bg-brand-indigo/10 text-white hover:bg-brand-indigo/15"
                          >
                            <Download size={15} className="mr-2" />
                            Download original note
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
