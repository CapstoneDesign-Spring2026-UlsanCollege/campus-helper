"use client";

import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import type { IUser } from '@/models/User';
import type { IAnnouncement } from '@/models/Announcement';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertCircle, CheckCircle2, Loader2, Megaphone, RefreshCw, Search, Shield, Trash2, Users } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';

type AdminTab = 'announcements' | 'users';

function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
  };
}

function getCurrentUser() {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [query, setQuery] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('announcements');
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const isAdmin = currentUser?.role === 'admin';

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return users;

    return users.filter((user) =>
      [user.name, user.email, user.department, user.studentId, user.role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
  }, [query, users]);

  const stats = useMemo(
    () => ({
      users: users.length,
      admins: users.filter((user) => user.role === 'admin').length,
      notices: announcements.length,
    }),
    [announcements.length, users]
  );

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users', {
      headers: authHeaders(),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Could not load users');
    }

    setUsers(Array.isArray(data) ? data : []);
  };

  const fetchAnnouncements = async () => {
    const res = await fetch('/api/admin/announcements');
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Could not load notices');
    }

    setAnnouncements(Array.isArray(data) ? data : []);
  };

  const refreshAdminData = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    setError('');

    try {
      await Promise.all([fetchUsers(), fetchAnnouncements()]);
    } catch (refreshError: any) {
      const message = refreshError.message || 'Admin data could not be loaded';
      setError(message);
      if (!silent) toast.error(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    if (user?.role !== 'admin') {
      setIsLoading(false);
      setError('This page requires an admin account.');
      return;
    }

    refreshAdminData(true);
  }, []);

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This also removes their uploaded notes.`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Could not delete user');
      }

      toast.success('User deleted.');
      await fetchUsers();
    } catch (deleteError: any) {
      toast.error(deleteError.message || 'Could not delete user');
    }
  };

  const handlePostAnnouncement = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextTitle = title.trim();
    const nextContent = content.trim();
    if (!nextTitle || !nextContent) return;

    setIsPosting(true);
    setError('');

    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ title: nextTitle, content: nextContent }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Could not publish notice');
      }

      setTitle('');
      setContent('');
      toast.success('Notice published.');
      await fetchAnnouncements();
    } catch (postError: any) {
      const message = postError.message || 'Could not publish notice';
      setError(message);
      toast.error(message);
    } finally {
      setIsPosting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center">
        <Card className="w-full border border-red-300/20 bg-red-500/10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-300/25 bg-red-500/15 text-red-100">
            <Shield size={24} />
          </div>
          <h1 className="text-2xl font-semibold text-white">Admin access required</h1>
          <p className="mt-2 text-sm leading-6 text-red-100/80">
            Log in with an account whose database role is set to <span className="font-semibold text-white">admin</span>, then return to this page.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      <header className="relative overflow-hidden rounded-lg border border-white/10 bg-black/50 p-5 shadow-2xl shadow-black/30 md:p-6">
        <div className="absolute inset-0 bg-[url('/campus_bg.png')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,8,7,0.96),rgba(3,8,7,0.72))]" />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
              <Shield size={14} />
              Admin console
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Notice and User Control</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Publish campus notices, review accounts, and remove non-admin users from one working dashboard.
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={() => refreshAdminData()}
            disabled={isRefreshing || isLoading}
            className="h-11 rounded-lg border border-white/10 bg-white/[0.03] px-4"
          >
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

      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card className="border border-white/10 bg-black/45 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Users</p>
          <p className="mt-2 text-3xl font-semibold text-white">{stats.users}</p>
        </Card>
        <Card className="border border-white/10 bg-black/45 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Admins</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-100">{stats.admins}</p>
        </Card>
        <Card className="border border-white/10 bg-black/45 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Published notices</p>
          <p className="mt-2 text-3xl font-semibold text-cyan-100">{stats.notices}</p>
        </Card>
      </section>

      <div className="flex flex-wrap gap-2 rounded-lg border border-white/10 bg-black/35 p-2">
        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'announcements' ? 'bg-emerald-300 text-black' : 'text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Megaphone size={17} />
          Notices
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'users' ? 'bg-emerald-300 text-black' : 'text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Users size={17} />
          Users
        </button>
      </div>

      {isLoading ? (
        <Card className="flex min-h-72 items-center justify-center border border-white/10 bg-black/45">
          <Loader2 size={20} className="mr-2 animate-spin text-emerald-200" />
          <span className="text-sm text-slate-300">Loading admin console...</span>
        </Card>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'announcements' ? (
            <motion.section
              key="announcements"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(340px,440px)_1fr]"
            >
              <Card className="border border-emerald-200/20 bg-emerald-300/5">
                <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200/20 bg-emerald-300/10 text-emerald-100">
                    <Megaphone size={20} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">Publish notice</h2>
                    <p className="text-xs text-slate-400">Visible to campus users through the announcements feed.</p>
                  </div>
                </div>

                <form onSubmit={handlePostAnnouncement} className="space-y-4">
                  <Input
                    label="Notice title"
                    placeholder="Library hours update"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                  />

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">Notice body</label>
                    <textarea
                      className="min-h-40 w-full rounded-lg border border-white/10 bg-black/45 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-200/40 focus:bg-black/65"
                      placeholder="Write the notice students should see..."
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    isLoading={isPosting}
                    disabled={!title.trim() || !content.trim()}
                    className="w-full bg-emerald-300 font-semibold text-black hover:bg-cyan-200"
                  >
                    <CheckCircle2 size={18} className="mr-2" />
                    Publish notice
                  </Button>
                </form>
              </Card>

              <div className="space-y-3">
                {announcements.length === 0 ? (
                  <Card className="border border-dashed border-white/15 bg-black/35 p-8 text-center text-slate-400">
                    No notices have been published yet.
                  </Card>
                ) : (
                  announcements.map((post) => (
                    <Card key={String(post._id)} className="border border-white/10 bg-black/45">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{post.content}</p>
                        </div>
                        <span className="w-max rounded-full border border-emerald-200/20 bg-emerald-300/10 px-2.5 py-1 text-xs font-semibold text-emerald-100">
                          Live
                        </span>
                      </div>
                      <p className="mt-4 border-t border-white/10 pt-3 text-xs text-slate-500">
                        Published {post.createdAt ? new Date(post.createdAt).toLocaleString() : 'recently'}
                      </p>
                    </Card>
                  ))
                )}
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="relative max-w-md">
                <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search users, email, department..."
                  className="h-11 w-full rounded-lg border border-white/10 bg-black/45 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-200/40"
                />
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
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-500">
                            No matching users found.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={String(user._id)} className="transition hover:bg-white/[0.03]">
                            <td className="px-5 py-4">
                              <p className="font-semibold text-white">{user.name}</p>
                              <p className="text-xs text-slate-500">{user.studentId}</p>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-300">{user.email}</td>
                            <td className="px-5 py-4 text-sm text-slate-300">{user.department}</td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                  user.role === 'admin'
                                    ? 'border-emerald-200/20 bg-emerald-300/10 text-emerald-100'
                                    : 'border-white/10 bg-white/[0.03] text-slate-300'
                                }`}
                              >
                                {user.role === 'admin' ? 'Admin' : 'Student'}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              {user.role !== 'admin' ? (
                                <button
                                  onClick={() => handleDeleteUser(String(user._id), user.name)}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-200"
                                  title={`Delete ${user.name}`}
                                >
                                  <Trash2 size={17} />
                                </button>
                              ) : (
                                <span className="text-xs text-slate-600">Protected</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.section>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}
