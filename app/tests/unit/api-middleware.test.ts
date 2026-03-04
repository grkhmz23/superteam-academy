import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { getClientIp } from "@/lib/api/middleware";

describe("getClientIp", () => {
  it("prefers trusted platform headers", () => {
    const request = new NextRequest("http://localhost/api/test", {
      headers: {
        "x-vercel-forwarded-for": "203.0.113.10",
        "x-forwarded-for": "198.51.100.2",
      },
    });

    expect(getClientIp(request)).toBe("203.0.113.10");
  });

  it("ignores generic proxy headers by default", () => {
    const request = new NextRequest("http://localhost/api/test", {
      headers: {
        "x-forwarded-for": "198.51.100.2",
        "x-real-ip": "198.51.100.3",
      },
    });

    expect(getClientIp(request)).toBe("unknown");
  });
});
