export function formatRelativeDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  const time = date.getTime();
  if (!Number.isFinite(time)) {
    return "Recently";
  }

  const diffMs = Date.now() - time;
  const diffMinutes = Math.max(1, Math.round(diffMs / 60_000));

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }

  const diffMonths = Math.round(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;
  }

  const diffYears = Math.round(diffMonths / 12);
  return `${diffYears} year${diffYears === 1 ? "" : "s"} ago`;
}

export function formatSessionDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  const time = date.getTime();
  if (!Number.isFinite(time)) {
    return "Scheduled soon";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function parseSalaryRange(input: string | null | undefined): {
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
} {
  if (!input) {
    return {};
  }

  const currencyMatch = input.match(/[A-Za-z$]{1,5}/);
  const numericValues = Array.from(input.matchAll(/\d[\d,]*/g))
    .map((match) => Number.parseInt(match[0].replace(/,/g, ""), 10))
    .filter((value) => Number.isFinite(value));

  return {
    salaryMin: numericValues[0],
    salaryMax: numericValues[1],
    salaryCurrency: currencyMatch?.[0] === "$" ? "USD" : currencyMatch?.[0],
  };
}
