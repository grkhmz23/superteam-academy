import * as React from "react";
import { cn } from "@/lib/utils";

interface MarketplaceShellProps {
  header?: React.ReactNode;
  filters?: React.ReactNode;
  toolbar?: React.ReactNode;
  content?: React.ReactNode;
  empty?: React.ReactNode;
  loading?: React.ReactNode;
  isLoading?: boolean;
  hasResults?: boolean;
  stickyFilters?: boolean;
  className?: string;
  filtersClassName?: string;
  contentClassName?: string;
}

export function MarketplaceShell({
  header,
  filters,
  toolbar,
  content,
  empty,
  loading,
  isLoading = false,
  hasResults = true,
  stickyFilters = true,
  className,
  filtersClassName,
  contentClassName,
}: MarketplaceShellProps) {
  const body = isLoading ? loading : hasResults ? content : empty;

  return (
    <div className={cn("space-y-6", className)} data-testid="marketplace-shell">
      {header}
      <div
        className={cn(
          "grid gap-6",
          filters ? "lg:grid-cols-[minmax(16rem,19rem)_minmax(0,1fr)]" : "grid-cols-1"
        )}
      >
        {filters ? (
          <aside className={cn("min-w-0", stickyFilters && "lg:sticky lg:top-24 lg:self-start", filtersClassName)}>
            {filters}
          </aside>
        ) : null}
        <div className={cn("min-w-0 space-y-4", contentClassName)}>
          {toolbar}
          {body}
        </div>
      </div>
    </div>
  );
}
