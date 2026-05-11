"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, CheckCheck, ChevronRight, Megaphone, MessageCircle, UserCheck, UserPlus } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { CommandHero } from '@/components/layout/CommandHero';
import { fetchWithAuth, readApiError } from '@/lib/client-api';

type NotificationItem = {
  _id: string;
  type: 'friend_request' | 'friend_accept' | 'announcement';
  title: string;
  body: string;
  link: string;
  read: boolean;
  createdAt: string;
};

function getNotificationIcon(type: NotificationItem['type']) {
  switch (type) {
    case 'friend_request':
      return UserPlus;
    case 'friend_accept':
      return UserCheck;
    case 'announcement':
      return Megaphone;
    default:
      return Bell;
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth('/api/notifications?limit=30');
      const data = await res.json();
      if (res.ok) {
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
        setUnreadNotifications(Number(data.unreadNotifications || 0));
        setUnreadMessages(Number(data.unreadMessages || 0));
      } else {
        toast.error(data.error || 'Could not load notifications.');
      }
    } catch {
      toast.error('Could not load notifications.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const markNotificationRead = async (notificationId: string) => {
    setNotifications((current) => current.map((item) => item._id === notificationId ? { ...item, read: true } : item));
    setUnreadNotifications((current) => Math.max(0, current - 1));

    try {
      const res = await fetchWithAuth('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });
      if (!res.ok) {
        throw new Error(await readApiError(res, 'Could not mark notification as read.'));
      }
    } catch {
      void fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    try {
      const res = await fetchWithAuth('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markAll: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not mark notifications as read.');

      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
      setUnreadNotifications(0);
      toast.success('Notifications marked as read.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not mark notifications as read.');
    } finally {
      setIsMarkingAll(false);
    }
  };

  const totalUnread = unreadNotifications + unreadMessages;
  const summary = useMemo(() => [
    { label: 'Unread notifications', value: unreadNotifications, accent: 'text-cyan-200' },
    { label: 'Unread chat messages', value: unreadMessages, accent: 'text-emerald-200' },
    { label: 'Combined unread items', value: totalUnread, accent: 'text-white' },
  ], [totalUnread, unreadMessages, unreadNotifications]);

  return (
    <div className="space-y-8 pb-12">
      <div className="space-y-4">
        <CommandHero
          eyebrow="Notification Center"
          title="Notifications"
          description="Track new campus alerts, connection activity, and chat attention without mixing them together."
          icon={Bell}
          stats={[
            { label: 'Unread notifications', value: unreadNotifications, tone: 'mint' },
            { label: 'Unread chat messages', value: unreadMessages, tone: 'accent' },
          ]}
        />
        <div className="flex justify-end">
          <Button
            type="button"
            variant="glass"
            onClick={handleMarkAllRead}
            disabled={isMarkingAll || unreadNotifications === 0}
            className={unreadNotifications === 0 ? 'text-gray-500' : ''}
          >
            <CheckCheck size={14} />
            {unreadNotifications === 0 ? 'No Unread Alerts' : 'Mark Alerts Read'}
          </Button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {summary.map((item, index) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card className="border border-white/10 bg-black/35 p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">{item.label}</p>
              <p className={`mt-3 text-3xl font-bold ${item.accent}`}>{item.value}</p>
            </Card>
          </motion.div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="overflow-hidden border border-white/10 bg-black/35 p-0">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="text-base font-bold text-white">Activity Feed</h2>
              <p className="text-xs text-gray-500">Persistent alerts for account activity and campus updates.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="px-5 py-12 text-center text-sm text-gray-500">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="px-5 py-14 text-center text-gray-500">
              <Bell size={40} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm">You&apos;re all caught up.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((notification, index) => {
                const Icon = getNotificationIcon(notification.type);
                return (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`group flex flex-col gap-4 px-5 py-4 transition-colors md:flex-row md:items-center md:justify-between ${notification.read ? 'bg-transparent' : 'bg-cyan-200/[0.04]'}`}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className={`mt-0.5 rounded-full border p-2 ${notification.read ? 'border-white/10 bg-white/5 text-gray-400' : 'border-cyan-200/25 bg-cyan-200/10 text-cyan-200'}`}>
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-white">{notification.title}</h3>
                          {!notification.read && <span className="h-2 w-2 rounded-full bg-cyan-200" />}
                        </div>
                        <p className="mt-1 text-sm text-gray-400">{notification.body}</p>
                        <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-gray-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {!notification.read && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => markNotificationRead(notification._id)}
                          className="h-9 px-3 text-[10px] uppercase tracking-[0.2em] border border-white/10 bg-white/5 text-white hover:bg-white/10"
                        >
                          Mark Read
                        </Button>
                      )}
                      <Link
                        href={notification.link}
                        onClick={() => {
                          if (!notification.read) {
                            void markNotificationRead(notification._id);
                          }
                        }}
                        className="inline-flex h-9 items-center rounded-lg border border-white/10 bg-white/5 px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/10"
                      >
                        Open
                        <ChevronRight size={14} className="ml-1" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="border border-white/10 bg-black/35">
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-emerald-200/15 bg-emerald-200/10 p-3 text-emerald-200">
                <MessageCircle size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Message Inbox</h3>
                <p className="text-xs text-gray-500">Unread chat messages still open directly in chat.</p>
              </div>
            </div>
            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-emerald-200">{unreadMessages}</p>
                <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Unread messages</p>
              </div>
              <Link href="/dashboard/chat">
                <Button type="button" className="bg-emerald-300 text-black hover:bg-emerald-200">
                  Open Chat
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="border border-white/10 bg-black/35">
            <h3 className="text-base font-bold text-white">What shows up here</h3>
            <ul className="mt-4 space-y-3 text-sm text-gray-400">
              <li>Friend requests sent to you</li>
              <li>Accepted connection requests</li>
              <li>New admin announcements</li>
              <li>Unread message total in the summary card</li>
            </ul>
          </Card>
        </div>
      </section>
    </div>
  );
}
