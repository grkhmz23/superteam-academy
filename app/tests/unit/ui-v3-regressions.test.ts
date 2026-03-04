import React from "react";
import { readFileSync } from "fs";
import { resolve } from "path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterCard } from "@/components/ui/filter-card";
import { Search, Briefcase } from "lucide-react";

describe("UI V3 regressions", () => {
  it("renders EmptyState with readable semantic tokens", () => {
    const html = renderToStaticMarkup(
      React.createElement(EmptyState, {
        icon: Search,
        title: "No results",
        description: "Adjust your filters.",
      })
    );

    expect(html).toContain("text-foreground");
    expect(html).toContain("text-muted-foreground");
    expect(html).toContain("border-border");
  });

  it("renders FilterCard with shared card surface styling", () => {
    const html = renderToStaticMarkup(
      React.createElement(FilterCard, {
        title: "Filters",
        description: "Refine the list",
        children: React.createElement("div", null, "Body"),
      })
    );

    expect(html).toContain("bg-card");
    expect(html).toContain("border-border");
    expect(html).toContain("text-foreground");
  });

  it("uses shared UI V3 primitives on the courses page", () => {
    const source = readFileSync(resolve("src/app/[locale]/courses/page.tsx"), "utf8");

    expect(source).toContain("PageShell");
    expect(source).toContain("CourseCatalogToolbar");
    expect(source).not.toContain("GlassCard");
  });

  it("uses the shared empty state and page shell on the jobs page", () => {
    const source = readFileSync(resolve("src/app/[locale]/jobs/page.tsx"), "utf8");

    expect(source).toContain("PageShell");
    expect(source).toContain("EmptyState");
    expect(source).not.toContain("GlassCard");
  });

  it("uses ide-surface classes in the playground shell", () => {
    const source = readFileSync(resolve("src/components/playground/PlaygroundShell.tsx"), "utf8");

    expect(source).toContain("ide-surface");
  });

  it("uses shared card primitives for playground chrome", () => {
    const topBarSource = readFileSync(resolve("src/components/playground/PlaygroundTopBar.tsx"), "utf8");
    const statusBarSource = readFileSync(resolve("src/components/playground/StatusBar.tsx"), "utf8");

    expect(topBarSource).toContain('from "@/components/ui/card"');
    expect(topBarSource).toContain('from "@/components/ui/separator"');
    expect(topBarSource).toContain("bg-card");
    expect(topBarSource).toContain("bg-muted/30");

    expect(statusBarSource).toContain('from "@/components/ui/card"');
    expect(statusBarSource).toContain('from "@/components/ui/separator"');
    expect(statusBarSource).toContain("bg-card");
    expect(statusBarSource).toContain("bg-muted/30");
  });
});
