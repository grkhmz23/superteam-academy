import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { MarketplaceCard } from "@/components/ui/marketplace-card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: React.ReactNode;
  value: React.ReactNode;
  detail?: React.ReactNode;
  className?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  className,
}: StatCardProps) {
  return (
    <MarketplaceCard className={cn("stat-card", className)} interactive>
      <CardContent className="flex items-start gap-4 p-5">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-muted/40 text-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          {detail ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p> : null}
        </div>
      </CardContent>
    </MarketplaceCard>
  );
}
