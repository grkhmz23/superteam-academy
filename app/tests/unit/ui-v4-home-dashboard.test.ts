import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

describe("UI V4 home and dashboard", () => {
  it("uses the shared V4 shell and page header composition", () => {
    const homeSource = readFileSync(resolve("src/app/[locale]/page.tsx"), "utf8");
    const dashboardSource = readFileSync(resolve("src/app/[locale]/dashboard/page.tsx"), "utf8");

    expect(homeSource).toContain("PageShell");
    expect(homeSource).toContain("PageHeader");
    expect(dashboardSource).toContain("PageShell");
    expect(dashboardSource).toContain("PageHeader");
  });

  it("does not reintroduce legacy dark slab classes", () => {
    const homeSource = readFileSync(resolve("src/app/[locale]/page.tsx"), "utf8");
    const dashboardSource = readFileSync(resolve("src/app/[locale]/dashboard/page.tsx"), "utf8");

    expect(homeSource).not.toContain("bg-[#0F1322]");
    expect(dashboardSource).not.toContain("bg-[#0F1322]");
    expect(dashboardSource).not.toContain("GlassCard");
  });

  it("renders the dashboard stat grid with four stat cards", () => {
    const dashboardSource = readFileSync(resolve("src/app/[locale]/dashboard/page.tsx"), "utf8");

    expect(dashboardSource).toContain("StatCard");
    expect((dashboardSource.match(/<StatCard/g) ?? []).length).toBe(4);
  });
});
