import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden text-foreground">
      {/* Background Animated Orbs & Cinematic Wallpaper */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[url('/campus_bg.png')] bg-cover bg-center opacity-30 mix-blend-screen scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-0" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-purple/30 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-indigo/30 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      <Navbar />
      <Sidebar />

      <main className="relative z-10 pt-16 md:pt-24 md:pl-64 min-h-screen">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
