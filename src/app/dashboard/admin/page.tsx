"use client";

import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertCircle, CalendarDays, GraduationCap, Layers3, Loader2, Megaphone, RefreshCw, Shield, Trash2, Users } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchWithAuth, readApiError } from '@/lib/client-api';

type AdminTab = 'announcements' | 'users' | 'semesters' | 'calendar' | 'templates';
type StoredUser = { id?: string; name?: string; role?: string };
type UserRow = { _id: string; name: string; email: string; department: string; studentId: string; role: string };
type Announcement = { _id: string; title: string; content: string; createdAt?: string };
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

  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '' });
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

  const isAdmin = currentUser?.role === 'admin';

  const validateAnnouncementForm = () => {
    if (!announcementForm.title.trim()) return 'Notice title is required.';
    if (!announcementForm.content.trim()) return 'Notice body is required.';
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
        fetch('/api/admin/announcements'),
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
    }),
    [academicEvents.length, semesters.length, templates.length, users.length]
  );

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
          { label: 'Events', value: stats.events },
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
                      setAnnouncementForm({ title: '', content: '' });
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : 'Could not publish notice');
                    }
                  }}
                  className="space-y-4"
                >
                  <Input label="Notice title" value={announcementForm.title} onChange={(event) => setAnnouncementForm({ ...announcementForm, title: event.target.value })} required />
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">Notice body</label>
                    <textarea className="min-h-40 w-full rounded-lg border border-white/10 bg-black/45 p-4 text-sm leading-6 text-white outline-none transition focus:border-emerald-200/40" value={announcementForm.content} onChange={(event) => setAnnouncementForm({ ...announcementForm, content: event.target.value })} required />
                  </div>
                  <Button type="submit" className="w-full bg-emerald-300 font-semibold text-black hover:bg-cyan-200">Publish notice</Button>
                </form>
              </Card>
              <div className="space-y-3">
                {announcements.map((post) => (
                  <Card key={post._id} className="border border-white/10 bg-black/45">
                    <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{post.content}</p>
                  </Card>
                ))}
              </div>
            </motion.section>
          )}

          {activeTab === 'users' && (
            <motion.section key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
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
                      {users.map((user) => (
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
                {semesters.map((semester) => (
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
                {academicEvents.map((event) => {
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
                {templates.map((template) => (
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
