"use client";

import React, { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { User, Bell, Menu, LogOut, Loader2, Camera, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MobileNav } from './MobileNav';

export function Navbar() {
  const router = useRouter();
  const [profilePic, setProfilePic] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const prevCount = useRef(0);

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
         setProfilePic(JSON.parse(stored).profilePicture || '');
      }
    } catch(e) {}

    // Passive Ping Engine for Dynamic Inbox Tallying
    const fetchUnreads = async (isInitialTrigger = false) => {
       const token = localStorage.getItem('accessToken');
       if(!token) return;
       try {
          const res = await fetch('/api/chat/unread', { headers: { 'Authorization': `Bearer ${token}` } });
          if(res.ok) {
             const data = await res.json();
             setUnreadCount(data.count);
             if(data.count > 0 && (isInitialTrigger || data.count > prevCount.current)) {
                toast.success(`${data.count} new message${data.count > 1 ? 's' : ''} received`, { icon: '💬', style: { fontSize: '12px', textTransform: 'lowercase' } });
             }
             prevCount.current = data.count;
          }
       } catch(e) {}
    };

    fetchUnreads(true);
    const poller = setInterval(() => fetchUnreads(false), 15000);
    return () => clearInterval(poller);
  }, []);

  const handleUploadPhoto = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if(!file) return;

     if (!file.type.startsWith('image/')) {
       toast.error("Please select a valid image file");
       return;
     }

     if (file.size > 5 * 1024 * 1024) {
       toast.error("Image must be less than 5MB");
       return;
     }

     setIsUploading(true);
     const fd = new FormData();
     fd.append('file', file);

     try {
       const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
       if (!uploadRes.ok) {
         const error = await uploadRes.json().catch(() => ({ error: 'Upload failed' }));
         throw new Error(error.error || "Cloudinary upload failed");
       }

       const { url } = await uploadRes.json();

       const dbRes = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({ profilePicture: url })
       });

       if (!dbRes.ok) {
         const error = await dbRes.json().catch(() => ({ error: 'Database update failed' }));
         throw new Error(error.error || "Database link failed");
       }

       const { user } = await dbRes.json();

       localStorage.setItem('user', JSON.stringify(user));
       setProfilePic(url);
       toast.success("Profile photo updated successfully!", {
         icon: '✨',
         style: { background: 'rgba(0, 245, 255, 0.1)', border: '1px solid rgba(0, 245, 255, 0.2)' }
       });
     } catch (err: any) {
       toast.error(err.message || "Failed to upload profile photo");
     } finally {
       setIsUploading(false);
       if(fileRef.current) fileRef.current.value = '';
     }
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 h-16 md:h-20 z-40 glass-panel border-b border-white/10 px-4 md:px-6 flex items-center justify-between"
      >
        {/* Top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-brand-accent/50 via-brand-purple/50 to-transparent" />

        <div className="flex items-center gap-3 md:gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileNavOpen(true)}
            className="md:hidden p-2 text-gray-300 hover:text-brand-accent rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </motion.button>

          <Link href="/dashboard" className="text-lg md:text-xl font-bold tracking-tight text-white group">
            ULSAN CAMPUS<span className="text-brand-accent">+</span>
            <span className="hidden md:inline-block ml-2 text-xs text-gray-500 font-normal group-hover:text-brand-accent/70 transition-colors">Dashboard</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Notifications - Enhanced */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/dashboard/chat"
              className="relative p-2 text-gray-300 hover:text-brand-accent rounded-full hover:bg-white/10 transition-colors"
              aria-label="Notifications"
            >
              <motion.div
                animate={unreadCount > 0 ? { rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 0.5, repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 3 }}
              >
                <Bell size={20} />
              </motion.div>
              {unreadCount > 0 && (
                 <motion.span
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   className="absolute top-0.5 right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-gradient-to-br from-red-500 to-pink-500 rounded-full border-2 border-black shadow-[0_0_15px_rgba(239,68,68,0.6)] text-white text-[10px] font-bold pointer-events-none"
                 >
                    {unreadCount > 9 ? '9+' : unreadCount}
                 </motion.span>
              )}
            </Link>
          </motion.div>

          {/* Logout - Desktop only */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 px-3 py-2 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all"
            title="Log Out"
            aria-label="Log out"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </motion.button>

          {/* Profile Picture Upload - Enhanced */}
          <input
            type="file"
            ref={fileRef}
            onChange={handleUploadPhoto}
            accept="image/*"
            className="hidden"
          />

          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => fileRef.current?.click()}
            className="relative h-9 w-9 md:h-10 md:w-10 ml-1 rounded-full flex items-center justify-center cursor-pointer overflow-hidden group"
            aria-label="Upload profile picture"
          >
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-accent to-brand-purple opacity-50 blur-md group-hover:opacity-80 transition-opacity" />

            {/* Main container */}
            <div className="absolute inset-[2px] rounded-full overflow-hidden bg-black/80 border-2 border-white/20 group-hover:border-brand-accent/50 transition-colors">
              {isUploading ? (
                 <Loader2 size={18} className="text-brand-accent animate-spin m-auto" />
              ) : profilePic ? (
                 <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                 <User size={18} className="text-white/80 m-auto" />
              )}
            </div>

            {/* Camera overlay on hover */}
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm rounded-full"
            >
               <Camera size={16} className="text-white" />
            </motion.div>
          </motion.div>
        </div>
      </motion.nav>

      {/* Mobile Navigation */}
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
    </>
  );
}
