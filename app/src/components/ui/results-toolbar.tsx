import * as React from "react";
import { cn } from "@/lib/utils";

interface ResultsToolbarProps {
  resultsLabel?: React.ReactNode;
  sortControl?: React.ReactNode;
  viewToggle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function ResultsToolbar({
  resultsLabel,
  sortControl,
  viewToggle,
  actions,
  className,
}: ResultsToolbarProps) {
  return (
    <div
      className={cn(
        "marketplace-toolbar flex flex-col gap-3 rounded-[1.25rem] px-4 py-3 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {resultsLabel ? <div className="truncate">{resultsLabel}</div> : null}
        {sortControl ? <div className="flex flex-wrap items-center gap-2">{sortControl}</div> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {viewToggle}
        {actions}
      </div>
    </div>
  );
}
