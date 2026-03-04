import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { MarketplaceCard } from "@/components/ui/marketplace-card";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  href: string;
  icon: LucideIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}

export function FeatureCard({
  href,
  icon: Icon,
  title,
  description,
  meta,
  className,
}: FeatureCardProps) {
  return (
    <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-[1.5rem]">
      <MarketplaceCard className={cn("premium-card-hover h-full", className)} interactive>
        <CardContent className="flex h-full flex-col gap-4 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-muted/40 text-foreground">
            <Icon className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            {description ? <p className="text-sm leading-6 text-muted-foreground">{description}</p> : null}
          </div>
          <div className="mt-auto flex items-center justify-between gap-2 text-sm text-muted-foreground">
            <span className="truncate">{meta}</span>
            <ArrowRight className="h-4 w-4 flex-shrink-0" />
          </div>
        </CardContent>
      </MarketplaceCard>
    </Link>
  );
}
