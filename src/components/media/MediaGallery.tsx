"use client";

import React, { useMemo, useState } from "react";
import { ImageIcon, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MediaGalleryProps {
  images?: string[];
  alt: string;
  icon?: LucideIcon;
  accentClassName?: string;
  className?: string;
}

export function MediaGallery({
  images = [],
  alt,
  icon: EmptyIcon = ImageIcon,
  accentClassName = "text-brand-accent",
  className,
}: MediaGalleryProps) {
  const validImages = useMemo(
    () => images.filter((image): image is string => typeof image === "string" && image.trim().length > 0),
    [images]
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);

  const safeActiveIndex = Math.min(activeIndex, Math.max(validImages.length - 1, 0));
  const activeImage = validImages[safeActiveIndex];
  const showFallback = !activeImage || failedImages.includes(activeImage);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 aspect-[4/3]">
        {!showFallback ? (
          <motion.img
            key={activeImage}
            initial={{ opacity: 0.6, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            src={activeImage}
            alt={alt}
            className="h-full w-full object-cover"
            onError={() => {
              if (!activeImage) return;
              setFailedImages((current) => (current.includes(activeImage) ? current : [...current, activeImage]));
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(160deg,rgba(14,24,34,0.92),rgba(4,8,18,0.98))]">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <EmptyIcon className={cn("h-10 w-10", accentClassName)} />
              </div>
              <p className="text-xs uppercase tracking-[0.28em] text-gray-500">No preview available</p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {validImages.length > 1 && (
          <div className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-white">
            {safeActiveIndex + 1} / {validImages.length}
          </div>
        )}
      </div>

      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {validImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border transition-all",
                index === safeActiveIndex
                  ? "border-brand-indigo shadow-[0_0_0_1px_rgba(45,212,191,0.55)]"
                  : "border-white/10 opacity-70 hover:opacity-100"
              )}
            >
              <img src={image} alt={`${alt} preview ${index + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
