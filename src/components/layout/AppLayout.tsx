import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { AppToaster } from '@/components/ui/AppToaster';
import { CommandPalette } from './CommandPalette';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[url('/campus_bg.png')] bg-cover bg-center opacity-[0.12]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,13,0.64),rgba(4,7,13,0.98))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,233,208,0.12),transparent_32%),radial-gradient(circle_at_top_right,rgba(140,123,255,0.15),transparent_26%)]" />
      </div>

      <Navbar />
      <Sidebar />
      <AppToaster />
      <CommandPalette />

      <main className="relative z-10 min-h-screen min-w-0 pt-20 md:pt-24 lg:pl-64">
        <div className="mx-auto min-w-0 max-w-[1480px] px-3 pb-8 sm:px-4 md:px-6 md:pb-10 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
