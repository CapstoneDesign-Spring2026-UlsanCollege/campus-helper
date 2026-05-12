"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { ArrowRight, Bell, Bot, Calendar, Layers3, Megaphone, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import { CommandHero } from '@/components/layout/CommandHero';
import { fetchWithAuth } from '@/lib/client-api';

type Semester = { _id: string; name: string; status: string; classStart?: string; classEnd?: string };
type Announcement = { _id: string; title: string; content: string; createdAt?: string };
type TimetableItem = { _id: string; day: string; subject: string; time: string; room?: string };
type AcademicEvent = { _id: string; title: string; category: string; description?: string; startDate: string; endDate?: string };
type NotificationSummary = { unreadNotifications: number; unreadMessages: number; totalUnread: number };

function readDashboardGreeting() {
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return { userName: 'Student', prefix: '', semesterId: '', department: '' };

    const u = JSON.parse(storedUser) as { name?: string; gender?: string; currentSemesterId?: string; department?: string };
    const fullName = typeof u.name === 'string' ? u.name : 'Student';
    const first = fullName.split(' ')[0] || 'Student';

    let prefix = '';
    if (u.gender === 'male') prefix = 'Mr. ';
    else if (u.gender === 'female') prefix = 'Ms. ';

    return { userName: first, prefix, semesterId: u.currentSemesterId || '', department: u.department || '' };
  } catch {
    return { userName: 'Student', prefix: '', semesterId: '', department: '' };
  }
}

export default function DashboardPage() {
  const [{ userName, prefix, semesterId }] = useState(() => readDashboardGreeting());
  const [currentSemester, setCurrentSemester] = useState<Semester | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [timetablePreview, setTimetablePreview] = useState<TimetableItem[]>([]);
  const [academicEvents, setAcademicEvents] = useState<AcademicEvent[]>([]);
  const [dashboardError, setDashboardError] = useState('');
  const [notificationSummary, setNotificationSummary] = useState<NotificationSummary>({
    unreadMessages: 0,
    unreadNotifications: 0,
    totalUnread: 0,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      setDashboardError('');
      try {
        const [semesterRes, announcementsRes, notificationsRes, timetableRes, academicEventsRes] = await Promise.all([
          fetch('/api/semesters'),
          fetch('/api/admin/announcements'),
          fetchWithAuth('/api/notifications?limit=4'),
          semesterId ? fetchWithAuth(`/api/timetable?semesterId=${semesterId}`) : Promise.resolve(null),
          semesterId ? fetch(`/api/academic-events?semesterId=${semesterId}`) : Promise.resolve(null),
        ]);

        const semesterData = await semesterRes.json();
        if (semesterRes.ok && Array.isArray(semesterData)) {
          const active =
            semesterData.find((semester: Semester) => semester._id === semesterId) ||
            semesterData.find((semester: Semester) => semester.status === 'active') ||
            semesterData[0];
          setCurrentSemester(active || null);
        }

        const announcementData = await announcementsRes.json();
        if (announcementsRes.ok && Array.isArray(announcementData)) {
          setAnnouncements(announcementData.slice(0, 3));
        }

        const notificationData = await notificationsRes.json().catch(() => null);
        if (notificationsRes.ok && notificationData) {
          setNotificationSummary({
            unreadMessages: Number(notificationData.unreadMessages || 0),
            unreadNotifications: Number(notificationData.unreadNotifications || 0),
            totalUnread: Number(notificationData.totalUnread || 0),
          });
        }

        if (timetableRes) {
          const timetableData = await timetableRes.json();
          if (timetableRes.ok) {
            const merged = [
              ...(Array.isArray(timetableData.templates) ? timetableData.templates : []),
              ...(Array.isArray(timetableData.custom) ? timetableData.custom : []),
            ];
            setTimetablePreview(merged.slice(0, 4));
          }
        }

        if (academicEventsRes) {
          const eventData = await academicEventsRes.json();
          if (academicEventsRes.ok && Array.isArray(eventData)) {
            setAcademicEvents(eventData.slice(0, 4));
          }
        }
      } catch (error) {
        setDashboardError(error instanceof Error ? error.message : 'Some dashboard data could not be loaded.');
      }
    };

    void loadDashboard();
  }, [semesterId]);

  const quickActions = useMemo(
    () => [
      { title: 'AI Assistant', icon: Bot, href: '/dashboard/ai', desc: 'Study help and guided answers.' },
      { title: 'Semester Timetable', icon: Calendar, href: '/dashboard/timetable', desc: 'Official template plus your custom classes.' },
      { title: 'Notification Center', icon: Bell, href: '/dashboard/notifications', desc: 'Track announcements and connection activity.' },
    ],
    []
  );

  return (
    <div className="space-y-8 pb-12">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <CommandHero
          eyebrow="Campus Command Center"
          title={`Welcome back, ${prefix}${userName}`}
          description="One place for schedules, notices, academic milestones, and daily student flow."
          icon={TrendingUp}
          stats={[
            { label: 'Current semester', value: currentSemester?.name || 'No semester linked' },
            { label: 'Unread attention', value: notificationSummary.totalUnread, tone: 'mint' },
          ]}
        />
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quickActions.map((action, idx) => (
          <motion.div key={action.href} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
            <Link href={action.href}>
              <Card hover variant="bordered" className="h-full border border-white/10 bg-black/45">
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-cyan-200/10 p-3 text-cyan-100 ring-1 ring-white/10">
                    <action.icon size={20} />
                  </div>
                  <ArrowRight size={16} className="text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">{action.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{action.desc}</p>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {dashboardError ? (
        <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {dashboardError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border border-white/10 bg-black/40">
          <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
            <Megaphone size={18} className="text-cyan-200" />
            <h3 className="text-lg font-bold text-white">Live Announcements</h3>
          </div>
          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-sm text-slate-500">No new announcements.</p>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement._id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <p className="font-semibold text-white">{announcement.title}</p>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-400">{announcement.content}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="border border-white/10 bg-black/40">
          <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
            <Layers3 size={18} className="text-emerald-200" />
            <h3 className="text-lg font-bold text-white">Semester Snapshot</h3>
          </div>
          <div className="space-y-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Academic window</p>
              <p className="mt-2 text-sm text-slate-300">
                {currentSemester?.classStart ? new Date(currentSemester.classStart).toLocaleDateString() : 'TBD'} - {currentSemester?.classEnd ? new Date(currentSemester.classEnd).toLocaleDateString() : 'TBD'}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Timetable preview</p>
              <div className="mt-2 space-y-2">
                {timetablePreview.length === 0 ? (
                  <p className="text-sm text-slate-500">No classes loaded yet.</p>
                ) : (
                  timetablePreview.map((item) => (
                    <div key={item._id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-xs text-brand-purple">{item.day} / {item.time}</p>
                      <p className="mt-1 text-sm font-semibold text-white">{item.subject}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Academic events</p>
              <div className="mt-2 space-y-2">
                {academicEvents.length === 0 ? (
                  <p className="text-sm text-slate-500">No academic milestones published yet.</p>
                ) : (
                  academicEvents.map((event) => (
                    <div key={event._id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">{event.title}</p>
                        <span className="rounded-full border border-cyan-200/10 bg-cyan-200/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-100">
                          {event.category}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        {new Date(event.startDate).toLocaleDateString()}
                        {event.endDate ? ` to ${new Date(event.endDate).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
