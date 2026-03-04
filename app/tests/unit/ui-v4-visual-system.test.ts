import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

describe("UI V4 visual system", () => {
  it("uses a shared app background and premium shell composition", () => {
    const layoutSource = readFileSync(resolve("src/app/[locale]/layout.tsx"), "utf8");
    const shellSource = readFileSync(resolve("src/components/ui/page-shell.tsx"), "utf8");
    const headerSource = readFileSync(resolve("src/components/ui/page-header.tsx"), "utf8");

    expect(layoutSource).toContain("AppBackground");
    expect(shellSource).toContain("page-shell-stage");
    expect(shellSource).toContain("page-shell-grid");
    expect(headerSource).toContain("page-hero-glow");
    expect(headerSource).toContain("max-w-3xl");
  });

  it("removes the old hardcoded dark slab from shared premium cards", () => {
    const luxurySource = readFileSync(resolve("src/components/luxury/primitives.tsx"), "utf8");

    expect(luxurySource).not.toContain("bg-[#0F1322]/75");
    expect(luxurySource).toContain("bg-card/95");
    expect(luxurySource).toContain("border-border/70");
  });
});
