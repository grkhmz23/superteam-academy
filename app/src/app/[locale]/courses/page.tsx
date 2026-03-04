"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { PremiumEmptyState } from "@/components/ui/premium-empty-state";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseCatalogToolbar } from "@/components/courses/CourseCatalogToolbar";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { useAllProgress } from "@/lib/hooks/use-progress";
import { getLocaleDirection } from "@/lib/i18n/locales";
import type { Locale } from "@/lib/i18n/request";
import { BookOpen, Filter, Loader2 } from "lucide-react";
import type { Course } from "@/types/content";

type CatalogCategory =
  | "solana"
  | "anchor"
  | "defi"
  | "security"
  | "rust"
  | "infra"
  | "wallet"
  | "mobile"
  | "payments"
  | "frontend";

function inferCourseCategory(course: Course): CatalogCategory {
  const tags = new Set(course.tags.map((tag) => tag.toLowerCase()));
  const slug = course.slug.toLowerCase();

  if (tags.has("rust")) {
    return "rust";
  }
  if (tags.has("anchor") || slug.includes("anchor")) {
    return "anchor";
  }
  if (tags.has("defi") || slug.includes("defi")) {
    return "defi";
  }
  if (tags.has("security") || tags.has("audit") || slug.includes("security")) {
    return "security";
  }
  if (
    tags.has("rpc") ||
    tags.has("indexing") ||
    tags.has("reliability") ||
    tags.has("mempool") ||
    tags.has("fees")
  ) {
    return "infra";
  }
  if (tags.has("wallet") || tags.has("siws") || slug.includes("wallet")) {
    return "wallet";
  }
  if (tags.has("mobile")) {
    return "mobile";
  }
  if (tags.has("payments") || tags.has("solana-pay") || tags.has("commerce")) {
    return "payments";
  }
  if (tags.has("frontend")) {
    return "frontend";
  }
  return "solana";
}

function categoryLabel(
  category: CatalogCategory,
  t: ReturnType<typeof useTranslations>
): string {
  switch (category) {
    case "solana":
      return t("categories.solana");
    case "anchor":
      return t("categories.anchor");
    case "defi":
      return t("categories.defi");
    case "security":
      return t("categories.security");
    case "rust":
      return t("categories.rust");
    case "infra":
      return t("categories.infra");
    case "wallet":
      return t("categories.wallet");
    case "mobile":
      return t("categories.mobile");
    case "payments":
      return t("categories.payments");
    case "frontend":
      return t("categories.frontend");
  }
}

export default function CourseCatalogPage() {
  const t = useTranslations("courses");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isRtl = getLocaleDirection(locale as Locale) === "rtl";
  const searchIconClass = isRtl ? "right-3" : "left-3";
  const searchInputClass = isRtl ? "pr-10" : "pl-10";
  const { progressList } = useAllProgress();

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch(`/api/courses?locale=${encodeURIComponent(locale)}`);
        if (res.ok) {
          const data = (await res.json()) as { courses: Course[] };
          setCourses(data.courses);
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setIsLoading(false);
      }
    }

    void fetchCourses();
  }, [locale]);

  const progressByCourse = useMemo(
    () => new Map(progressList.map((item) => [item.courseSlug, item.completionPercent])),
    [progressList]
  );

  const filtered = useMemo(() => {
    let result = courses;

    if (difficulty !== "all") {
      result = result.filter((course) => course.difficulty === difficulty);
    }

    if (category !== "all") {
      result = result.filter((course) => inferCourseCategory(course) === category);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          categoryLabel(inferCourseCategory(course), t).toLowerCase().includes(query)
      );
    }

    return result;
  }, [category, courses, difficulty, search, t]);

  const difficultyFilters = [
    { value: "all", label: t("filterAll") },
    { value: "beginner", label: t("filterBeginner") },
    { value: "intermediate", label: t("filterIntermediate") },
    { value: "advanced", label: t("filterAdvanced") },
  ];

  const categoryFilters = useMemo(() => {
    const ordered: CatalogCategory[] = [
      "solana",
      "anchor",
      "defi",
      "security",
      "rust",
      "infra",
      "wallet",
      "mobile",
      "payments",
      "frontend",
    ];
    const present = new Set(courses.map((course) => inferCourseCategory(course)));

    return [
      { value: "all", label: t("categories.all") },
      ...ordered
        .filter((entry) => present.has(entry))
        .map((entry) => ({ value: entry, label: categoryLabel(entry, t) })),
    ];
  }, [courses, t]);

  const clearFilters = () => {
    setSearch("");
    setDifficulty("all");
    setCategory("all");
  };

  const hero = (
    <PageHeader
      badge={
        <Badge
          variant="outline"
          className="w-fit border-border/70 bg-muted/40 text-xs uppercase tracking-[0.22em] text-muted-foreground"
        >
          {t("title")}
        </Badge>
      }
      icon={<BookOpen className="h-5 w-5" />}
      title={t("subtitle")}
      description={t("searchPlaceholder")}
      actions={
        <Badge variant="outline" className="border-border/70 bg-background/80 px-3 py-2 text-muted-foreground">
          {t("resultsCount", { count: filtered.length })}
        </Badge>
      }
    />
  );

  if (isLoading) {
    return (
      <PageShell hero={hero}>
        <div className="flex min-h-[18rem] items-center justify-center rounded-[1.5rem] border border-border/70 bg-card/80">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell hero={hero}>
      <CourseCatalogToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("searchPlaceholder")}
        searchIconClass={searchIconClass}
        searchInputClass={searchInputClass}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        difficultyOptions={difficultyFilters}
        category={category}
        onCategoryChange={setCategory}
        categoryOptions={categoryFilters}
        resultsLabel={t("resultsCount", { count: filtered.length })}
      />

      {filtered.length === 0 ? (
        <PremiumEmptyState
          icon={Filter}
          title={t("noCourses")}
          description={t("searchPlaceholder")}
          action={
            <Button type="button" variant="outline" onClick={clearFilters}>
              {tc("clear")}
            </Button>
          }
        />
      ) : (
        <CourseGrid>
          {filtered.map((course) => {
            const completionPercent = progressByCourse.get(course.slug) ?? 0;
            return (
              <CourseCard
                key={course.id}
                course={course}
                categoryLabel={categoryLabel(inferCourseCategory(course), t)}
                difficultyLabel={tc(course.difficulty)}
                lessonsLabel={tc("lessons")}
                xpLabel={tc("xp")}
                statusLabel={completionPercent > 0 ? tc("inProgress") : tc("notStarted")}
                completionPercent={completionPercent}
              />
            );
          })}
        </CourseGrid>
      )}
    </PageShell>
  );
}
