import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { MarketplaceCard } from "@/components/ui/marketplace-card";
import { cn } from "@/lib/utils";

interface PremiumEmptyStateProps {
  icon: LucideIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function PremiumEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: PremiumEmptyStateProps) {
  return (
    <MarketplaceCard className={cn("premium-empty-state-surface", className)}>
      <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center md:px-10">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-border/70 bg-background/80 text-muted-foreground shadow-sm">
          <Icon className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground md:text-base">
            {description}
          </p>
        ) : null}
        {action ? <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{action}</div> : null}
      </CardContent>
    </MarketplaceCard>
  );
}
