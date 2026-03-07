import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

describe("playwright e2e setup", () => {
  it("exposes install scripts and a visual test entrypoint in package.json", () => {
    const packageJson = JSON.parse(readFileSync(resolve("package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.["test:e2e"]).toBe("playwright test");
    expect(packageJson.scripts?.["e2e:install-deps"]).toBe("bash scripts/install-playwright-deps.sh");
    expect(packageJson.scripts?.["e2e:install"]).toBe("bash scripts/install-playwright-browsers.sh");
    expect(packageJson.scripts?.["e2e:visual"]).toBe("VISUAL_E2E=1 playwright test tests/e2e/visual-*.spec.ts");
  });

  it("gates visual specs behind VISUAL_E2E and includes browser install helpers", () => {
    const visualSanitySpec = readFileSync(resolve("tests/e2e/visual-sanity.spec.ts"), "utf8");
    const visualComponentsSpec = readFileSync(resolve("tests/e2e/visual-v4-components.spec.ts"), "utf8");
    const depsScript = readFileSync(resolve("scripts/install-playwright-deps.sh"), "utf8");
    const browsersScriptPath = resolve("scripts/install-playwright-browsers.sh");

    expect(visualSanitySpec).toContain("VISUAL_E2E");
    expect(visualSanitySpec).toContain("test.skip");
    expect(visualComponentsSpec).toContain("VISUAL_E2E");
    expect(visualComponentsSpec).toContain("test.skip");
    expect(existsSync(browsersScriptPath)).toBe(true);
    expect(depsScript).toContain("install_first_available");
    expect(depsScript).toContain("libatk1.0-0t64");
    expect(depsScript).toContain("libatk-bridge2.0-0t64");
    expect(depsScript).toContain("libasound2t64");
    expect(depsScript).toContain("libcups2t64");
    expect(depsScript).toContain("libgtk-3-0t64");
    expect(depsScript).toContain("fonts-liberation");
  });

  it("hardens apt dependency setup with an official-source fallback", () => {
    const depsScript = readFileSync(resolve("scripts/install-playwright-deps.sh"), "utf8");

    expect(depsScript).toContain("playwright-apt-sources.mjs");
    expect(depsScript).toContain("Dir::Etc::sourcelist");
    expect(depsScript).toContain("Dir::Etc::sourceparts");
    expect(depsScript).toContain("apt-get update failed");
  });

  it("runs e2e against a production-like Next server", () => {
    const playwrightConfig = readFileSync(resolve("playwright.config.ts"), "utf8");

    expect(playwrightConfig).toContain("NEXTAUTH_SECRET=test-nextauth-secret-32-bytes-minimum");
    expect(playwrightConfig).toContain("NEXTAUTH_URL=http://localhost:3000");
    expect(playwrightConfig).toContain("pnpm build &&");
    expect(playwrightConfig).toContain("pnpm start");
    expect(playwrightConfig).toContain("timeout: 300_000");
  });
});
