import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden text-foreground">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[url('/campus_bg.png')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,7,0.76),rgba(3,8,7,0.98))]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] opacity-40" />
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
