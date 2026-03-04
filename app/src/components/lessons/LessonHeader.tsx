import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Progress } from "@/components/ui/progress";
import { BookOpen } from "lucide-react";

interface LessonHeaderProps {
  courseTitle: React.ReactNode;
  title: React.ReactNode;
  progressLabel: React.ReactNode;
  progressValue: number;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
}

export function LessonHeader({
  courseTitle,
  title,
  progressLabel,
  progressValue,
  meta,
  actions,
}: LessonHeaderProps) {
  return (
    <PageHeader
      badge={
        <Badge
          variant="outline"
          className="w-fit border-border/70 bg-muted/35 text-xs uppercase tracking-[0.22em] text-muted-foreground"
        >
          {courseTitle}
        </Badge>
      }
      icon={<BookOpen className="h-5 w-5" />}
      title={title}
      description={
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{progressLabel}</span>
            {meta}
          </div>
          <div className="max-w-xl">
            <Progress value={progressValue} className="h-2" />
          </div>
        </div>
      }
      actions={actions}
    />
  );
}
