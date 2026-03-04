import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeroBadgeProps {
  label: React.ReactNode;
  icon?: LucideIcon;
  variant?: "brand" | "category";
  className?: string;
}

export function HeroBadge({
  label,
  icon: Icon,
  variant = "brand",
  className,
}: HeroBadgeProps) {
  return (
    <span
      className={cn(
        "hero-eyebrow",
        variant === "brand" ? "hero-accent-glow" : "bg-background/80",
        className
      )}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      <span>{label}</span>
    </span>
  );
}
