import type { Course, Lesson, Module } from "@/types/content";
import { defaultLocale, type Locale } from "@/lib/i18n/routing";
import { getOnChainCourseId } from "@/lib/data/course-onchain-ids";
import { localizeCourse } from "@/lib/i18n/course-content";
import type { CourseContentService, SearchCourseFilters } from "./content";
import { getSanityClient } from "@/lib/cms/sanity-client";

interface SanityChallengeDoc {
  lesson?: { _ref?: string };
  starterCode?: string;
  language?: "typescript" | "rust";
  testCases?: Array<{ name: string; input: string; expectedOutput: string }>;
  hints?: string[];
  solution?: string;
}

interface SanityLessonDoc {
  _id: string;
  title: string;
  slug?: string;
  type?: "content" | "challenge" | "multi-file-challenge" | "devnet-challenge";
  content?: string;
  xpReward?: number;
  duration?: string;
  order?: number;
}

interface SanityModuleDoc {
  _id: string;
  title: string;
  description?: string;
  order?: number;
  lessons?: SanityLessonDoc[];
}

interface SanityCourseDoc {
  _id: string;
  title: string;
  slug?: { current?: string };
  description?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  duration?: string;
  totalXP?: number;
  tags?: string[];
  thumbnailUrl?: string;
  modules?: SanityModuleDoc[];
}

function normalizeLesson(
  lesson: SanityLessonDoc,
  challengeMap: Map<string, SanityChallengeDoc>
): Lesson {
  const challenge = challengeMap.get(lesson._id);
  const base: Lesson = {
    id: lesson._id,
    slug: lesson.slug ?? lesson._id,
    title: lesson.title,
    type: lesson.type ?? "content",
    content: lesson.content ?? "",
    xpReward: lesson.xpReward ?? 0,
    duration: lesson.duration ?? "0 min",
  };

  if (base.type === "challenge") {
    return {
      ...base,
      starterCode: challenge?.starterCode ?? "",
      language: challenge?.language ?? "typescript",
      testCases: challenge?.testCases ?? [],
      hints: challenge?.hints ?? [],
      solution: challenge?.solution ?? "",
    } as Lesson;
  }

  return base;
}

function normalizeModule(
  moduleDoc: SanityModuleDoc,
  challengeMap: Map<string, SanityChallengeDoc>
): Module {
  const sortedLessons = [...(moduleDoc.lessons ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  return {
    id: moduleDoc._id,
    title: moduleDoc.title,
    description: moduleDoc.description ?? "",
    lessons: sortedLessons.map((lesson) => normalizeLesson(lesson, challengeMap)),
  };
}

function normalizeCourse(
  courseDoc: SanityCourseDoc,
  challengeMap: Map<string, SanityChallengeDoc>
): Course {
  const sortedModules = [...(courseDoc.modules ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const slug = courseDoc.slug?.current ?? courseDoc._id;

  return {
    id: courseDoc._id,
    slug,
    onChainCourseId: getOnChainCourseId(slug),
    title: courseDoc.title,
    description: courseDoc.description ?? "",
    difficulty: courseDoc.difficulty ?? "beginner",
    duration: courseDoc.duration ?? "",
    totalXP: courseDoc.totalXP ?? 0,
    tags: courseDoc.tags ?? [],
    imageUrl: courseDoc.thumbnailUrl ?? "",
    modules: sortedModules.map((moduleDoc) =>
      normalizeModule(moduleDoc, challengeMap)
    ),
  };
}

export class ContentSanityService implements CourseContentService {
  private async fetchChallengeMap(): Promise<Map<string, SanityChallengeDoc>> {
    const client = getSanityClient();
    const challenges = await client.fetch<SanityChallengeDoc[]>(
      `*[_type == "challenge"]{
        lesson,
        starterCode,
        language,
        testCases,
        hints,
        solution
      }`
    );

    const map = new Map<string, SanityChallengeDoc>();
    for (const challenge of challenges) {
      const lessonRef = challenge.lesson?._ref;
      if (lessonRef) {
        map.set(lessonRef, challenge);
      }
    }
    return map;
  }

  private async fetchCoursesRaw(): Promise<SanityCourseDoc[]> {
    const client = getSanityClient();
    return client.fetch<SanityCourseDoc[]>(
      `*[_type == "course"] | order(title asc){
        _id,
        title,
        slug,
        description,
        difficulty,
        duration,
        totalXP,
        tags,
        thumbnailUrl,
        modules[]->{
          _id,
          title,
          description,
          order,
          lessons[]->{
            _id,
            title,
            slug,
            type,
            content,
            xpReward,
            duration,
            order
          }
        }
      }`
    );
  }

  private async fetchCourses(locale: Locale = defaultLocale): Promise<Course[]> {
    const [rawCourses, challengeMap] = await Promise.all([
      this.fetchCoursesRaw(),
      this.fetchChallengeMap(),
    ]);
    const normalized = rawCourses.map((course) =>
      normalizeCourse(course, challengeMap)
    );
    return normalized.map((course) => localizeCourse(course, locale));
  }

  async getCourses(locale: Locale = defaultLocale): Promise<Course[]> {
    return this.fetchCourses(locale);
  }

  async getCourse(slug: string, locale: Locale = defaultLocale): Promise<Course | null> {
    const courses = await this.fetchCourses(locale);
    return courses.find((course) => course.slug === slug) ?? null;
  }

  async getLesson(
    courseSlug: string,
    lessonId: string,
    locale: Locale = defaultLocale
  ): Promise<Lesson | null> {
    const course = await this.getCourse(courseSlug, locale);
    if (!course) {
      return null;
    }

    for (const courseModule of course.modules) {
      const lesson = courseModule.lessons.find(
        (item) => item.id === lessonId || item.slug === lessonId
      );
      if (lesson) {
        return lesson;
      }
    }
    return null;
  }

  async getModules(courseSlug: string, locale: Locale = defaultLocale): Promise<Module[]> {
    const course = await this.getCourse(courseSlug, locale);
    return course?.modules ?? [];
  }

  async searchCourses(
    query: string,
    filters?: SearchCourseFilters,
    locale: Locale = defaultLocale
  ): Promise<Course[]> {
    const normalizedQuery = query.trim().toLowerCase();
    const courses = await this.getCourses(locale);

    return courses.filter((course) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        course.title.toLowerCase().includes(normalizedQuery) ||
        course.description.toLowerCase().includes(normalizedQuery);

      const matchesDifficulty =
        !filters?.difficulty || course.difficulty === filters.difficulty;

      const matchesTags =
        !filters?.tags ||
        filters.tags.length === 0 ||
        filters.tags.every((tag) =>
          course.tags.some((courseTag) => courseTag.toLowerCase() === tag.toLowerCase())
        );

      return matchesQuery && matchesDifficulty && matchesTags;
    });
  }
}
