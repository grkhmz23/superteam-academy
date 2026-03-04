import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

describe("UI V4 components hub i18n", () => {
  it("localizes category labels through message keys instead of raw registry names", () => {
    const catalogSource = readFileSync(resolve("src/app/[locale]/components/page.tsx"), "utf8");
    const detailSource = readFileSync(resolve("src/components/solana/ComponentDetail.tsx"), "utf8");

    expect(catalogSource).toContain("categories.");
    expect(detailSource).toContain("categories.");
    expect(catalogSource).not.toContain("category.name");
    expect(detailSource).not.toContain('component.category.replace("-", " ")');
  });

  it("adds the new components i18n contract across locales", () => {
    const localeFiles = [
      "src/messages/en.json",
      "src/messages/ar.json",
      "src/messages/de.json",
      "src/messages/es.json",
      "src/messages/fr.json",
      "src/messages/it.json",
      "src/messages/pt-BR.json",
      "src/messages/zh-CN.json",
    ];

    for (const file of localeFiles) {
      const source = readFileSync(resolve(file), "utf8");

      expect(source).toContain('"categories"');
      expect(source).toContain('"badges"');
      expect(source).toContain('"actions"');
      expect(source).toContain('"sections"');
      expect(source).toContain('"empty"');
      expect(source).toContain('"resultsCount"');
      expect(source).toContain('"refreshPreview"');
      expect(source).toContain('"environment"');
      expect(source).toContain('"walletControl"');
      expect(source).toContain('"rpcControl"');
    }
  });

  it("keeps Arabic search input RTL-safe", () => {
    const catalogSource = readFileSync(resolve("src/app/[locale]/components/page.tsx"), "utf8");
    const arSource = readFileSync(resolve("src/messages/ar.json"), "utf8");

    expect(catalogSource).toContain('locale === "ar" ? "pr-10" : "pl-10"');
    expect(catalogSource).toContain('locale === "ar"');
    expect(arSource).toContain('"placeholder"');
  });
});
