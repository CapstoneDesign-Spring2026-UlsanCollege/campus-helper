"use client";

import React from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

type AvatarProps = {
  src?: string | null;
  name?: string | null;
  className?: string;
  imageClassName?: string;
};

export function Avatar({ src, name, className, imageClassName }: AvatarProps) {
  const [failed, setFailed] = React.useState(false);
  const initials = (name || "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  React.useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-gradient-to-br from-cyan-400/25 via-emerald-300/15 to-white/10 text-white shadow-inner shadow-white/10",
        className
      )}
      title={name || "Profile"}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={name ? `${name}'s profile picture` : "Profile picture"}
          className={cn("h-full w-full object-cover", imageClassName)}
          onError={() => setFailed(true)}
        />
      ) : initials ? (
        <span className="text-[0.7em] font-black leading-none tracking-normal">
          {initials}
        </span>
      ) : (
        <User size="55%" className="text-white/75" />
      )}
    </div>
  );
}
