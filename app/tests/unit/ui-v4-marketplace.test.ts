import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

const targetPages = [
  "src/app/[locale]/jobs/page.tsx",
  "src/app/[locale]/projects/page.tsx",
  "src/app/[locale]/mentors/page.tsx",
  "src/app/[locale]/ideas/page.tsx",
  "src/app/[locale]/hackathons/page.tsx",
  "src/app/[locale]/leaderboard/page.tsx",
];

describe("UI V4 marketplace system", () => {
  it("applies the shared marketplace shell to each premium list page", () => {
    for (const page of targetPages) {
      const source = readFileSync(resolve(page), "utf8");
      expect(source).toContain("MarketplaceShell");
    }
  });

  it("uses semantic premium empty states and marketplace surfaces", () => {
    const emptyStateSource = readFileSync(
      resolve("src/components/ui/premium-empty-state.tsx"),
      "utf8"
    );
    const cssSource = readFileSync(resolve("src/styles/globals.css"), "utf8");

    expect(emptyStateSource).toContain("premium-empty-state-surface");
    expect(emptyStateSource).toContain("text-foreground");
    expect(emptyStateSource).toContain("text-muted-foreground");
    expect(emptyStateSource).not.toContain("bg-[#0F1322]");
    expect(cssSource).toContain("marketplace-toolbar");
    expect(cssSource).toContain("marketplace-panel");
  });

  it("replaces the legacy leaderboard slab with a marketplace card surface", () => {
    const leaderboardSource = readFileSync(resolve("src/app/[locale]/leaderboard/page.tsx"), "utf8");

    expect(leaderboardSource).toContain("marketplace-card-hover");
    expect(leaderboardSource).toContain("bg-card");
    expect(leaderboardSource).not.toContain("GlassCard");
  });
});
