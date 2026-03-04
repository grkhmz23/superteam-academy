import * as React from "react";
import { Link } from "@/lib/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Code2, PlayCircle } from "lucide-react";
import type { LessonType } from "@/types/content";

interface LessonRowProps {
  href: string;
  index: number;
  title: string;
  duration: string;
  xpReward: number;
  xpLabel: string;
  completedLabel: string;
  openLabel: string;
  completed?: boolean;
  type: LessonType;
}

export function LessonRow({
  href,
  index,
  title,
  duration,
  xpReward,
  xpLabel,
  completedLabel,
  openLabel,
  completed = false,
  type,
}: LessonRowProps) {
  const isChallenge = type !== "content";

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-200",
        "border-border/70 bg-background/80 hover:border-border hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        completed && "bg-muted/35"
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-card text-sm font-semibold text-foreground">
        {completed ? <CheckCircle2 className="h-4 w-4" /> : index}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p
          className={cn(
            "truncate text-sm font-medium text-foreground",
            completed && "text-muted-foreground line-through"
          )}
        >
          {title}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            {isChallenge ? <Code2 className="h-3.5 w-3.5" /> : <PlayCircle className="h-3.5 w-3.5" />}
            {duration}
          </span>
          <span className="inline-flex items-center gap-1">
            {completed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
            {completed ? completedLabel : openLabel}
          </span>
        </div>
      </div>
      <Badge variant="outline" className="border-border/70 bg-card/90 text-foreground">
        +{xpReward} {xpLabel}
      </Badge>
    </Link>
  );
}
