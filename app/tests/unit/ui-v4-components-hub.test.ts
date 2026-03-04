import React from "react";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SegmentedFilter } from "@/components/ui/segmented-filter";

describe("UI V4 components hub", () => {
  it("uses the shared V4 shell and filter primitives on the catalog page", () => {
    const source = readFileSync(resolve("src/app/[locale]/components/page.tsx"), "utf8");

    expect(source).toContain("PageShell");
    expect(source).toContain("PageHeader");
    expect(source).toContain("FilterBar");
    expect(source).toContain("SegmentedFilter");
    expect(source).toContain("t(`categories.");
    expect(source).toContain("components-catalog-toolbar");
    expect(source).toContain("components-results-grid");
  });

  it("adds a route-backed detail page for component cards", () => {
    const detailRoute = resolve("src/app/[locale]/components/[slug]/page.tsx");

    expect(existsSync(detailRoute)).toBe(true);

    const cardSource = readFileSync(resolve("src/components/solana/ComponentCard.tsx"), "utf8");
    const detailSource = readFileSync(detailRoute, "utf8");
    const detailComponentSource = readFileSync(resolve("src/components/solana/ComponentDetail.tsx"), "utf8");

    expect(cardSource).toContain('href={`/components/${component.id}`}');
    expect(detailSource).toContain("ComponentDetail");
    expect(detailComponentSource).toContain("PageShell");
    expect(detailComponentSource).toContain("PageHeader");
  });

  it("keeps preview renderers on the client side for detail pages", () => {
    const detailSource = readFileSync(resolve("src/app/[locale]/components/[slug]/page.tsx"), "utf8");
    const detailComponentSource = readFileSync(resolve("src/components/solana/ComponentDetail.tsx"), "utf8");

    expect(detailSource).toContain("const { slug } = await params;");
    expect(detailSource).toContain("getComponentById(slug)");
    expect(detailSource).toContain("componentId={slug}");
    expect(detailSource).not.toContain("component={component}");
    expect(detailComponentSource).toContain("getComponentById");
    expect(detailComponentSource).toContain("componentId");
  });

  it("renders detail surfaces with semantic code panels and no legacy dark slabs", () => {
    const source = readFileSync(resolve("src/components/solana/ComponentDetail.tsx"), "utf8");
    const catalogSource = readFileSync(resolve("src/app/[locale]/components/page.tsx"), "utf8");
    const runtimeSource = readFileSync(resolve("src/components/solana/ComponentPreviewRuntime.tsx"), "utf8");

    expect(source).toContain("lesson-code-panel");
    expect(source).toContain("installCommand");
    expect(source).toContain("components-detail-preview-tab");
    expect(runtimeSource).toContain("previewState.environment");
    expect(runtimeSource).toContain("PreviewWalletProvider");
    expect(runtimeSource).toContain("PreviewRpcProvider");
    expect(catalogSource).not.toContain("bg-zinc-900");
    expect(source).not.toContain("bg-zinc-900");
    expect(source).not.toContain("bg-[#");
    expect(runtimeSource).not.toContain("bg-zinc-900");
    expect(runtimeSource).not.toContain("bg-[#");
  });

  it("upgrades the detail view into a workbench with example presets", () => {
    const source = readFileSync(resolve("src/components/solana/ComponentDetail.tsx"), "utf8");

    expect(source).toContain("components-detail-workbench");
    expect(source).toContain("activeExampleName");
    expect(source).toContain("applyExample");
    expect(source).toContain("example.props");
  });

  it("renders segmented controls with aria roles and gap-based layout for RTL-safe alignment", () => {
    const html = renderToStaticMarkup(
      React.createElement(SegmentedFilter, {
        ariaLabel: "الفئات",
        value: "all",
        onValueChange: () => undefined,
        options: [
          { value: "all", label: "الكل" },
          { value: "wallet", label: "Wallet" },
        ],
      })
    );

    expect(html).toContain('role="tablist"');
    expect(html).toContain('role="tab"');
    expect(html).toContain("gap-2");
  });
});
