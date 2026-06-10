"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  Clipboard,
  Plus,
  Eye,
  Download,
  FileImage,
  FileText,
  Heart,
  Info,
  MessageSquareMore,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
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
  likeCount?: number;
  isSaved?: boolean;
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

function getDownloadFileName(disposition: string | null, fallback: string) {
  if (!disposition) return fallback;

  const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1]);
    } catch {
      return utfMatch[1];
    }
  }

  const asciiMatch = disposition.match(/filename="([^"]+)"/i);
  return asciiMatch?.[1] || fallback;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'title' | 'oldest'>('newest');
  const [savedOnly, setSavedOnly] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusText, setStatusText] = useState('Ready to upload');
  const [storageMode, setStorageMode] = useState<'cloudinary' | 'local' | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [myId, setMyId] = useState('');
  const [pendingLikeId, setPendingLikeId] = useState<string | null>(null);
  const [pendingSaveId, setPendingSaveId] = useState<string | null>(null);
  const [pendingDownloadId, setPendingDownloadId] = useState<string | null>(null);
  const [pendingCopyId, setPendingCopyId] = useState<string | null>(null);
  const [copyDialog, setCopyDialog] = useState<{ title: string; message: string; noteTitle?: string } | null>(null);
  const [downloadFallback, setDownloadFallback] = useState<{ noteId: string; url: string; fileName: string } | null>(null);
  const [previewNote, setPreviewNote] = useState<Note | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isPdfPreviewLoading, setIsPdfPreviewLoading] = useState(false);
  const [pdfPreviewError, setPdfPreviewError] = useState('');
  const [hasMounted, setHasMounted] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  useBodyScrollLock(Boolean(previewNote));

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const openComposer = () => setIsComposerOpen(true);
    const pendingComposer = sessionStorage.getItem('campus:open-composer');

    if (pendingComposer === '/dashboard/notes' || window.location.search.includes('compose=1')) {
      setIsComposerOpen(true);
      sessionStorage.removeItem('campus:open-composer');
    }

    window.addEventListener('campus:open-composer', openComposer);
    return () => window.removeEventListener('campus:open-composer', openComposer);
  }, []);

  const fetchNotes = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterDept) params.set('department', filterDept);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (sortBy) params.set('sort', sortBy);
      if (savedOnly) params.set('saved', 'true');
      const url = params.size > 0 ? `/api/notes?${params.toString()}` : '/api/notes';
      const res = await fetchWithAuth(url);
      const data = await res.json().catch(() => []);
      if (Array.isArray(data)) setNotes(data);
    } catch {
      // ignore
    }
  }, [filterDept, searchQuery, sortBy, savedOnly]);

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
              ? { ...note, likes: data.likes, likeCount: data.likeCount }
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

  const toggleSave = async (noteId: string) => {
    if (!myId || pendingSaveId) return;

    const snapshot = notes;
    const currentNote = notes.find((note) => note._id === noteId);
    if (!currentNote) return;

    setPendingSaveId(noteId);
    setNotes((current) =>
      current.map((note) =>
        note._id === noteId
          ? { ...note, isSaved: !note.isSaved }
          : note
      )
    );

    try {
      const res = await fetchWithAuth(`/api/notes/${noteId}/save`, { method: 'POST' });
      if (!res.ok) {
        throw new Error(await readApiError(res, 'Failed to update saved note.'));
      }

      const data = await res.json().catch(() => null);
      if (data && typeof data.saved === 'boolean') {
        setNotes((current) =>
          current
            .map((note) =>
              note._id === noteId
                ? { ...note, isSaved: data.saved }
                : note
            )
            .filter((note) => !savedOnly || note.isSaved)
        );
      }
    } catch (error) {
      setNotes(snapshot);
      toast.error(error instanceof Error ? error.message : 'Failed to update saved note.');
    } finally {
      setPendingSaveId(null);
    }
  };

  const handleDownload = async (note: Note) => {
    if (pendingDownloadId) return;

    setPendingDownloadId(note._id);
    setDownloadFallback(null);

    try {
      const res = await fetchWithAuth(`/api/notes/${note._id}/download`);
      if (!res.ok) {
        throw new Error(await readApiError(res, 'Failed to download note.'));
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = getDownloadFileName(res.headers.get('content-disposition'), getDisplayFileName(note));
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1200);
      toast.success('Download started.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to download note.';
      if (/^https?:\/\//i.test(note.fileUrl)) {
        setDownloadFallback({
          noteId: note._id,
          url: note.fileUrl,
          fileName: getDisplayFileName(note),
        });
        toast.error(`${message} A direct file link is now shown on the note card.`);
      } else {
        toast.error(message);
      }
    } finally {
      window.setTimeout(() => {
        setPendingDownloadId((current) => (current === note._id ? null : current));
      }, 1200);
    }
  };

  const handleCopyNoteText = async (note: Note) => {
    if (pendingCopyId) return;
    setPendingCopyId(note._id);

    try {
      const res = await fetchWithAuth(`/api/notes/${note._id}/text`);
      let text = '';
      const openNothingToCopyDialog = (message?: string) => {
        setCopyDialog({
          title: 'Nothing to copy',
          message:
            message ||
            'This note does not contain readable text that can be copied yet. You can still preview or download the original file.',
          noteTitle: note.title,
        });
      };

      if (res.ok) {
        const data = await res.json().catch(() => null) as { text?: string } | null;
        text = data?.text?.trim() || '';
      } else {
        const data = await res.json().catch(() => null) as { code?: string; error?: string } | null;
        const message = data?.error?.trim() || 'Could not copy note content.';
        if (res.status === 422 || data?.code === 'nothing_to_copy') {
          openNothingToCopyDialog();
          return;
        }
        throw new Error(message);
      }

      if (!text) {
        openNothingToCopyDialog();
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', 'true');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }

      toast.success('Copied to clipboard.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not copy note content.';
      const lowerMessage = message.toLowerCase();

      if (
        lowerMessage.includes('no selectable text') ||
        lowerMessage.includes('no copyable text') ||
        lowerMessage.includes('no readable text')
      ) {
        setCopyDialog({
          title: 'Nothing to copy',
          message: 'This note does not contain readable text that can be copied yet. You can still preview or download the original file.',
          noteTitle: note.title,
        });
      } else {
        toast.error(message);
      }
    } finally {
      setPendingCopyId(null);
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

  useEffect(() => {
    if (!previewNote || !isPdfAsset(previewNote.fileType, previewNote.fileName)) {
      setPdfPreviewError('');
      setIsPdfPreviewLoading(false);
      setPdfPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
      return;
    }

    let isCancelled = false;
    let objectUrl: string | null = null;

    const loadPdfPreview = async () => {
      setIsPdfPreviewLoading(true);
      setPdfPreviewError('');

      try {
        const res = await fetchWithAuth(`/api/notes/${previewNote._id}/view`);
        if (!res.ok) {
          throw new Error(await readApiError(res, 'Unable to load PDF preview.'));
        }

        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);

        if (!isCancelled) {
          setPdfPreviewUrl((current) => {
            if (current) URL.revokeObjectURL(current);
            return objectUrl;
          });
        }
      } catch (error) {
        if (!isCancelled) {
          setPdfPreviewError(error instanceof Error ? error.message : 'Unable to load PDF preview.');
          setPdfPreviewUrl((current) => {
            if (current) URL.revokeObjectURL(current);
            return null;
          });
        }
      } finally {
        if (!isCancelled) {
          setIsPdfPreviewLoading(false);
        }
      }
    };

    void loadPdfPreview();

    return () => {
      isCancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
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
      setIsComposerOpen(false);
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
    <div className="responsive-page space-y-6 md:space-y-8">
      <StudioHero
        badge="Academic Media Bay"
        title="Campus Notes"
        description="Publish clean study files, image notes, and revision packs with a sharper, calmer student upload flow."
        icon={FileText}
        accentClassName="text-brand-indigo"
      />

      <div className="sticky-action-band -mt-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-brand-indigo">Upload</p>
          <p className="mt-1 text-xs text-slate-400">Share a new note, PDF, or study image with the library.</p>
        </div>
        {!isComposerOpen ? (
          <Button type="button" onClick={() => setIsComposerOpen(true)} className="min-h-[46px] min-w-[150px] sm:min-w-[170px]">
            <Plus size={18} className="mr-2" />
            Add note
          </Button>
        ) : null}
      </div>

      {isComposerOpen ? (
      <Card className="overflow-hidden border-white/10 bg-black/45 p-0">
        <div className="p-4 sm:p-5 lg:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-brand-indigo">Upload Console</p>
                <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl">Share a note that someone will actually want to open</h3>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="hidden h-6 w-6 text-brand-indigo md:block" />
                <Button
                  type="button"
                  onClick={() => {
                    setIsComposerOpen(false);
                    setStatusText('Ready to upload');
                  }}
                  variant="ghost"
                    className="h-11 rounded-xl border border-red-400/20 px-3 text-red-300 hover:bg-red-500/15"
                >
                  <X size={16} className="mr-2" />
                  Close
                </Button>
              </div>
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
                    className="focus-ring min-h-[48px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-brand-indigo"
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

              <div className="rounded-3xl border border-dashed border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 sm:p-5">
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
                    className="inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-brand-indigo/30 bg-brand-indigo/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-brand-indigo hover:bg-brand-indigo/15 md:w-auto"
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
      ) : null}

      <div className="space-y-4">
        <div className="grid gap-3 rounded-2xl border border-white/10 bg-black/40 p-3 sm:p-4 lg:grid-cols-[1.1fr_0.8fr_0.7fr_auto]">
          <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
            <div className="flex items-center gap-3">
              <Search size={18} className="text-gray-400" />
              <input
                className="min-w-0 w-full bg-transparent text-base text-white outline-none placeholder:text-gray-500 md:text-sm"
                placeholder="Search by title or file name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <select
            className="focus-ring min-h-[48px] rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white outline-none transition focus:border-brand-indigo md:text-sm"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
          >
            <option value="" className="bg-black text-white">All Departments</option>
            <option value="Computer Science" className="bg-black text-white">Computer Science</option>
            <option value="Business" className="bg-black text-white">Business</option>
            <option value="Design" className="bg-black text-white">Design</option>
            <option value="Engineering" className="bg-black text-white">Engineering</option>
          </select>
          <select
            className="focus-ring min-h-[48px] rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white outline-none transition focus:border-brand-indigo md:text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          >
            <option value="newest" className="bg-black text-white">Newest first</option>
            <option value="popular" className="bg-black text-white">Most liked</option>
            <option value="title" className="bg-black text-white">Title A-Z</option>
            <option value="oldest" className="bg-black text-white">Oldest first</option>
          </select>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setSavedOnly((current) => !current)}
            className={`min-h-[48px] rounded-xl border px-4 text-sm ${savedOnly ? 'border-brand-indigo/30 bg-brand-indigo/15 text-white' : 'border-white/10 bg-black/40 text-gray-300 hover:bg-white/10'}`}
          >
            {savedOnly ? <BookmarkCheck size={16} className="mr-2" /> : <Bookmark size={16} className="mr-2" />}
            Saved only
          </Button>
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
              const likeCount = typeof note.likeCount === 'number' ? note.likeCount : (note.likes?.length || 0);
              const saved = Boolean(note.isSaved);
              const isLiked = Boolean(myId && note.likes?.includes(myId));
              const isLikePending = pendingLikeId === note._id;
              const isSavePending = pendingSaveId === note._id;
              const isDownloadPending = pendingDownloadId === note._id;
              const isCopyPending = pendingCopyId === note._id;
              const fallback = downloadFallback?.noteId === note._id ? downloadFallback : null;
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
                      <div className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] rounded-full border border-white/10 bg-black/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white sm:left-4 sm:top-4 sm:tracking-[0.28em]">
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

                    <div className="flex flex-1 flex-col p-4 sm:p-5">
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

                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs uppercase tracking-[0.24em] text-gray-500">
                          Uploaded {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                        {likeCount >= 3 && (
                          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-200">
                            <TrendingUp size={10} className="mr-1 inline-block" />
                            Popular
                          </span>
                        )}
                        {saved && (
                          <span className="rounded-full border border-brand-indigo/20 bg-brand-indigo/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-cyan-200">
                            Saved
                          </span>
                        )}
                      </div>

                      <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-[0.24em] text-gray-500">File name</p>
                            <p className="mt-1 truncate text-sm font-medium text-white/90">{fileName}</p>
                          </div>
                          <button
                            type="button"
                            disabled={isCopyPending}
                            onClick={() => void handleCopyNoteText(note)}
                            className={`inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/30 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 transition hover:bg-white/10 hover:text-white ${isCopyPending ? 'opacity-60' : ''}`}
                          >
                            <Clipboard size={13} className="mr-1.5" />
                            {isCopyPending ? 'Reading' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      {fallback && (
                        <a
                          href={fallback.url}
                          download={fallback.fileName}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-brand-accent/25 bg-brand-accent/10 px-4 text-sm font-semibold text-white transition hover:bg-brand-accent/15"
                        >
                          <Download size={14} className="mr-2" />
                          Open direct PDF link
                        </a>
                      )}

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
                              className="h-10 shrink-0 rounded-xl border border-white/10 bg-black/30 px-3 text-[10px] uppercase tracking-[0.18em] text-white hover:bg-brand-indigo/20"
                            >
                              <MessageSquareMore size={14} className="mr-2" />
                              Message
                            </Button>
                          )}
                        </div>
                      )}

                      <div className="mt-5 border-t border-white/10 pt-4">
                        <div className="action-grid">
                          <button
                            type="button"
                            onClick={() => void toggleLike(note._id)}
                            disabled={isLikePending || !myId}
                            className={`inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                              isLiked
                                ? 'border-red-400/30 bg-red-500/10 text-red-200'
                                : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                            } ${isLikePending ? 'opacity-70' : ''}`}
                          >
                            <Heart size={14} className={`mr-2 ${isLiked ? 'fill-current' : ''}`} />
                            <span>{likeCount}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => void toggleSave(note._id)}
                            disabled={isSavePending || !myId}
                            className={`inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                              saved
                                ? 'border-brand-indigo/30 bg-brand-indigo/10 text-cyan-200'
                                : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                            } ${isSavePending ? 'opacity-70' : ''}`}
                          >
                            {saved ? <BookmarkCheck size={14} className="mr-2" /> : <Bookmark size={14} className="mr-2" />}
                            {saved ? 'Saved' : 'Save'}
                          </button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setPreviewNote(note)}
                            className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white hover:bg-white/10"
                          >
                            <Eye size={14} className="mr-2" />
                            Preview
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            isLoading={isDownloadPending}
                            onClick={() => void handleDownload(note)}
                            className="min-h-[52px] w-full rounded-2xl border border-brand-indigo/20 bg-brand-indigo/10 px-4 text-sm text-white hover:bg-brand-indigo/15"
                          >
                            <Download size={14} className="mr-2" />
                            Download
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
                      disabled={pendingCopyId === previewNote._id}
                      onClick={() => void handleCopyNoteText(previewNote)}
                      className={`inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-300 transition hover:bg-white/10 hover:text-white ${pendingCopyId === previewNote._id ? 'opacity-60' : ''}`}
                    >
                      <Clipboard size={14} className="mr-2" />
                      {pendingCopyId === previewNote._id ? 'Reading' : 'Copy text'}
                    </button>
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
                    isPdfPreviewLoading ? (
                      <div className="flex h-[75vh] items-center justify-center px-6 text-center">
                        <div>
                          <p className="text-sm font-semibold text-white">Loading PDF preview...</p>
                          <p className="mt-2 text-sm text-slate-400">We are preparing the uploaded document for inline viewing.</p>
                        </div>
                      </div>
                    ) : pdfPreviewUrl ? (
                      <iframe
                        src={`${pdfPreviewUrl}#toolbar=0&navpanes=0`}
                        title={previewNote.title}
                        className="h-[75vh] w-full border-0"
                      />
                    ) : (
                      <div className="flex h-[75vh] items-center justify-center px-6 text-center">
                        <div className="max-w-lg">
                          <p className="text-sm font-semibold text-white">Preview could not be loaded in the browser.</p>
                          <p className="mt-2 text-sm text-slate-400">{pdfPreviewError || 'You can still download the original PDF below.'}</p>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => void handleDownload(previewNote)}
                            className="mt-5 min-h-[48px] rounded-2xl border border-brand-indigo/20 bg-brand-indigo/10 px-5 text-sm text-white hover:bg-brand-indigo/15"
                          >
                            <Download size={14} className="mr-2" />
                            Download PDF
                          </Button>
                        </div>
                      </div>
                    )
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

      {hasMounted && copyDialog
        ? createPortal(
            <div
              className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
              onClick={() => setCopyDialog(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-[#070b15] p-6 text-center shadow-2xl shadow-black/60"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="nothing-to-copy-title"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,233,208,0.12),transparent_34%),radial-gradient(circle_at_bottom,rgba(255,188,92,0.08),transparent_32%)]" />
                <div className="relative">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-brand-accent/25 bg-brand-accent/10 text-brand-accent">
                    <Clipboard size={28} />
                  </div>
                  <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.28em] text-brand-indigo">
                    Copy check
                  </p>
                  <h3 id="nothing-to-copy-title" className="mt-2 text-2xl font-semibold text-white">
                    {copyDialog.title}
                  </h3>
                  {copyDialog.noteTitle && (
                    <p className="mt-2 truncate text-xs uppercase tracking-[0.22em] text-slate-500">
                      {copyDialog.noteTitle}
                    </p>
                  )}
                  <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-slate-300">
                    {copyDialog.message}
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setCopyDialog(null)}
                      className="min-h-[48px] rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                    >
                      Close
                    </button>
                    {previewNote && (
                      <button
                        type="button"
                        onClick={() => {
                          setCopyDialog(null);
                          void handleDownload(previewNote);
                        }}
                        className="min-h-[48px] rounded-2xl border border-brand-indigo/20 bg-brand-indigo/10 px-4 text-sm font-semibold text-white transition hover:bg-brand-indigo/15"
                      >
                        Download note
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
