"use client";

import React, { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { Bell, Menu, LogOut, Loader2, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MobileNav } from './MobileNav';
import { Avatar } from '@/components/ui/Avatar';
import { fetchWithAuth, readApiError, uploadAsset } from '@/lib/client-api';

export function Navbar() {
  const router = useRouter();
  const [profilePic, setProfilePic] = useState('');
  const [profileName, setProfileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const prevMessageCount = useRef(0);
  const prevNotificationCount = useRef(0);

  const handleLogout = async () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        setProfilePic(user.profilePicture || '');
        setProfileName(user.name || '');
      }
    } catch {
      // ignore
    }

    const fetchNotificationState = async (isInitialTrigger = false) => {
      try {
        const res = await fetchWithAuth('/api/notifications?limit=5');

        if (res.ok) {
          const data = await res.json();
          const nextUnreadMessages = Number(data.unreadMessages || 0);
          const nextUnreadNotifications = Number(data.unreadNotifications || 0);

          setUnreadMessages(nextUnreadMessages);
          setUnreadNotifications(nextUnreadNotifications);

          if (nextUnreadMessages > prevMessageCount.current && !isInitialTrigger) {
            toast.success(
              `${nextUnreadMessages} new message${nextUnreadMessages > 1 ? 's' : ''} received`,
              { style: { fontSize: '12px', textTransform: 'lowercase' } }
            );
          }

          if (nextUnreadNotifications > prevNotificationCount.current && !isInitialTrigger) {
            toast.success('You have new notifications.', {
              style: { fontSize: '12px', textTransform: 'lowercase' },
            });
          }

          prevMessageCount.current = nextUnreadMessages;
          prevNotificationCount.current = nextUnreadNotifications;
        }
      } catch {
        // ignore
      }
    };

    void fetchNotificationState(true);
    const poller = setInterval(() => void fetchNotificationState(false), 15000);
    return () => clearInterval(poller);
  }, []);

  const handleUploadPhoto = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const asset = await uploadAsset(file, 'ulsan_profiles');

      const dbRes = await fetchWithAuth('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profilePicture: asset.url })
      });

      if (!dbRes.ok) {
        throw new Error(await readApiError(dbRes, "Database link failed"));
      }

      const { user } = await dbRes.json();

      localStorage.setItem('user', JSON.stringify(user));
      setProfilePic(asset.url);
      toast.success("Profile photo updated successfully!", {
        style: { background: 'rgba(0, 245, 255, 0.1)', border: '1px solid rgba(0, 245, 255, 0.2)' }
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to upload profile photo");
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }, []);

  const totalUnread = unreadMessages + unreadNotifications;

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-40 mx-0 h-16 border-b border-white/10 bg-[linear-gradient(180deg,rgba(8,12,22,0.95),rgba(8,12,22,0.86))] px-4 backdrop-blur-xl md:h-20 md:px-6"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-brand-indigo/60 via-brand-accent/40 to-transparent" />
        <div className="flex h-full items-center justify-between">

          <div className="flex items-center gap-2 md:gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileNavOpen(true)}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-2.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-brand-accent md:hidden"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </motion.button>

            <Link href="/dashboard" className="group flex items-center gap-3">
              <div className="hidden h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-brand-indigo shadow-[0_10px_24px_rgba(124,233,208,0.08)] md:flex">
                <span className="text-sm font-bold">UC</span>
              </div>
              <div>
                <span className="block text-lg font-bold tracking-tight text-white md:text-xl">Campus<span className="text-brand-accent">+</span></span>
                <span className="hidden text-[11px] uppercase tracking-[0.22em] text-slate-500 transition-colors group-hover:text-slate-400 md:block">Ulsan student command deck</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/dashboard/notifications"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-brand-accent"
                aria-label="Notifications"
              >
                <motion.div
                  animate={totalUnread > 0 ? { rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 0.5, repeat: totalUnread > 0 ? Infinity : 0, repeatDelay: 3 }}
                >
                  <Bell size={20} />
                </motion.div>
                {totalUnread > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="pointer-events-none absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#060b14] bg-gradient-to-br from-red-500 to-pink-500 px-1 text-[10px] font-bold text-white shadow-[0_0_18px_rgba(239,68,68,0.55)]"
                  >
                    {totalUnread > 9 ? '9+' : totalUnread}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="hidden items-center gap-2 rounded-2xl border border-red-400/12 bg-red-500/[0.07] px-3 py-2 text-red-300 transition-all hover:bg-red-500/[0.12] hover:text-red-200 md:flex"
              title="Log Out"
              aria-label="Log out"
            >
              <LogOut size={16} />
              <span className="text-sm font-medium">Logout</span>
            </motion.button>

            <input
              type="file"
              ref={fileRef}
              onChange={handleUploadPhoto}
              accept="image/*"
              className="hidden"
            />

            <motion.div
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileRef.current?.click()}
              className="group relative ml-1 flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full md:h-11 md:w-11"
              aria-label="Upload profile picture"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-accent to-brand-purple opacity-45 blur-md transition-opacity group-hover:opacity-70" />

              <div className="absolute inset-[2px] overflow-hidden rounded-full border-2 border-white/18 bg-black/80 transition-colors group-hover:border-brand-accent/50">
                {isUploading ? (
                  <Loader2 size={18} className="m-auto text-brand-accent animate-spin" />
                ) : profilePic ? (
                  <Avatar src={profilePic} name={profileName} className="h-full w-full border-0 text-sm" />
                ) : (
                  <Avatar name={profileName} className="h-full w-full border-0 text-sm" />
                )}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm"
              >
                <Camera size={16} className="text-white" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} onLogout={() => void handleLogout()} />
    </>
  );
}
