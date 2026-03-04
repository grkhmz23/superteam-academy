"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  FileText,
  Code2,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Module, Lesson } from "@/types/content";

interface LessonSidebarProps {
  courseSlug: string;
  modules: Module[];
  currentLessonId: string;
  completedLessons: string[];
  courseTitle?: string;
}

interface LessonItemProps {
  lesson: Lesson;
  courseSlug: string;
  isCurrent: boolean;
  isCompleted: boolean;
}

function LessonItem({ lesson, courseSlug, isCurrent, isCompleted }: LessonItemProps) {
  const isChallenge = lesson.type === "challenge";

  return (
    <Link
      href={`/courses/${courseSlug}/lessons/${lesson.id}`}
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm transition-all duration-200",
        isCurrent
          ? "lesson-current-pill border-border/80 font-medium"
          : "border-transparent text-muted-foreground hover:border-border/60 hover:bg-muted/40 hover:text-foreground"
      )}
    >
      {isCompleted ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
      ) : isChallenge ? (
        <Code2 className="h-4 w-4 shrink-0 text-primary" />
      ) : (
        <FileText className="h-4 w-4 shrink-0" />
      )}
      <span className="truncate">{lesson.title}</span>
    </Link>
  );
}

interface ModuleSectionProps {
  module: Module;
  courseSlug: string;
  currentLessonId: string;
  completedLessons: string[];
  defaultExpanded?: boolean;
}

function ModuleSection({
  module,
  courseSlug,
  currentLessonId,
  completedLessons,
  defaultExpanded = false,
}: ModuleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Check if current lesson is in this module
  const hasCurrentLesson = module.lessons.some(
    (l) => l.id === currentLessonId
  );

  // Calculate progress for this module
  const completedInModule = module.lessons.filter((l) =>
    completedLessons.includes(l.id)
  ).length;
  const moduleProgress =
    module.lessons.length > 0
      ? Math.round((completedInModule / module.lessons.length) * 100)
      : 0;

  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 last:border-border/70">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span
            className={cn(
              "text-sm font-medium",
              hasCurrentLesson ? "text-primary" : "text-foreground"
            )}
          >
            {module.title}
          </span>
        </div>
        <Badge variant="outline" className="border-border/70 bg-card/80 text-muted-foreground">
          {completedInModule}/{module.lessons.length}
        </Badge>
      </button>

      {isExpanded && (
        <div className="space-y-2 px-4 pb-4">
          <Progress value={moduleProgress} className="mb-2 h-1" />
          {module.lessons.map((lesson) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              courseSlug={courseSlug}
              isCurrent={lesson.id === currentLessonId}
              isCompleted={completedLessons.includes(lesson.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function LessonSidebar({
  courseSlug,
  modules,
  currentLessonId,
  completedLessons,
  courseTitle,
}: LessonSidebarProps) {
  const t = useTranslations("lesson");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Calculate overall progress
  const totalLessons = modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );
  const completedCount = completedLessons.length;
  const progressPercent =
    totalLessons > 0
      ? Math.round((completedCount / totalLessons) * 100)
      : 0;

  // Find which module contains the current lesson
  const currentModuleIndex = modules.findIndex((m) =>
    m.lessons.some((l) => l.id === currentLessonId)
  );

  const sidebarContent = (
    <>
      <div className="rounded-[1.5rem] border border-border/70 bg-muted/25 p-4">
        {courseTitle && (
          <p className="mb-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">{courseTitle}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t("courseProgress")}</span>
          <span className="text-xs text-muted-foreground">
            {completedCount}/{totalLessons}
          </span>
        </div>
        <Progress value={progressPercent} className="mt-2 h-2" />
      </div>

      <div className="space-y-3 overflow-y-auto">
        {modules.map((module, index) => (
          <ModuleSection
            key={module.id}
            module={module}
            courseSlug={courseSlug}
            currentLessonId={currentLessonId}
            completedLessons={completedLessons}
            defaultExpanded={
              index === currentModuleIndex || index === currentModuleIndex + 1
            }
          />
        ))}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lesson-stage-panel flex items-center justify-between rounded-[1.5rem] p-4 lg:hidden">
        <span className="text-sm font-medium">{t("courseContent")}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="lesson-stage-panel fixed inset-x-4 top-[8rem] z-50 rounded-[1.5rem] p-4 lg:hidden">
          {sidebarContent}
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="lesson-stage-panel hidden h-full flex-col rounded-[1.5rem] p-4 lg:flex">
        {sidebarContent}
      </div>
    </>
  );
}
