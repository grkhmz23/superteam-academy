import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

process.env.SKIP_ENV_VALIDATION = "1";

const getTokenMock = vi.fn();

const prismaMock = {
  walletNonce: {
    create: vi.fn(),
    deleteMany: vi.fn(),
  },
};

vi.mock("next-auth/jwt", () => ({
  getToken: getTokenMock,
}));

vi.mock("@/lib/db/client", () => ({
  prisma: prismaMock,
}));

describe("POST /api/auth/nonce", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.walletNonce.create.mockResolvedValue({});
    prismaMock.walletNonce.deleteMany.mockResolvedValue({ count: 0 });
  });

  it("binds nonce to authenticated user when a session token exists", async () => {
    getTokenMock.mockResolvedValue({ sub: "user-1" });

    const { POST } = await import("@/app/api/auth/nonce/route");
    const req = new NextRequest("http://localhost/api/auth/nonce", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-vercel-forwarded-for": "203.0.113.10",
      },
      body: JSON.stringify({
        address: "11111111111111111111111111111111",
      }),
    });

    const response = await POST(req);

    expect(response.status).toBe(200);
    expect(prismaMock.walletNonce.deleteMany).toHaveBeenCalledWith({
      where: {
        address: "11111111111111111111111111111111",
        used: false,
      },
    });
    expect(prismaMock.walletNonce.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          address: "11111111111111111111111111111111",
          userId: "user-1",
        }),
      })
    );
  });

  it("keeps nonce unbound for guest sign-in", async () => {
    getTokenMock.mockResolvedValue(null);

    const { POST } = await import("@/app/api/auth/nonce/route");
    const req = new NextRequest("http://localhost/api/auth/nonce", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-vercel-forwarded-for": "203.0.113.10",
      },
      body: JSON.stringify({
        address: "11111111111111111111111111111111",
      }),
    });

    const response = await POST(req);

    expect(response.status).toBe(200);
    expect(prismaMock.walletNonce.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: null,
        }),
      })
    );
  });
});
