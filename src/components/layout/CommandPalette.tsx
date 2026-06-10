"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Command,
  FileUp,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { dashboardNavItems } from "@/lib/navigation";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

type CommandAction = {
  label: string;
  description: string;
  href: string;
  keywords: string;
  icon: React.ElementType;
};

const commandActions: CommandAction[] = [
  {
    label: "Upload a note",
    description: "Open Notes and add a study file",
    href: "/dashboard/notes?compose=1",
    keywords: "notes upload study pdf image document",
    icon: FileUp,
  },
  {
    label: "Create marketplace listing",
    description: "Publish an item for students",
    href: "/dashboard/market?compose=1",
    keywords: "market marketplace sell item listing create",
    icon: Plus,
  },
  {
    label: "Report lost or found item",
    description: "Create a campus lost-found report",
    href: "/dashboard/lost-found?compose=1",
    keywords: "lost found report item campus",
    icon: Plus,
  },
  {
    label: "Open AI assistant",
    description: "Ask about notes, listings, and campus items",
    href: "/dashboard/ai",
    keywords: "ai assistant search ask help",
    icon: Sparkles,
  },
  {
    label: "Open chat",
    description: "Continue conversations",
    href: "/dashboard/chat",
    keywords: "chat messages dm conversation",
    icon: MessageCircle,
  },
];

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  useBodyScrollLock(isOpen);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen(true);
      }

      if (event.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    const routes: CommandAction[] = dashboardNavItems.map((item) => ({
      label: item.label,
      description: `Go to ${item.label}`,
      href: item.href,
      keywords: `${item.label} ${item.href}`.toLowerCase(),
      icon: item.icon,
    }));

    const allActions = [...commandActions, ...routes];
    if (!normalized) return allActions;

    return allActions.filter((action) => {
      const searchable = `${action.label} ${action.description} ${action.keywords}`.toLowerCase();
      return searchable.includes(normalized);
    });
  }, [query]);

  const closePalette = () => {
    setIsOpen(false);
    setQuery("");
  };

  const openAction = (href: string) => {
    if (href.includes("compose=1") && typeof window !== "undefined") {
      const target = new URL(href, window.location.origin);
      sessionStorage.setItem("campus:open-composer", target.pathname);

      if (window.location.pathname === target.pathname) {
        window.dispatchEvent(new CustomEvent("campus:open-composer", { detail: { pathname: target.pathname } }));
      }
    }

    closePalette();
    router.push(href);
  };

  return (
    <>
      <motion.button
        type="button"
        whileHover={{ scale: 1.04, y: -1 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 hidden min-h-[46px] items-center gap-2 rounded-2xl border border-white/10 bg-[#071018]/85 px-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-200 shadow-[0_18px_50px_rgba(0,0,0,0.38)] backdrop-blur-xl transition hover:border-brand-indigo/40 hover:text-white md:inline-flex"
        aria-label="Open command palette"
      >
        <Command size={15} className="text-brand-indigo" />
        Command
        <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-slate-400">
          Ctrl K
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-start justify-center overflow-y-auto bg-black/72 px-3 py-16 backdrop-blur-md sm:px-4 md:py-24"
            onClick={closePalette}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 18 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative w-full max-w-2xl overflow-hidden rounded-[22px] border border-white/12 bg-[#070b15] shadow-2xl shadow-black/60 md:rounded-[28px]"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="command-palette-title"
            >
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(124,233,208,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,192,113,0.08),transparent_32%)]" />
              <div className="relative border-b border-white/10 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand-indigo">
                      Campus command
                    </p>
                    <h2 id="command-palette-title" className="mt-1 text-xl font-semibold text-white">
                      Jump anywhere
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={closePalette}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                    aria-label="Close command palette"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex min-h-[54px] items-center gap-3 rounded-2xl border border-white/10 bg-black/32 px-4">
                  <Search size={18} className="text-slate-500" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    autoFocus
                    placeholder="Search pages, uploads, chat, AI..."
                    className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="relative max-h-[54vh] overflow-y-auto p-3">
                {results.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center">
                    <p className="text-sm font-semibold text-white">No command found</p>
                    <p className="mt-2 text-sm text-slate-500">Try notes, market, chat, timetable, or AI.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {results.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={`${action.href}-${action.label}`}
                          type="button"
                          onClick={() => openAction(action.href)}
                          className="group flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-left transition hover:border-brand-indigo/20 hover:bg-brand-indigo/8"
                        >
                          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-brand-accent transition group-hover:border-brand-indigo/30 group-hover:text-brand-indigo">
                            <Icon size={19} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-white">{action.label}</span>
                            <span className="mt-0.5 block truncate text-xs text-slate-500">{action.description}</span>
                          </span>
                          <ArrowRight size={16} className="text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-brand-indigo" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="relative flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-slate-600">
                <span>Enter opens command</span>
                <span>Esc closes</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => openAction("/dashboard/notes?compose=1")}
        className="fixed bottom-5 right-5 z-40 inline-flex h-13 w-13 items-center justify-center rounded-full border border-brand-indigo/25 bg-brand-indigo/14 text-brand-indigo shadow-[0_18px_50px_rgba(0,0,0,0.42)] backdrop-blur-xl md:hidden"
        aria-label="Quick upload note"
      >
        <Plus size={22} />
      </button>
    </>
  );
}
