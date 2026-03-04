import { test, expect } from "@playwright/test";

test.skip(process.env.VISUAL_E2E !== "1", "Visual sanity specs run only when VISUAL_E2E=1.");

const scenarios = [
  {
    path: "/en/courses",
    keyContainer: '[data-testid="courses-filter-card"]',
  },
  {
    path: "/en/jobs",
    keyContainer: '[data-testid="jobs-layout"]',
  },
  {
    path: "/en/playground",
    keyContainer: ".ide-shell",
  },
  {
    path: "/ar/courses",
    keyContainer: '[data-testid="courses-filter-card"]',
  },
  {
    path: "/ar/jobs",
    keyContainer: '[data-testid="jobs-layout"]',
  },
] as const;

for (const theme of ["light", "dark"] as const) {
  test.describe(`visual sanity (${theme})`, () => {
    for (const scenario of scenarios) {
      test(`${scenario.path} renders without obvious layout regressions`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });

        await page.addInitScript((preferredTheme) => {
          window.localStorage.setItem("theme", preferredTheme);
          document.documentElement.classList.toggle("dark", preferredTheme === "dark");
        }, theme);

        await page.goto(scenario.path);

        await expect(page.locator("h1").first()).toBeVisible();
        await expect(page.locator(scenario.keyContainer).first()).toBeVisible();

        const hasHorizontalOverflow = await page.evaluate(() => {
          const root = document.documentElement;
          return root.scrollWidth > root.clientWidth;
        });
        expect(hasHorizontalOverflow).toBe(false);
      });
    }
  });
}
