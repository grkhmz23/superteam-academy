import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

process.env.SKIP_ENV_VALIDATION = "1";

const getServerSessionMock = vi.fn();
const enrollInCourseMock = vi.fn();
const verifyEnrollmentTransactionMock = vi.fn();
const prismaMock = {
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  userWallet: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    updateMany: vi.fn(),
    upsert: vi.fn(),
  },
};

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

vi.mock("@/lib/db/client", () => ({
  prisma: prismaMock,
}));

describe("POST /api/progress/enroll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enrollInCourseMock.mockResolvedValue(undefined);
    verifyEnrollmentTransactionMock.mockResolvedValue({ ok: true });
    prismaMock.user.findUnique.mockResolvedValue({ walletAddress: "11111111111111111111111111111111" });
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.update.mockResolvedValue({});
    prismaMock.userWallet.findFirst.mockResolvedValue(null);
    prismaMock.userWallet.findUnique.mockResolvedValue(null);
    prismaMock.userWallet.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.userWallet.upsert.mockResolvedValue({});
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

  it("auto-links wallet when tx wallet is not linked yet", async () => {
    getServerSessionMock.mockResolvedValue({ user: { id: "user-1" } });
    prismaMock.user.findUnique.mockResolvedValue({ walletAddress: "22222222222222222222222222222222" });
    prismaMock.userWallet.findFirst.mockResolvedValue(null);

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
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { walletAddress: "11111111111111111111111111111111" },
    });
    expect(enrollInCourseMock).toHaveBeenCalled();
  });

  it("rejects enrollment sync when tx wallet is already linked to another user", async () => {
    getServerSessionMock.mockResolvedValue({ user: { id: "user-1" } });
    prismaMock.user.findUnique.mockResolvedValue({ walletAddress: "22222222222222222222222222222222" });
    prismaMock.userWallet.findFirst.mockResolvedValue(null);
    prismaMock.user.findFirst.mockResolvedValue({ id: "user-2" });

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

    expect(response.status).toBe(403);
    expect(enrollInCourseMock).not.toHaveBeenCalled();
  });
});
