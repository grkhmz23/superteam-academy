"use client";

import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CardContent } from "@/components/ui/card";
import { MarketplaceCard } from "@/components/ui/marketplace-card";
import { BookOpen, Clock, Zap } from "lucide-react";
import type { Course, CourseDifficulty } from "@/types/content";

interface CourseCardProps {
  course: Course;
  categoryLabel: string;
  difficultyLabel: string;
  lessonsLabel: string;
  xpLabel: string;
  statusLabel: string;
  completionPercent?: number;
}

function difficultyBadgeClasses(difficulty: CourseDifficulty) {
  switch (difficulty) {
    case "beginner":
      return "border-border/70 bg-muted/40 text-foreground";
    case "intermediate":
      return "border-border/70 bg-background/80 text-foreground";
    case "advanced":
      return "border-border/70 bg-muted/60 text-foreground";
  }
}

export function CourseCard({
  course,
  categoryLabel,
  difficultyLabel,
  lessonsLabel,
  xpLabel,
  statusLabel,
  completionPercent = 0,
}: CourseCardProps) {
  const totalLessons = course.modules.reduce((sum, moduleItem) => sum + moduleItem.lessons.length, 0);

  return (
    <Link href={`/courses/${course.slug}`} className="group block">
      <MarketplaceCard className="course-card-hover h-full overflow-hidden rounded-[1.75rem] bg-card/95">
        <div className="course-cover-surface relative h-44 overflow-hidden border-b border-border/70">
          {course.imageUrl ? (
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              className="object-cover opacity-95 transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/60" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/25 to-transparent" />
          <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={difficultyBadgeClasses(course.difficulty)}>
              {difficultyLabel}
            </Badge>
            <Badge variant="outline" className="border-border/70 bg-background/80 text-muted-foreground">
              {categoryLabel}
            </Badge>
          </div>
        </div>
        <CardContent className="flex h-[calc(100%-11rem)] flex-col p-5">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">{course.title}</h3>
            <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{course.description}</p>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-border/70 bg-muted/30 px-3 py-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{course.duration}</span>
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/30 px-3 py-2">
              <p className="text-xs text-muted-foreground">{lessonsLabel}</p>
              <p className="mt-1 text-sm font-medium text-foreground">{totalLessons}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/30 px-3 py-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Zap className="h-3.5 w-3.5" />
                <span>{xpLabel}</span>
              </div>
              <p className="mt-1 text-sm font-medium text-foreground">{course.totalXP}</p>
            </div>
          </div>

          <div className="mt-auto pt-5">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>{completionPercent > 0 ? `${completionPercent}%` : xpLabel}</span>
              <span>{statusLabel}</span>
            </div>
            <Progress value={completionPercent} className="h-2" />
          </div>
        </CardContent>
      </MarketplaceCard>
    </Link>
  );
}
