import { describe, expect, it } from "vitest";
import { buildCsp } from "@/middleware";

describe("middleware CSP routing", () => {
  it("uses strict CSP on non-editor routes", () => {
    const csp = buildCsp("/en/dashboard");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).toContain("worker-src 'self'");
  });

  it("uses relaxed CSP on playground route for Monaco", () => {
    const csp = buildCsp("/en/playground");
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain("worker-src 'self' blob:");
  });

  it("allows the playground shell to load analytics and Google-hosted font assets", () => {
    const csp = buildCsp("/en/playground");

    expect(csp).toContain("https://us.i.posthog.com");
    expect(csp).toContain("https://*.i.posthog.com");
    expect(csp).toContain("https://region1.google-analytics.com");
    expect(csp).toContain("style-src 'self' 'unsafe-inline' https://fonts.googleapis.com");
    expect(csp).toContain("font-src 'self' data: https://fonts.gstatic.com");
    expect(csp).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.i.posthog.com");
  });

  it("allows Sentry ingest when a browser DSN is configured", () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN =
      "https://public@example.ingest.de.sentry.io/123456";

    const csp = buildCsp("/en/components");

    expect(csp).toContain("https://example.ingest.de.sentry.io");

    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
  });
});
