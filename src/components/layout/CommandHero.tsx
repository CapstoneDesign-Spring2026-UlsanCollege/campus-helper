"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatItem {
  label: string;
  value: string | number;
  tone?: "default" | "accent" | "mint" | "warn";
}

interface CommandHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  stats?: StatItem[];
  accentClassName?: string;
  className?: string;
}

const toneClasses: Record<NonNullable<StatItem["tone"]>, string> = {
  default: "text-white",
  accent: "text-brand-accent",
  mint: "text-brand-indigo",
  warn: "text-amber-200",
};

export function CommandHero({
  eyebrow,
  title,
  description,
  icon: Icon,
  stats = [],
  accentClassName = "text-brand-indigo",
  className,
}: CommandHeroProps) {
  return (
    <section className={cn("hero-surface p-6 md:p-8", className)}>
      <div className="relative z-10 grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
        <div className="max-w-3xl">
          <div className="section-kicker">
            <Icon size={13} className={accentClassName} />
            <span>{eyebrow}</span>
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-tight text-white md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
            {description}
          </p>
        </div>

        {stats.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[22px] border border-white/10 bg-black/28 px-4 py-4 backdrop-blur"
              >
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
                  {stat.label}
                </p>
                <p className={cn("mt-2 text-xl font-semibold", toneClasses[stat.tone || "default"])}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
