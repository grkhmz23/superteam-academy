import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MarketplaceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: boolean;
  interactive?: boolean;
}

export function MarketplaceCard({
  accent = false,
  interactive = false,
  className,
  children,
  ...props
}: MarketplaceCardProps) {
  return (
    <Card
      className={cn(
        "marketplace-panel relative overflow-hidden rounded-[1.5rem] border-border/70 bg-card/95",
        interactive && "marketplace-card-hover",
        className
      )}
      {...props}
    >
      {accent ? <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" /> : null}
      {children}
    </Card>
  );
}
