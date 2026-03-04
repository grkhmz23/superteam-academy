"use client";

export const LOCAL_COURSE_ID_OVERRIDES_STORAGE_KEY =
  "superteam.courseOnChainIdOverrides";

export function parseCourseIdOverridesJson(
  rawValue: string
): Record<string, string> {
  if (!rawValue.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, string] =>
          typeof entry[0] === "string" &&
          typeof entry[1] === "string" &&
          entry[1].trim().length > 0
      )
    );
  } catch {
    return {};
  }
}

export function readLocalCourseIdOverrides(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  const rawValue =
    window.localStorage.getItem(LOCAL_COURSE_ID_OVERRIDES_STORAGE_KEY) || "";
  return parseCourseIdOverridesJson(rawValue);
}

export function writeLocalCourseIdOverrides(overrides: Record<string, string>): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    LOCAL_COURSE_ID_OVERRIDES_STORAGE_KEY,
    JSON.stringify(overrides, null, 2)
  );
}

export function clearLocalCourseIdOverrides(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(LOCAL_COURSE_ID_OVERRIDES_STORAGE_KEY);
}

export function resolveClientCourseId(
  courseSlug: string,
  defaultCourseId: string | null | undefined
): string | null {
  const localOverride = readLocalCourseIdOverrides()[courseSlug];
  if (typeof localOverride === "string" && localOverride.trim()) {
    return localOverride;
  }

  return defaultCourseId ?? null;
}
