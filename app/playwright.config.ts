import { defineConfig, devices } from "@playwright/test";

const e2eServerEnv =
  "NEXTAUTH_SECRET=test-nextauth-secret-32-bytes-minimum NEXTAUTH_URL=http://localhost:3000";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `${e2eServerEnv} pnpm build && ${e2eServerEnv} pnpm start`,
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
