import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getOnChainXP,
  isValidWalletAddress,
  XP_MINT,
} from "@/lib/services/onchain";

describe("On-Chain XP Service", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("isValidWalletAddress", () => {
    it("should return true for valid Solana addresses", () => {
      expect(
        isValidWalletAddress("11111111111111111111111111111111")
      ).toBe(true);
      expect(
        isValidWalletAddress("So11111111111111111111111111111111111111112")
      ).toBe(true);
      expect(
        isValidWalletAddress("ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf")
      ).toBe(true);
    });

    it("should return false for invalid addresses", () => {
      expect(isValidWalletAddress("short")).toBe(false);
      expect(
        isValidWalletAddress(
          "thisisaverylongaddressthatshouldnotbevalidatall"
        )
      ).toBe(false);
      expect(isValidWalletAddress("H6f4Q8z2K3mN7pQrStUvWxYz123456789AbCdEfGh0")).toBe(
        false
      );
      expect(isValidWalletAddress("H6f4Q8z2K3mN7pQrStUvWxYz123456789AbCdEfGhI")).toBe(
        false
      );
      expect(isValidWalletAddress("")).toBe(false);
      expect(isValidWalletAddress(null as unknown as string)).toBe(false);
      expect(isValidWalletAddress(undefined as unknown as string)).toBe(false);
    });
  });

  describe("getOnChainXP", () => {
    it("should return null for invalid wallet address", async () => {
      const result = await getOnChainXP("invalid-address");

      expect(result).toBeNull();
    });

    it("should export XP_MINT constant with fallback", () => {
      const expectedDefault = "xpXPUjkfk7t4AJF1tYUoyAYxzuM5DhinZWS1WjfjAu3";
      expect(XP_MINT).toBe(
        process.env.NEXT_PUBLIC_XP_MINT_ADDRESS || expectedDefault
      );
    });
  });

  describe("XP_MINT configuration", () => {
    it("should always resolve to env override or default mint", () => {
      const expectedMint =
        process.env.NEXT_PUBLIC_XP_MINT_ADDRESS ||
        "xpXPUjkfk7t4AJF1tYUoyAYxzuM5DhinZWS1WjfjAu3";
      expect(XP_MINT).toBe(expectedMint);
    });
  });
});
