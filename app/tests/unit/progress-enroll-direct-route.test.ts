import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

process.env.SKIP_ENV_VALIDATION = "1";

const getServerSessionMock = vi.fn();
const enrollInCourseMock = vi.fn();

vi.mock("next-auth/next", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("@/lib/auth/config", () => ({
  authOptions: {},
}));

vi.mock("@/lib/services/progress-factory", () => ({
  getProgressService: () => ({
    enrollInCourse: enrollInCourseMock,
  }),
}));

describe("POST /api/progress/enroll-direct", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enrollInCourseMock.mockResolvedValue(undefined);
  });

  it("requires an authenticated session", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const { POST } = await import("@/app/api/progress/enroll-direct/route");
    const response = await POST(
      new NextRequest("http://localhost/api/progress/enroll-direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug: "solana-fundamentals",
        }),
      })
    );

    expect(response.status).toBe(401);
  });

  it("enrolls authenticated users without wallet signature", async () => {
    getServerSessionMock.mockResolvedValue({ user: { id: "user-1" } });

    const { POST } = await import("@/app/api/progress/enroll-direct/route");
    const response = await POST(
      new NextRequest("http://localhost/api/progress/enroll-direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug: "solana-fundamentals",
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(enrollInCourseMock).toHaveBeenCalledWith(
      "user-1",
      "solana-fundamentals"
    );
  });
});
