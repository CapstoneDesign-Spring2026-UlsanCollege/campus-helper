"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface StudioHeroProps {
  badge: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accentClassName?: string;
}

export function StudioHero({
  badge,
  title,
  description,
  icon: Icon,
  accentClassName = "text-brand-accent",
}: StudioHeroProps) {
  return (
    <Card className="hero-surface p-0">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px] opacity-[0.07]" />
      <div className="relative grid gap-5 px-4 py-5 sm:px-5 md:grid-cols-[1fr_auto] md:px-8 md:py-9">
        <div className="max-w-2xl">
          <div className="section-kicker">
            <Icon size={13} className={accentClassName} />
            <span>{badge}</span>
          </div>
          <h1 className="mt-4 max-w-3xl text-2xl font-semibold tracking-tight text-white sm:text-3xl md:mt-5 md:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300 md:text-base md:leading-7">{description}</p>
        </div>
        <div className="hidden items-start justify-end md:flex">
          <div className="rounded-[28px] border border-white/10 bg-black/40 p-5 shadow-2xl backdrop-blur">
            <Icon className={cn("h-10 w-10", accentClassName)} />
          </div>
        </div>
      </div>
    </Card>
  );
}
