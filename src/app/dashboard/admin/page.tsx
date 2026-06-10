"use client";

import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertCircle, CalendarDays, GraduationCap, Layers3, Loader2, Megaphone, RefreshCw, Search, Shield, Trash2, Users } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchWithAuth, readApiError } from '@/lib/client-api';

type AdminTab = 'announcements' | 'users' | 'semesters' | 'calendar' | 'templates';
type StoredUser = { id?: string; name?: string; role?: string };
type UserRow = { _id: string; name: string; email: string; department: string; studentId: string; role: string };
type Announcement = {
  _id: string;
  title: string;
  content: string;
  createdAt?: string;
  priority?: 'normal' | 'important' | 'urgent';
  pinned?: boolean;
  publishAt?: string;
  expiresAt?: string;
  authorId?: { name?: string } | string;
};
type Semester = { _id: string; name: string; year: number; term: string; status: string; registrationStart?: string; registrationEnd?: string; classStart?: string; classEnd?: string };
type AcademicEvent = { _id: string; semesterId: string; title: string; description?: string; category: string; startDate: string; endDate?: string };
type TimetableTemplate = { _id: string; semesterId: string; department: string; day: string; time: string; subject: string; room?: string };
type AdminTabConfig = {
  key: AdminTab;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

function getCurrentUser() {
  try {
    const stored = localStorage.getItem('user');
    return stored ? (JSON.parse(stored) as StoredUser | null) : null;
  } catch {
    return null;
  }
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

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

function formatExactDateTime(value?: string) {
  if (!value) return 'Time unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Time unavailable';
  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getDayBucketLabel(value?: string) {
  if (!value) return 'Earlier';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Earlier';

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  if (date >= startOfToday) return 'Today';
  if (date >= startOfYesterday) return 'Yesterday';
  if (date >= startOfWeek) return 'Earlier this week';
  return 'Earlier';
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('announcements');
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [users, setUsers] = useState<UserRow[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [academicEvents, setAcademicEvents] = useState<AcademicEvent[]>([]);
  const [templates, setTemplates] = useState<TimetableTemplate[]>([]);

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'normal',
    pinned: false,
    publishAt: '',
    expiresAt: '',
  });
  const [semesterForm, setSemesterForm] = useState({
    name: '',
    year: 2026,
    term: 'spring',
    status: 'upcoming',
    registrationStart: '',
    registrationEnd: '',
    classStart: '',
    classEnd: '',
  });
  const [academicEventForm, setAcademicEventForm] = useState({
    semesterId: '',
    title: '',
    description: '',
    category: 'general',
    startDate: '',
    endDate: '',
  });
  const [templateForm, setTemplateForm] = useState({
    semesterId: '',
    department: '',
    day: 'Monday',
    time: '',
    subject: '',
    room: '',
  });
  const [userSearch, setUserSearch] = useState('');
  const [announcementSearch, setAnnouncementSearch] = useState('');
  const [announcementPriorityFilter, setAnnouncementPriorityFilter] = useState<'all' | 'normal' | 'important' | 'urgent'>('all');
  const [announcementViewFilter, setAnnouncementViewFilter] = useState<'all' | 'pinned' | 'scheduled' | 'expiring'>('all');
  const [semesterStatusFilter, setSemesterStatusFilter] = useState<'all' | 'active' | 'upcoming' | 'archived'>('all');
  const [eventQuery, setEventQuery] = useState('');
  const [templateQuery, setTemplateQuery] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  const validateAnnouncementForm = () => {
    if (!announcementForm.title.trim()) return 'Notice title is required.';
    if (!announcementForm.content.trim()) return 'Notice body is required.';
    if (announcementForm.publishAt && announcementForm.expiresAt) {
      const publishAt = new Date(announcementForm.publishAt);
      const expiresAt = new Date(announcementForm.expiresAt);
      if (!Number.isNaN(publishAt.getTime()) && !Number.isNaN(expiresAt.getTime()) && publishAt.getTime() >= expiresAt.getTime()) {
        return 'Expiry must be later than the publish time.';
      }
    }
    return '';
  };

  const validateSemesterForm = () => {
    if (!semesterForm.name.trim()) return 'Semester name is required.';
    if (!semesterForm.year || Number.isNaN(semesterForm.year)) return 'A valid year is required.';
    return '';
  };

  const validateAcademicEventForm = () => {
    if (!academicEventForm.semesterId) return 'Semester selection is required.';
    if (!academicEventForm.title.trim()) return 'Event title is required.';
    if (!academicEventForm.startDate) return 'Start date is required.';
    return '';
  };

  const validateTemplateForm = () => {
    if (!templateForm.semesterId) return 'Semester selection is required.';
    if (!templateForm.department.trim()) return 'Department is required.';
    if (!templateForm.time.trim()) return 'Time is required.';
    if (!templateForm.subject.trim()) return 'Subject is required.';
    return '';
  };

  const refreshAdminData = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    setError('');

    try {
      const [usersRes, announcementsRes, semestersRes, academicEventsRes, templateRes] = await Promise.all([
        fetchWithAuth('/api/admin/users'),
        fetchWithAuth('/api/admin/announcements?scope=admin'),
        fetchWithAuth('/api/admin/semesters'),
        fetchWithAuth('/api/admin/academic-events'),
        fetchWithAuth('/api/admin/timetable-templates'),
      ]);

      const [usersData, announcementsData, semestersData, academicEventsData, templateData] = await Promise.all([
        usersRes.json(),
        announcementsRes.json(),
        semestersRes.json(),
        academicEventsRes.json(),
        templateRes.json(),
      ]);

      if (!usersRes.ok) throw new Error(usersData.error || 'Could not load users');
      if (!announcementsRes.ok) throw new Error(announcementsData.error || 'Could not load announcements');
      if (!semestersRes.ok) throw new Error(semestersData.error || 'Could not load semesters');
      if (!academicEventsRes.ok) throw new Error(academicEventsData.error || 'Could not load academic events');
      if (!templateRes.ok) throw new Error(templateData.error || 'Could not load timetable templates');

      setUsers(Array.isArray(usersData) ? usersData : []);
      setAnnouncements(Array.isArray(announcementsData) ? announcementsData : []);
      setSemesters(Array.isArray(semestersData) ? semestersData : []);
      setAcademicEvents(Array.isArray(academicEventsData) ? academicEventsData : []);
      setTemplates(Array.isArray(templateData) ? templateData : []);

      const activeSemester = (Array.isArray(semestersData) ? semestersData : [])[0];
      if (activeSemester) {
        setAcademicEventForm((current) => ({ ...current, semesterId: current.semesterId || activeSemester._id }));
        setTemplateForm((current) => ({ ...current, semesterId: current.semesterId || activeSemester._id }));
      }
    } catch (refreshError) {
      const message = refreshError instanceof Error ? refreshError.message : 'Admin data could not be loaded';
      setError(message);
      if (!silent) toast.error(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    if (user?.role !== 'admin') {
      setIsLoading(false);
      setError('This page requires an admin account.');
      return;
    }

    void refreshAdminData(true);
  }, [refreshAdminData]);

  const stats = useMemo(
    () => ({
      users: users.length,
      semesters: semesters.length,
      events: academicEvents.length,
      templates: templates.length,
      activeSemesters: semesters.filter((semester) => semester.status === 'active').length,
      archivedSemesters: semesters.filter((semester) => semester.status === 'archived').length,
    }),
    [academicEvents.length, semesters, templates.length, users.length]
  );

  const filteredUsers = useMemo(() => {
    const query = normalizeText(userSearch);
    if (!query) return users;
    return users.filter((user) =>
      [user.name, user.email, user.department, user.studentId, user.role].some((value) =>
        normalizeText(String(value || '')).includes(query)
      )
    );
  }, [userSearch, users]);

  const filteredAnnouncements = useMemo(() => {
    const query = normalizeText(announcementSearch);
    const now = Date.now();
    return announcements.filter((post) => {
      const matchesQuery = !query || normalizeText(`${post.title} ${post.content}`).includes(query);
      const matchesPriority = announcementPriorityFilter === 'all' || (post.priority || 'normal') === announcementPriorityFilter;
      const publishTime = post.publishAt ? new Date(post.publishAt).getTime() : 0;
      const expireTime = post.expiresAt ? new Date(post.expiresAt).getTime() : Number.POSITIVE_INFINITY;
      const matchesView =
        announcementViewFilter === 'all' ? true :
        announcementViewFilter === 'pinned' ? Boolean(post.pinned) :
        announcementViewFilter === 'scheduled' ? publishTime > now :
        expireTime > now && expireTime < now + 1000 * 60 * 60 * 24 * 3;

      return matchesQuery && matchesPriority && matchesView;
    });
  }, [announcementPriorityFilter, announcementSearch, announcementViewFilter, announcements]);

  const groupedAnnouncements = useMemo(() => {
    const groups = new Map<string, Announcement[]>();
    filteredAnnouncements.forEach((post) => {
      const label = post.publishAt && new Date(post.publishAt).getTime() > Date.now()
        ? 'Scheduled'
        : getDayBucketLabel(post.publishAt || post.createdAt);
      const existing = groups.get(label) || [];
      existing.push(post);
      groups.set(label, existing);
    });

    return ['Scheduled', 'Today', 'Yesterday', 'Earlier this week', 'Earlier']
      .map((label) => ({ label, posts: groups.get(label) || [] }))
      .filter((group) => group.posts.length > 0);
  }, [filteredAnnouncements]);

  const announcementStats = useMemo(() => {
    const now = Date.now();
    return {
      urgent: announcements.filter((post) => post.priority === 'urgent').length,
      pinned: announcements.filter((post) => post.pinned).length,
      scheduled: announcements.filter((post) => post.publishAt && new Date(post.publishAt).getTime() > now).length,
      expiringSoon: announcements.filter((post) => {
        if (!post.expiresAt) return false;
        const expireTime = new Date(post.expiresAt).getTime();
        return expireTime > now && expireTime < now + 1000 * 60 * 60 * 24 * 3;
      }).length,
    };
  }, [announcements]);

  const announcementPreview = useMemo(() => {
    return {
      title: announcementForm.title.trim() || 'Your notice title will appear here',
      content:
        announcementForm.content.trim() ||
        'Notice details, instructions, or key campus information will show here as you type.',
      priority: announcementForm.priority as Announcement['priority'],
      pinned: announcementForm.pinned,
      publishAt: announcementForm.publishAt,
      expiresAt: announcementForm.expiresAt,
    };
  }, [announcementForm]);

  const filteredSemesters = useMemo(() => {
    if (semesterStatusFilter === 'all') return semesters;
    return semesters.filter((semester) => semester.status === semesterStatusFilter);
  }, [semesterStatusFilter, semesters]);

  const filteredAcademicEvents = useMemo(() => {
    const query = normalizeText(eventQuery);
    if (!query) return academicEvents;
    return academicEvents.filter((event) =>
      normalizeText(`${event.title} ${event.description || ''} ${event.category}`).includes(query)
    );
  }, [academicEvents, eventQuery]);

  const filteredTemplates = useMemo(() => {
    const query = normalizeText(templateQuery);
    if (!query) return templates;
    return templates.filter((template) =>
      normalizeText(`${template.subject} ${template.department} ${template.day} ${template.room || ''}`).includes(query)
    );
  }, [templateQuery, templates]);

  const adminTabs = useMemo<AdminTabConfig[]>(
    () => [
      { key: 'announcements', label: 'Notices', icon: Megaphone },
      { key: 'users', label: 'Users', icon: Users },
      { key: 'semesters', label: 'Semesters', icon: Layers3 },
      { key: 'calendar', label: 'Academic Events', icon: CalendarDays },
      { key: 'templates', label: 'Timetable Templates', icon: GraduationCap },
    ],
    []
  );

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    const res = await fetchWithAuth(`/api/admin/users?id=${id}`, { method: 'DELETE' });
    if (!res.ok) return toast.error(await readApiError(res, 'Could not delete user'));
    toast.success('User deleted.');
    void refreshAdminData(true);
  };

  const submitJson = async (url: string, body: unknown, successMessage: string, method = 'POST') => {
    const res = await fetchWithAuth(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await readApiError(res, 'Request failed'));
    toast.success(successMessage);
    await refreshAdminData(true);
  };

  const handleDeleteSimple = async (url: string, successMessage: string) => {
    const res = await fetchWithAuth(url, { method: 'DELETE' });
    if (!res.ok) return toast.error(await readApiError(res, 'Could not delete item'));
    toast.success(successMessage);
    void refreshAdminData(true);
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center">
        <Card className="w-full border border-red-300/20 bg-red-500/10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-300/25 bg-red-500/15 text-red-100">
            <Shield size={24} />
          </div>
          <h1 className="text-2xl font-semibold text-white">Admin access required</h1>
          <p className="mt-2 text-sm leading-6 text-red-100/80">Log in with an admin account to manage semesters, academic events, and official timetables.</p>
        </Card>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
      <header className="relative overflow-hidden rounded-lg border border-white/10 bg-black/50 p-5 shadow-2xl shadow-black/30 md:p-6">
        <div className="absolute inset-0 bg-[url('/campus_bg.png')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,8,7,0.96),rgba(3,8,7,0.72))]" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
              <Shield size={14} />
              Academic operations console
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Semester and Campus Data</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Manage official semester records, announcements, academic events, and timetable templates from one admin workspace.</p>
          </div>

          <Button type="button" variant="ghost" onClick={() => refreshAdminData()} disabled={isRefreshing || isLoading} className="h-11 rounded-lg border border-white/10 bg-white/[0.03] px-4">
            {isRefreshing ? <Loader2 size={16} className="mr-2 animate-spin" /> : <RefreshCw size={16} className="mr-2" />}
            Refresh
          </Button>
        </div>
      </header>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-300/20 bg-red-500/10 p-3 text-sm text-red-100">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Users', value: stats.users },
          { label: 'Semesters', value: stats.semesters },
          { label: 'Active Terms', value: stats.activeSemesters },
          { label: 'Templates', value: stats.templates },
        ].map((item) => (
          <Card key={item.label} className="border border-white/10 bg-black/45 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
          </Card>
        ))}
      </section>

      <div className="flex gap-2 overflow-x-auto rounded-lg border border-white/10 bg-black/35 p-2">
        {adminTabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === key ? 'bg-emerald-300 text-black' : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon size={16} />
            {label}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              activeTab === key ? 'bg-black/10 text-black/70' : 'bg-white/10 text-slate-400'
            }`}>
              {key === 'announcements'
                ? announcements.length
                : key === 'users'
                  ? users.length
                  : key === 'semesters'
                    ? semesters.length
                    : key === 'calendar'
                      ? academicEvents.length
                      : templates.length}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <Card className="flex min-h-72 items-center justify-center border border-white/10 bg-black/45">
          <Loader2 size={20} className="mr-2 animate-spin text-emerald-200" />
          <span className="text-sm text-slate-300">Loading admin console...</span>
        </Card>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'announcements' && (
            <motion.section key="announcements" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid gap-5 xl:grid-cols-[420px_1fr]">
              <Card className="border border-emerald-200/20 bg-emerald-300/5">
                <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-4">
                  <Megaphone size={20} className="text-emerald-100" />
                  <div>
                    <h2 className="font-semibold text-white">Publish notice</h2>
                    <p className="text-xs text-slate-400">Students see these in dashboard and notifications.</p>
                  </div>
                </div>
                <form
                  onSubmit={async (event: FormEvent) => {
                    event.preventDefault();
                    try {
                      const validationError = validateAnnouncementForm();
                      if (validationError) throw new Error(validationError);
                      await submitJson('/api/admin/announcements', announcementForm, 'Notice published.');
                      setAnnouncementForm({ title: '', content: '', priority: 'normal', pinned: false, publishAt: '', expiresAt: '' });
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : 'Could not publish notice');
                    }
                  }}
                  className="space-y-4"
                >
                  <Input label="Notice title" value={announcementForm.title} onChange={(event) => setAnnouncementForm({ ...announcementForm, title: event.target.value })} required />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">Priority</label>
                      <select
                        className="h-12 w-full rounded-lg border border-white/10 bg-black/45 px-4 text-white"
                        value={announcementForm.priority}
                        onChange={(event) => setAnnouncementForm({ ...announcementForm, priority: event.target.value })}
                      >
                        <option value="normal">Normal</option>
                        <option value="important">Important</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <Input
                      label="Publish at (optional)"
                      type="datetime-local"
                      value={announcementForm.publishAt}
                      onChange={(event) => setAnnouncementForm({ ...announcementForm, publishAt: event.target.value })}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Expires (optional)"
                      type="date"
                      value={announcementForm.expiresAt}
                      onChange={(event) => setAnnouncementForm({ ...announcementForm, expiresAt: event.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">Notice body</label>
                    <textarea className="min-h-40 w-full rounded-lg border border-white/10 bg-black/45 p-4 text-sm leading-6 text-white outline-none transition focus:border-emerald-200/40" value={announcementForm.content} onChange={(event) => setAnnouncementForm({ ...announcementForm, content: event.target.value })} required />
                  </div>
                  <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={announcementForm.pinned}
                      onChange={(event) => setAnnouncementForm({ ...announcementForm, pinned: event.target.checked })}
                      className="h-4 w-4 rounded border-white/20 bg-black/40 text-emerald-300"
                    />
                    Pin this notice above others
                  </label>
                  <Card className="border border-white/10 bg-black/35 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Live preview</p>
                        <p className="mt-1 text-xs text-slate-400">This is how the notice will feel inside the dashboard feed.</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {announcementPreview.pinned ? (
                          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] text-cyan-100">
                            Pinned
                          </span>
                        ) : null}
                        <span className={`rounded-full px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] ${
                          announcementPreview.priority === 'urgent'
                            ? 'border border-red-300/20 bg-red-400/10 text-red-100'
                            : announcementPreview.priority === 'important'
                              ? 'border border-amber-300/20 bg-amber-400/10 text-amber-100'
                              : 'border border-white/10 bg-white/[0.03] text-slate-300'
                        }`}>
                          {announcementPreview.priority || 'normal'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="font-semibold text-white">{announcementPreview.title}</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{announcementPreview.content}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
                          {announcementPreview.publishAt ? `Publishes ${formatExactDateTime(announcementPreview.publishAt)}` : 'Publishes immediately'}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
                          {announcementPreview.expiresAt ? `Expires ${formatExactDateTime(announcementPreview.expiresAt)}` : 'No expiry'}
                        </span>
                      </div>
                    </div>
                  </Card>
                  <Button type="submit" className="w-full bg-emerald-300 font-semibold text-black hover:bg-cyan-200">Publish notice</Button>
                </form>
              </Card>
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <Card className="border border-white/10 bg-black/35 p-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Published notices</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{announcements.length}</p>
                    </Card>
                    <Card className="border border-white/10 bg-black/35 p-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Visible in search</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{filteredAnnouncements.length}</p>
                    </Card>
                    <Card className="border border-white/10 bg-black/35 p-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Latest publish</p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {announcements[0]?.createdAt ? formatRelativeTime(announcements[0].createdAt) : 'No notices yet'}
                      </p>
                    </Card>
                    <Card className="border border-white/10 bg-black/35 p-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Urgent / pinned</p>
                      <p className="mt-2 text-sm font-semibold text-white">{announcementStats.urgent} urgent / {announcementStats.pinned} pinned</p>
                    </Card>
                    <Card className="border border-white/10 bg-black/35 p-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Scheduled / expiring</p>
                      <p className="mt-2 text-sm font-semibold text-white">{announcementStats.scheduled} scheduled / {announcementStats.expiringSoon} expiring soon</p>
                    </Card>
                  </div>
                  <Card className="border border-white/10 bg-black/35 p-4">
                    <div className="grid gap-4 xl:grid-cols-[1fr_190px_190px]">
                      <Input
                        label="Search published notices"
                        icon={Search}
                        placeholder="Search by title or message..."
                        value={announcementSearch}
                        onChange={(event) => setAnnouncementSearch(event.target.value)}
                      />
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">Priority filter</label>
                        <select
                          className="h-12 w-full rounded-lg border border-white/10 bg-black/45 px-4 text-white"
                          value={announcementPriorityFilter}
                          onChange={(event) => setAnnouncementPriorityFilter(event.target.value as typeof announcementPriorityFilter)}
                        >
                          <option value="all">All priorities</option>
                          <option value="urgent">Urgent</option>
                          <option value="important">Important</option>
                          <option value="normal">Normal</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">View filter</label>
                        <select
                          className="h-12 w-full rounded-lg border border-white/10 bg-black/45 px-4 text-white"
                          value={announcementViewFilter}
                          onChange={(event) => setAnnouncementViewFilter(event.target.value as typeof announcementViewFilter)}
                        >
                          <option value="all">All notices</option>
                          <option value="pinned">Pinned only</option>
                          <option value="scheduled">Scheduled only</option>
                          <option value="expiring">Expiring soon</option>
                        </select>
                      </div>
                    </div>
                  </Card>
                  {groupedAnnouncements.length === 0 ? (
                    <Card className="border border-dashed border-white/10 bg-black/30 p-8 text-center">
                      <p className="text-sm text-slate-400">No notices match this search yet.</p>
                    </Card>
                  ) : (
                    groupedAnnouncements.map((group) => (
                      <div key={group.label} className="space-y-3">
                        <div className="sticky top-0 z-10 rounded-lg border border-white/10 bg-[#0b111b]/95 px-4 py-3 backdrop-blur">
                          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">{group.label}</p>
                        </div>
                        {group.posts.map((post) => (
                          <Card key={post._id} className="border border-white/10 bg-black/45">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                                  {post.pinned ? (
                                    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] text-cyan-100">
                                      Pinned
                                    </span>
                                  ) : null}
                                  <span className={`rounded-full px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] ${
                                    post.priority === 'urgent'
                                      ? 'border border-red-300/20 bg-red-400/10 text-red-100'
                                      : post.priority === 'important'
                                        ? 'border border-amber-300/20 bg-amber-400/10 text-amber-100'
                                        : 'border border-white/10 bg-white/[0.03] text-slate-300'
                                  }`}>
                                    {post.priority || 'normal'}
                                  </span>
                                </div>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{post.content}</p>
                                <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
                                    Author {typeof post.authorId === 'object' ? post.authorId?.name || 'Admin' : 'Admin'}
                                  </span>
                                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
                                    {post.publishAt ? `Publishes ${formatExactDateTime(post.publishAt)}` : 'Live now'}
                                  </span>
                                  {post.expiresAt ? (
                                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
                                      Expires {new Date(post.expiresAt).toLocaleDateString()}
                                    </span>
                                  ) : (
                                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
                                      No expiry
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex shrink-0 flex-col gap-3 sm:min-w-[220px]">
                                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Published</p>
                                  <p className="mt-2 text-sm font-semibold text-white">{formatExactDateTime(post.createdAt)}</p>
                                  <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-brand-accent">{formatRelativeTime(post.createdAt)}</p>
                                </div>
                                <button
                                  onClick={() => handleDeleteSimple(`/api/admin/announcements?id=${post._id}`, 'Notice deleted.')}
                                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-300/15 bg-red-500/8 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-red-100 transition hover:bg-red-500/15"
                                >
                                  <Trash2 size={14} />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </motion.section>
            )}

          {activeTab === 'users' && (
            <motion.section key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="mb-4">
                <Card className="border border-white/10 bg-black/35 p-4">
                  <Input
                    label="Search people"
                    icon={Search}
                    placeholder="Search by name, email, department, ID, or role..."
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                  />
                </Card>
              </div>
              <Card className="overflow-hidden border border-white/10 bg-black/45 p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left">
                    <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-[0.16em] text-slate-500">
                      <tr>
                        <th className="px-5 py-4 font-semibold">Student</th>
                        <th className="px-5 py-4 font-semibold">Email</th>
                        <th className="px-5 py-4 font-semibold">Department</th>
                        <th className="px-5 py-4 font-semibold">Role</th>
                        <th className="px-5 py-4 text-right font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className="transition hover:bg-white/[0.03]">
                          <td className="px-5 py-4">
                            <p className="font-semibold text-white">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.studentId}</p>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-300">{user.email}</td>
                          <td className="px-5 py-4 text-sm text-slate-300">{user.department}</td>
                          <td className="px-5 py-4 text-sm text-slate-300">{user.role}</td>
                          <td className="px-5 py-4 text-right">
                            {user.role !== 'admin' && (
                              <button onClick={() => handleDeleteUser(user._id, user.name)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-200">
                                <Trash2 size={17} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.section>
          )}

          {activeTab === 'semesters' && (
            <motion.section key="semesters" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid gap-5 xl:grid-cols-[420px_1fr]">
              <Card className="border border-white/10 bg-black/45">
                <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-4">
                  <Layers3 size={20} className="text-cyan-200" />
                  <div>
                    <h2 className="font-semibold text-white">Create semester</h2>
                    <p className="text-xs text-slate-400">Use official Ulsan College academic windows.</p>
                  </div>
                </div>
                <form
                  onSubmit={async (event) => {
                    event.preventDefault();
                    try {
                      const validationError = validateSemesterForm();
                      if (validationError) throw new Error(validationError);
                      await submitJson('/api/admin/semesters', semesterForm, 'Semester saved.');
                      setSemesterForm({ name: '', year: 2026, term: 'spring', status: 'upcoming', registrationStart: '', registrationEnd: '', classStart: '', classEnd: '' });
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : 'Could not save semester');
                    }
                  }}
                  className="space-y-4"
                >
                  <Input label="Semester name" value={semesterForm.name} onChange={(event) => setSemesterForm({ ...semesterForm, name: event.target.value })} required />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input label="Year" type="number" value={String(semesterForm.year)} onChange={(event) => setSemesterForm({ ...semesterForm, year: Number(event.target.value) })} required />
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">Term</label>
                      <select className="h-12 w-full rounded-lg border border-white/10 bg-black/45 px-4 text-white" value={semesterForm.term} onChange={(event) => setSemesterForm({ ...semesterForm, term: event.target.value })}>
                        <option value="spring">Spring</option>
                        <option value="summer">Summer</option>
                        <option value="fall">Fall</option>
                        <option value="winter">Winter</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">Status</label>
                    <select className="h-12 w-full rounded-lg border border-white/10 bg-black/45 px-4 text-white" value={semesterForm.status} onChange={(event) => setSemesterForm({ ...semesterForm, status: event.target.value })}>
                      <option value="upcoming">Upcoming</option>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input label="Registration start" type="date" value={semesterForm.registrationStart} onChange={(event) => setSemesterForm({ ...semesterForm, registrationStart: event.target.value })} />
                    <Input label="Registration end" type="date" value={semesterForm.registrationEnd} onChange={(event) => setSemesterForm({ ...semesterForm, registrationEnd: event.target.value })} />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input label="Class start" type="date" value={semesterForm.classStart} onChange={(event) => setSemesterForm({ ...semesterForm, classStart: event.target.value })} />
                    <Input label="Class end" type="date" value={semesterForm.classEnd} onChange={(event) => setSemesterForm({ ...semesterForm, classEnd: event.target.value })} />
                  </div>
                  <Button type="submit" className="w-full bg-cyan-200 text-black hover:bg-emerald-200">Save semester</Button>
                </form>
              </Card>
              <div className="space-y-3">
                <Card className="border border-white/10 bg-black/35 p-4">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">Filter semester state</label>
                    <div className="flex gap-2 rounded-lg border border-white/10 bg-black/40 p-1">
                      {(['all', 'active', 'upcoming', 'archived'] as const).map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setSemesterStatusFilter(value)}
                          className={`flex-1 rounded-md px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
                            semesterStatusFilter === value ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>
                {filteredSemesters.map((semester) => (
                  <Card key={semester._id} className="border border-white/10 bg-black/45">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{semester.name}</h3>
                        <p className="mt-2 text-sm text-slate-400">{semester.term} / {semester.status}</p>
                      </div>
                      <button onClick={() => handleDeleteSimple(`/api/admin/semesters?id=${semester._id}`, 'Semester deleted.')} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-200">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.section>
          )}

          {activeTab === 'calendar' && (
            <motion.section key="calendar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid gap-5 xl:grid-cols-[420px_1fr]">
              <Card className="border border-white/10 bg-black/45">
                <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-4">
                  <CalendarDays size={20} className="text-cyan-200" />
                  <div>
                    <h2 className="font-semibold text-white">Add academic event</h2>
                    <p className="text-xs text-slate-400">Registration, classes, exam windows, and semester milestones.</p>
                  </div>
                </div>
                <form
                  onSubmit={async (event) => {
                    event.preventDefault();
                    try {
                      const validationError = validateAcademicEventForm();
                      if (validationError) throw new Error(validationError);
                      await submitJson('/api/admin/academic-events', academicEventForm, 'Academic event saved.');
                      setAcademicEventForm((current) => ({ ...current, title: '', description: '', category: 'general', startDate: '', endDate: '' }));
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : 'Could not save academic event');
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">Semester</label>
                    <select className="h-12 w-full rounded-lg border border-white/10 bg-black/45 px-4 text-white" value={academicEventForm.semesterId} onChange={(event) => setAcademicEventForm({ ...academicEventForm, semesterId: event.target.value })}>
                      {semesters.map((semester) => <option key={semester._id} value={semester._id}>{semester.name}</option>)}
                    </select>
                  </div>
                  <Input label="Event title" value={academicEventForm.title} onChange={(event) => setAcademicEventForm({ ...academicEventForm, title: event.target.value })} required />
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">Category</label>
                    <select className="h-12 w-full rounded-lg border border-white/10 bg-black/45 px-4 text-white" value={academicEventForm.category} onChange={(event) => setAcademicEventForm({ ...academicEventForm, category: event.target.value })}>
                      <option value="general">General</option>
                      <option value="registration">Registration</option>
                      <option value="classes">Classes</option>
                      <option value="exams">Exams</option>
                      <option value="break">Break</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">Description</label>
                    <textarea className="min-h-28 w-full rounded-lg border border-white/10 bg-black/45 p-4 text-sm text-white outline-none transition focus:border-cyan-200/40" value={academicEventForm.description} onChange={(event) => setAcademicEventForm({ ...academicEventForm, description: event.target.value })} />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input label="Start date" type="date" value={academicEventForm.startDate} onChange={(event) => setAcademicEventForm({ ...academicEventForm, startDate: event.target.value })} required />
                    <Input label="End date" type="date" value={academicEventForm.endDate} onChange={(event) => setAcademicEventForm({ ...academicEventForm, endDate: event.target.value })} />
                  </div>
                  <Button type="submit" className="w-full bg-cyan-200 text-black hover:bg-emerald-200">Save academic event</Button>
                </form>
              </Card>
              <div className="space-y-3">
                <Card className="border border-white/10 bg-black/35 p-4">
                  <Input
                    label="Search academic events"
                    icon={Search}
                    placeholder="Search titles, categories, or details..."
                    value={eventQuery}
                    onChange={(event) => setEventQuery(event.target.value)}
                  />
                </Card>
                {filteredAcademicEvents.map((event) => {
                  const semesterName = semesters.find((semester) => semester._id === event.semesterId)?.name || 'Unknown semester';
                  return (
                    <Card key={event._id} className="border border-white/10 bg-black/45">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="inline-flex rounded-full border border-cyan-200/15 bg-cyan-200/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                            {event.category}
                          </div>
                          <h3 className="mt-3 text-lg font-semibold text-white">{event.title}</h3>
                          <p className="mt-2 text-sm text-slate-400">
                            {semesterName} / {new Date(event.startDate).toLocaleDateString()}
                            {event.endDate ? ` to ${new Date(event.endDate).toLocaleDateString()}` : ''}
                          </p>
                          {event.description ? <p className="mt-3 text-sm leading-6 text-slate-300">{event.description}</p> : null}
                        </div>
                        <button onClick={() => handleDeleteSimple(`/api/admin/academic-events?id=${event._id}`, 'Academic event deleted.')} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-200">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </motion.section>
          )}

          {activeTab === 'templates' && (
            <motion.section key="templates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid gap-5 xl:grid-cols-[420px_1fr]">
              <Card className="border border-white/10 bg-black/45">
                <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-4">
                  <CalendarDays size={20} className="text-cyan-200" />
                  <div>
                    <h2 className="font-semibold text-white">Add official timetable row</h2>
                    <p className="text-xs text-slate-400">Department-specific semester template.</p>
                  </div>
                </div>
                <form
                  onSubmit={async (event) => {
                    event.preventDefault();
                    try {
                      const validationError = validateTemplateForm();
                      if (validationError) throw new Error(validationError);
                      await submitJson('/api/admin/timetable-templates', templateForm, 'Template row saved.');
                      setTemplateForm({ ...templateForm, time: '', subject: '', room: '' });
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : 'Could not save template');
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">Semester</label>
                    <select className="h-12 w-full rounded-lg border border-white/10 bg-black/45 px-4 text-white" value={templateForm.semesterId} onChange={(event) => setTemplateForm({ ...templateForm, semesterId: event.target.value })}>
                      {semesters.map((semester) => <option key={semester._id} value={semester._id}>{semester.name}</option>)}
                    </select>
                  </div>
                  <Input label="Department" value={templateForm.department} onChange={(event) => setTemplateForm({ ...templateForm, department: event.target.value })} required />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">Day</label>
                      <select className="h-12 w-full rounded-lg border border-white/10 bg-black/45 px-4 text-white" value={templateForm.day} onChange={(event) => setTemplateForm({ ...templateForm, day: event.target.value })}>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => <option key={day} value={day}>{day}</option>)}
                      </select>
                    </div>
                    <Input label="Time" value={templateForm.time} onChange={(event) => setTemplateForm({ ...templateForm, time: event.target.value })} required />
                  </div>
                  <Input label="Subject" value={templateForm.subject} onChange={(event) => setTemplateForm({ ...templateForm, subject: event.target.value })} required />
                  <Input label="Room" value={templateForm.room} onChange={(event) => setTemplateForm({ ...templateForm, room: event.target.value })} />
                  <Button type="submit" className="w-full bg-cyan-200 text-black hover:bg-emerald-200">Save template row</Button>
                </form>
              </Card>
              <div className="space-y-3">
                <Card className="border border-white/10 bg-black/35 p-4">
                  <Input
                    label="Search timetable templates"
                    icon={Search}
                    placeholder="Search department, subject, day, or room..."
                    value={templateQuery}
                    onChange={(event) => setTemplateQuery(event.target.value)}
                  />
                </Card>
                {filteredTemplates.map((template) => (
                  <Card key={template._id} className="border border-white/10 bg-black/45">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{template.subject}</h3>
                        <p className="mt-2 text-sm text-slate-400">{template.department} / {template.day} / {template.time}{template.room ? ` / ${template.room}` : ''}</p>
                      </div>
                      <button onClick={() => handleDeleteSimple(`/api/admin/timetable-templates?id=${template._id}`, 'Template row deleted.')} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-200">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}
