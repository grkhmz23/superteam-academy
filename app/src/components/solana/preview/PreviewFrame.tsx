"use client";

import React from "react";
import type { ReactNode } from "react";
import { MarketplaceCard } from "@/components/ui/marketplace-card";

interface PreviewFrameProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function PreviewFrame({
  icon,
  title,
  subtitle,
  children,
}: PreviewFrameProps) {
  return (
    <MarketplaceCard className="rounded-[1.5rem] border-border/70 bg-card/95 p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-muted/35 text-foreground">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </MarketplaceCard>
  );
}
