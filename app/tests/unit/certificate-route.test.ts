import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

process.env.SKIP_ENV_VALIDATION = "1";

const getServerSessionMock = vi.fn();
const getCourseMock = vi.fn();
const getCredentialsMock = vi.fn();

const prismaMock = {
  user: {
    findUnique: vi.fn(),
  },
  enrollment: {
    findUnique: vi.fn(),
  },
  certificateRecord: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
};

vi.mock("next-auth", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("@/lib/auth/config", () => ({
  authOptions: {},
}));

vi.mock("@/lib/db/client", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/services/content-factory", () => ({
  getContentService: () => ({
    getCourse: getCourseMock,
  }),
}));

vi.mock("@/lib/services/onchain", () => ({
  getCredentials: getCredentialsMock,
}));

describe("/api/certificates/[id] GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.certificateRecord.findUnique.mockResolvedValue(null);
    getCredentialsMock.mockResolvedValue([]);
  });

  it("returns a public certificate by public id without auth", async () => {
    getServerSessionMock.mockResolvedValue(null);
    prismaMock.certificateRecord.findUnique.mockResolvedValue({
      publicId: "cert_public123",
      courseSlug: "solana-fundamentals",
      courseNameSnapshot: "Solana Fundamentals",
      completedAt: new Date("2026-03-01T00:00:00.000Z"),
      xpEarned: 1200,
      recipientNameSnapshot: "Jazz Builder",
      recipientWalletSnapshot: "11111111111111111111111111111111",
      credentialMintSnapshot: "Mint111111111111111111111111111111111111111",
      verificationUrlSnapshot:
        "https://explorer.solana.com/address/Mint111111111111111111111111111111111111111?cluster=devnet",
    });

    const { GET } = await import("@/app/api/certificates/[id]/route");
    const res = await GET(
      new NextRequest("http://localhost/api/certificates/cert_public123"),
      { params: Promise.resolve({ id: "cert_public123" }) }
    );
    const body = (await res.json()) as {
      certificate: {
        id: string;
        courseId: string;
        recipientName: string;
        credentialMint: string | null;
      };
      verification: { valid: boolean; owner: string | null };
    };

    expect(res.status).toBe(200);
    expect(body.certificate.id).toBe("cert_public123");
    expect(body.certificate.courseId).toBe("solana-fundamentals");
    expect(body.certificate.recipientName).toBe("Jazz Builder");
    expect(body.certificate.credentialMint).toBe(
      "Mint111111111111111111111111111111111111111"
    );
    expect(body.verification.valid).toBe(true);
    expect(body.verification.owner).toBe("11111111111111111111111111111111");
  });

  it("returns 404 for an unknown public certificate id", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const { GET } = await import("@/app/api/certificates/[id]/route");
    const res = await GET(
      new NextRequest("http://localhost/api/certificates/cert_missing"),
      { params: Promise.resolve({ id: "cert_missing" }) }
    );

    expect(res.status).toBe(404);
  });

  it("creates and returns a public certificate from legacy course slug lookup", async () => {
    getServerSessionMock.mockResolvedValue({ user: { id: "user-1" } });
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      displayName: "Jazz Builder",
      username: "jazzbuilder",
      walletAddress: "11111111111111111111111111111111",
    });
    prismaMock.enrollment.findUnique.mockResolvedValue({
      courseSlug: "solana-fundamentals",
      completedAt: new Date("2026-03-01T00:00:00.000Z"),
    });
    prismaMock.certificateRecord.upsert.mockResolvedValue({
      publicId: "cert_generated123",
      courseSlug: "solana-fundamentals",
      courseNameSnapshot: "Solana Fundamentals",
      completedAt: new Date("2026-03-01T00:00:00.000Z"),
      xpEarned: 1200,
      recipientNameSnapshot: "Jazz Builder",
      recipientWalletSnapshot: "11111111111111111111111111111111",
      credentialMintSnapshot: "Mint111111111111111111111111111111111111111",
      verificationUrlSnapshot:
        "https://explorer.solana.com/address/Mint111111111111111111111111111111111111111?cluster=devnet",
    });
    getCourseMock.mockResolvedValue({
      slug: "solana-fundamentals",
      title: "Solana Fundamentals",
      totalXP: 1200,
    });
    getCredentialsMock.mockResolvedValue([
      {
        id: "asset-1",
        name: "Solana Fundamentals Credential",
        trackName: "solana-fundamentals",
        level: "1",
        mintAddress: "Mint111111111111111111111111111111111111111",
      },
    ]);

    const { GET } = await import("@/app/api/certificates/[id]/route");
    const res = await GET(
      new NextRequest("http://localhost/api/certificates/solana-fundamentals"),
      { params: Promise.resolve({ id: "solana-fundamentals" }) }
    );
    const body = (await res.json()) as {
      certificate: {
        id: string;
        courseId: string;
        courseName: string;
        recipientName: string;
        recipientWallet: string;
        completedAt: string;
        credentialMint: string | null;
        xpEarned: number;
        verificationUrl: string;
      };
      verification: { valid: boolean; owner: string | null };
    };

    expect(res.status).toBe(200);
    expect(body.certificate.id).toBe("cert_generated123");
    expect(body.certificate.courseId).toBe("solana-fundamentals");
    expect(body.certificate.courseName).toBe("Solana Fundamentals");
    expect(body.certificate.recipientName).toBe("Jazz Builder");
    expect(body.certificate.credentialMint).toBe(
      "Mint111111111111111111111111111111111111111"
    );
    expect(body.verification.valid).toBe(true);
    expect(body.verification.owner).toBe("11111111111111111111111111111111");
    expect(prismaMock.certificateRecord.upsert).toHaveBeenCalled();
  });
});
