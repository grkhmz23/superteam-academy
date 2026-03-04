import React from "react";
import { readFileSync } from "fs";
import { resolve } from "path";
import { renderToStaticMarkup } from "react-dom/server";
import { Briefcase } from "lucide-react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedFilter } from "@/components/ui/segmented-filter";

describe("UI V4 hero and filters", () => {
  it("renders the shared hero badge structure through PageHeader", () => {
    const html = renderToStaticMarkup(
      React.createElement(PageHeader, {
        title: "Jobs",
        badge: { variant: "brand", icon: Briefcase, label: "Job Board" },
      })
    );

    expect(html).toContain("hero-eyebrow");
    expect(html).toContain("hero-accent-glow");
  });

  it("removes legacy LuxuryBadge usage from scoped marketplace pages", () => {
    const files = [
      "src/app/[locale]/jobs/page.tsx",
      "src/app/[locale]/projects/page.tsx",
      "src/app/[locale]/mentors/page.tsx",
      "src/app/[locale]/ideas/page.tsx",
      "src/app/[locale]/hackathons/page.tsx",
      "src/app/[locale]/leaderboard/page.tsx",
    ];

    for (const file of files) {
      const source = readFileSync(resolve(file), "utf8");
      expect(source).not.toContain("LuxuryBadge");
      expect(source).toContain("badge={{");
    }
  });

  it("uses FilterBar and SegmentedFilter on jobs and hackathons pages", () => {
    const jobsSource = readFileSync(resolve("src/app/[locale]/jobs/page.tsx"), "utf8");
    const hackathonsSource = readFileSync(resolve("src/app/[locale]/hackathons/page.tsx"), "utf8");

    expect(jobsSource).toContain("FilterBar");
    expect(jobsSource).toContain("SegmentedFilter");
    expect(hackathonsSource).toContain("FilterBar");
    expect(hackathonsSource).toContain("SegmentedFilter");
  });

  it("renders segmented controls with aria roles and gap-based layout", () => {
    const html = renderToStaticMarkup(
      React.createElement(SegmentedFilter, {
        ariaLabel: "عرض",
        value: "list",
        onValueChange: () => undefined,
        options: [
          { value: "list", label: "قائمة" },
          { value: "calendar", label: "تقويم" },
        ],
      })
    );

    expect(html).toContain('role="tablist"');
    expect(html).toContain('role="tab"');
    expect(html).toContain("gap-2");
  });
});
