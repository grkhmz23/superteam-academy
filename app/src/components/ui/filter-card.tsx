import * as React from "react";
import { SlidersHorizontal } from "lucide-react";
import { SectionCard } from "@/components/ui/section-card";

interface FilterCardProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function FilterCard({
  title,
  description,
  children,
  footer,
  className,
}: FilterCardProps) {
  return (
    <SectionCard
      className={className}
      title={
        <span className="flex items-center gap-2 text-base">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          {title}
        </span>
      }
      description={description}
      contentClassName="space-y-5"
    >
      {children}
      {footer ? <div className="border-t border-border/70 pt-4">{footer}</div> : null}
    </SectionCard>
  );
}
