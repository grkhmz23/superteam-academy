import { describe, expect, it } from "vitest";
import {
  getPageLabelKey,
  primaryNavItems,
  secondaryNavItems,
} from "@/components/layout/navigation";

describe("layout navigation", () => {
  it("includes all primary feature sections in the active shell", () => {
    expect(primaryNavItems.map((item) => item.href)).toEqual(
      expect.arrayContaining([
        "/",
        "/dashboard",
        "/courses",
        "/playground",
        "/devlab",
        "/components",
        "/jobs",
        "/projects",
        "/mentors",
        "/ideas",
        "/hackathons",
        "/leaderboard",
      ])
    );

    expect(secondaryNavItems.map((item) => item.href)).toEqual(
      expect.arrayContaining(["/profile", "/settings", "/sessions"])
    );
  });

  it("maps new route families to topbar labels", () => {
    expect(getPageLabelKey("/jobs")).toBe("jobs");
    expect(getPageLabelKey("/jobs/new")).toBe("jobs");
    expect(getPageLabelKey("/projects/abc")).toBe("projects");
    expect(getPageLabelKey("/mentors/become")).toBe("mentors");
    expect(getPageLabelKey("/ideas/123")).toBe("ideas");
    expect(getPageLabelKey("/hackathons")).toBe("hackathons");
    expect(getPageLabelKey("/sessions")).toBe("sessions");
  });
});
