import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

describe("UI V4 courses surfaces", () => {
  it("uses the shared V4 shell and header on catalog and detail pages", () => {
    const catalogSource = readFileSync(resolve("src/app/[locale]/courses/page.tsx"), "utf8");
    const detailSource = readFileSync(resolve("src/app/[locale]/courses/[slug]/page.tsx"), "utf8");

    expect(catalogSource).toContain("PageShell");
    expect(catalogSource).toContain("PageHeader");
    expect(detailSource).toContain("PageShell");
    expect(detailSource).toContain("PageHeader");
  });

  it("does not reintroduce legacy hardcoded dark slabs or hex colors", () => {
    const catalogSource = readFileSync(resolve("src/app/[locale]/courses/page.tsx"), "utf8");
    const detailSource = readFileSync(resolve("src/app/[locale]/courses/[slug]/page.tsx"), "utf8");

    expect(catalogSource).not.toContain("bg-[#");
    expect(detailSource).not.toContain("bg-[#");
    expect(catalogSource).not.toContain("GlassCard");
    expect(detailSource).not.toContain("GlassCard");
  });

  it("uses semantic course card and detail contracts", () => {
    const cardSource = readFileSync(resolve("src/components/courses/CourseCard.tsx"), "utf8");
    const detailSource = readFileSync(resolve("src/app/[locale]/courses/[slug]/page.tsx"), "utf8");

    expect(cardSource).toContain("bg-card");
    expect(cardSource).toContain("border-border");
    expect(cardSource).toContain("text-foreground");
    expect(detailSource).toContain("LessonRow");
    expect(detailSource).toContain("PageShell");
  });
});
