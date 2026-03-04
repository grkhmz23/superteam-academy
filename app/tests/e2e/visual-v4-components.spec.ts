import { expect, test } from "@playwright/test";

test.skip(
  process.env.VISUAL_E2E !== "1",
  "Set VISUAL_E2E=1 to run the Components Hub visual baseline."
);

test.describe("UI V4 Components Hub visuals", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("captures the catalog hero and results grid", async ({ page }) => {
    await page.goto("/en/components");

    await expect(page.getByTestId("components-catalog-toolbar")).toBeVisible();
    await expect(page.getByTestId("components-results-grid")).toBeVisible();

    await expect(page.getByTestId("components-catalog-toolbar")).toHaveScreenshot(
      "components-toolbar-en.png"
    );
    await expect(page.getByTestId("components-results-grid")).toHaveScreenshot(
      "components-grid-en.png"
    );
  });

  test("captures the detail preview runtime", async ({ page }) => {
    await page.goto("/en/components/token-balance-card");

    await page.getByRole("tab", { name: "Preview" }).click();
    await expect(page.getByTestId("components-detail-preview-tab")).toBeVisible();
    await expect(page.getByTestId("components-detail-preview-tab")).toHaveScreenshot(
      "components-preview-token-balance.png"
    );
  });

  test("captures the RTL catalog layout", async ({ page }) => {
    await page.goto("/ar/components");

    await expect(page.getByTestId("components-catalog-toolbar")).toBeVisible();
    await expect(page.getByTestId("components-catalog-toolbar")).toHaveScreenshot(
      "components-toolbar-ar.png"
    );
  });
});
