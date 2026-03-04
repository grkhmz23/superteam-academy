import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SegmentedTabsOption {
  value: string;
  label: React.ReactNode;
}

interface SegmentedTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SegmentedTabsOption[];
  className?: string;
}

export function SegmentedTabs({
  value,
  onValueChange,
  options,
  className,
}: SegmentedTabsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Button
            key={option.value}
            type="button"
            variant={active ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onValueChange(option.value)}
            className={cn(
              "rounded-xl border text-xs",
              active
                ? "border-border bg-card text-foreground shadow-sm"
                : "border-transparent text-muted-foreground hover:border-border/70 hover:bg-muted/40 hover:text-foreground"
            )}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
