import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

describe("UI V4 marketplace cards", () => {
  it("uses token-based marketplace card surfaces across listing cards", () => {
    const files = [
      "src/components/jobs/JobCard.tsx",
      "src/components/projects/ProjectCard.tsx",
      "src/components/mentors/MentorCard.tsx",
      "src/components/ideas/IdeaCard.tsx",
      "src/components/hackathons/HackathonCard.tsx",
    ];

    for (const file of files) {
      const source = readFileSync(resolve(file), "utf8");
      expect(source).toContain("MarketplaceCard");
      expect(source).not.toContain("bg-[#");
      expect(source).not.toContain("GlassCard");
    }
  });

  it("uses the shared marketplace pill contract in jobs and mentors cards", () => {
    const jobCardSource = readFileSync(resolve("src/components/jobs/JobCard.tsx"), "utf8");
    const mentorCardSource = readFileSync(resolve("src/components/mentors/MentorCard.tsx"), "utf8");

    expect(jobCardSource).toContain("marketplace-pill");
    expect(mentorCardSource).toContain("marketplace-pill");
  });

  it("uses premium empty states with actions on jobs and projects pages", () => {
    const jobsPageSource = readFileSync(resolve("src/app/[locale]/jobs/page.tsx"), "utf8");
    const projectsPageSource = readFileSync(resolve("src/app/[locale]/projects/page.tsx"), "utf8");

    expect(jobsPageSource).toContain("PremiumEmptyState");
    expect(jobsPageSource).toContain("postJob");
    expect(projectsPageSource).toContain("PremiumEmptyState");
    expect(projectsPageSource).toContain("submitProject");
  });

  it("keeps marketplace pills and meta rows RTL-safe without left-only spacing", () => {
    const mentorsPageSource = readFileSync(resolve("src/app/[locale]/mentors/page.tsx"), "utf8");
    const mentorCardSource = readFileSync(resolve("src/components/mentors/MentorCard.tsx"), "utf8");

    expect(mentorsPageSource).toContain("searchIconClass");
    expect(mentorsPageSource).toContain("searchInputClass");
    expect(mentorCardSource).not.toContain("ml-");
    expect(mentorCardSource).not.toContain("mr-");
    expect(mentorCardSource).toContain("gap-");
  });
});
