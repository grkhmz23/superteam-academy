"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SegmentedTabs, type SegmentedTabsOption } from "@/components/ui/segmented-tabs";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseCatalogToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchIconClass: string;
  searchInputClass: string;
  difficulty: string;
  onDifficultyChange: (value: string) => void;
  difficultyOptions: SegmentedTabsOption[];
  category: string;
  onCategoryChange: (value: string) => void;
  categoryOptions: Array<{ value: string; label: string }>;
  resultsLabel: string;
}

export function CourseCatalogToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  searchIconClass,
  searchInputClass,
  difficulty,
  onDifficultyChange,
  difficultyOptions,
  category,
  onCategoryChange,
  categoryOptions,
  resultsLabel,
}: CourseCatalogToolbarProps) {
  return (
    <div className="catalog-toolbar sticky top-24 z-10 rounded-[1.5rem] p-4 md:p-5">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              className={cn(
                "pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                searchIconClass
              )}
            />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className={cn("h-11 rounded-2xl border-border/70 bg-background/80", searchInputClass)}
            />
          </div>
          <Badge variant="outline" className="w-fit border-border/70 bg-background/80 text-muted-foreground">
            {resultsLabel}
          </Badge>
        </div>
        <SegmentedTabs
          value={difficulty}
          onValueChange={onDifficultyChange}
          options={difficultyOptions}
        />
        <div className="academy-scrollbar flex flex-wrap gap-2 overflow-x-auto pb-1">
          {categoryOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onCategoryChange(option.value)}
              className={cn(
                "rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                category === option.value
                  ? "border-border bg-card text-foreground shadow-sm"
                  : "border-border/60 bg-background/70 text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
