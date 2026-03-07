import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

process.env.SKIP_ENV_VALIDATION = "1";

const getTokenMock = vi.fn();

vi.mock("next-auth/jwt", () => ({
  getToken: getTokenMock,
}));

describe("middleware i18n routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTokenMock.mockResolvedValue(null);
  });

  it("does not issue a self-redirect for default-locale public routes", async () => {
    const { middleware } = await import("@/middleware");

    const request = new NextRequest("http://localhost/courses", {
      headers: {
        cookie: "NEXT_LOCALE=en",
      },
    });

    const response = await middleware(request);

    expect(response.headers.get("location")).not.toBe("http://localhost/courses");
    expect(response.headers.get("x-middleware-rewrite")).toBeTruthy();
  });

  it("redirects default-locale prefixed routes to the unprefixed pathname once", async () => {
    const { middleware } = await import("@/middleware");

    const request = new NextRequest("http://localhost/en/courses");
    const response = await middleware(request);

    expect(response.headers.get("location")).toBe("http://localhost/courses");
  });
});
