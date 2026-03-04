"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type GlowColor = "none" | "purple" | "amber" | "emerald" | "blue" | "indigo" | "slate";

const glowClass: Record<Exclude<GlowColor, "none">, string> = {
  purple: "bg-purple-500/10",
  amber: "bg-amber-500/10",
  emerald: "bg-emerald-500/10",
  blue: "bg-blue-500/10",
  indigo: "bg-indigo-500/10",
  slate: "bg-slate-500/10",
};

export function GlassCard({
  children,
  className,
  glowColor = "none",
}: {
  children: ReactNode;
  className?: string;
  glowColor?: GlowColor;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/95 shadow-sm backdrop-blur-md",
        className
      )}
    >
      {glowColor !== "none" && (
        <div
          className={cn(
            "pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full blur-[64px]",
            glowClass[glowColor]
          )}
        />
      )}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

export function LuxuryBadge({
  children,
  color = "purple",
  className,
}: {
  children: ReactNode;
  color?: "purple" | "amber" | "emerald" | "slate" | "blue";
  className?: string;
}) {
  const colors = {
    purple: "border-primary/15 bg-primary/10 text-foreground",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    slate: "border-border bg-muted/50 text-foreground",
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  };

  return (
    <span
      className={cn(
        "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
        colors[color],
        className
      )}
    >
      {children}
    </span>
  );
}
