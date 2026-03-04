import * as React from "react";
import { cn } from "@/lib/utils";

export interface SegmentedFilterOption {
  value: string;
  label: React.ReactNode;
}

interface SegmentedFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SegmentedFilterOption[];
  ariaLabel: string;
  className?: string;
}

export function SegmentedFilter({
  value,
  onValueChange,
  options,
  ariaLabel,
  className,
}: SegmentedFilterProps) {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
      return;
    }

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (activeIndex + direction + options.length) % options.length;
    onValueChange(options[nextIndex].value);
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "brand-pill rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              active
                ? "border-border bg-card text-foreground shadow-sm"
                : "border-border/60 bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
