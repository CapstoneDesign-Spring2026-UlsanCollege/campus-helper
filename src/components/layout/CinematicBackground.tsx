"use client";

export function CinematicBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/campus_bg.png')] bg-cover bg-center opacity-25" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,7,0.68),rgba(3,8,7,0.98))]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] opacity-35" />
    </div>
  );
}
