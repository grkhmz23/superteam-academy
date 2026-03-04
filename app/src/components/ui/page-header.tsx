import * as React from "react";
import { HeroBadge, type HeroBadgeProps } from "@/components/ui/hero-badge";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode | HeroBadgeProps;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  illustration?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  icon,
  actions,
  illustration,
  className,
}: PageHeaderProps) {
  const resolvedBadge =
    badge && typeof badge === "object" && !React.isValidElement(badge) && "label" in badge ? (
      <HeroBadge {...(badge as HeroBadgeProps)} />
    ) : (
      badge
    );

  return (
    <header
      className={cn(
        "hero-surface p-5 md:p-7",
        className
      )}
    >
      <div className="page-hero-glow hero-glow" />
      <div className="hero-orb hero-orb-primary" />
      <div className="hero-orb hero-orb-secondary" />
      <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0 space-y-5">
          {resolvedBadge}
          <div className="space-y-4">
            {icon ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-background/80 text-foreground shadow-sm">
                {icon}
              </div>
            ) : null}
            <div className="space-y-3">
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                {title}
              </h1>
              {description ? (
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
        </div>
        {illustration || actions ? (
          <div className="flex flex-col gap-4 xl:min-w-[17rem] xl:items-end">
            {illustration ? <div className="hero-illustration">{illustration}</div> : null}
            {actions ? <div className="hero-actions">{actions}</div> : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
