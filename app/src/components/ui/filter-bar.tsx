import * as React from "react";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  searchSlot?: React.ReactNode;
  segmentsSlot?: React.ReactNode;
  resultsSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
  sticky?: boolean;
  className?: string;
}

export function FilterBar({
  searchSlot,
  segmentsSlot,
  resultsSlot,
  actionsSlot,
  sticky = false,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "marketplace-toolbar flex flex-col gap-3 rounded-[1.25rem] px-4 py-3",
        sticky && "sticky top-24 z-10",
        className
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          {searchSlot}
          {resultsSlot ? <div className="min-w-0 text-sm text-muted-foreground">{resultsSlot}</div> : null}
        </div>
        {actionsSlot ? <div className="flex flex-wrap items-center gap-2">{actionsSlot}</div> : null}
      </div>
      {segmentsSlot ? <div className="flex flex-wrap items-center gap-2">{segmentsSlot}</div> : null}
    </div>
  );
}
