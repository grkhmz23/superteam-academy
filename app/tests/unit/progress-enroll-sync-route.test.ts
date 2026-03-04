import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

process.env.SKIP_ENV_VALIDATION = "1";

const getServerSessionMock = vi.fn();
const enrollInCourseMock = vi.fn();
const verifyEnrollmentTransactionMock = vi.fn();

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

vi.mock("@/lib/progress/onchain-sync", () => ({
  verifyEnrollmentTransaction: verifyEnrollmentTransactionMock,
}));

describe("POST /api/progress/enroll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enrollInCourseMock.mockResolvedValue(undefined);
    verifyEnrollmentTransactionMock.mockResolvedValue({ ok: true });
  });

  it("requires an authenticated session", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const { POST } = await import("@/app/api/progress/enroll/route");
    const response = await POST(
      new NextRequest("http://localhost/api/progress/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug: "solana-fundamentals",
          courseId: "solana-fundamentals",
          walletAddress: "11111111111111111111111111111111",
          transactionSignature: "sig-1",
        }),
      })
    );

    expect(response.status).toBe(401);
  });

  it("rejects unverified transaction signatures", async () => {
    getServerSessionMock.mockResolvedValue({ user: { id: "user-1" } });
    verifyEnrollmentTransactionMock.mockResolvedValue({
      ok: false,
      error: "Transaction was not confirmed on devnet",
    });

    const { POST } = await import("@/app/api/progress/enroll/route");
    const response = await POST(
      new NextRequest("http://localhost/api/progress/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug: "solana-fundamentals",
          courseId: "solana-fundamentals",
          walletAddress: "11111111111111111111111111111111",
          transactionSignature: "sig-1",
        }),
      })
    );

    expect(response.status).toBe(400);
    expect(enrollInCourseMock).not.toHaveBeenCalled();
  });

  it("syncs a confirmed on-chain enrollment into the local progress mirror", async () => {
    getServerSessionMock.mockResolvedValue({ user: { id: "user-1" } });

    const { POST } = await import("@/app/api/progress/enroll/route");
    const response = await POST(
      new NextRequest("http://localhost/api/progress/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug: "solana-fundamentals",
          courseId: "solana-fundamentals",
          walletAddress: "11111111111111111111111111111111",
          transactionSignature: "sig-1",
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(verifyEnrollmentTransactionMock).toHaveBeenCalledWith({
      courseSlug: "solana-fundamentals",
      courseId: "solana-fundamentals",
      walletAddress: "11111111111111111111111111111111",
      transactionSignature: "sig-1",
    });
    expect(enrollInCourseMock).toHaveBeenCalledWith(
      "user-1",
      "solana-fundamentals"
    );
  });
});
