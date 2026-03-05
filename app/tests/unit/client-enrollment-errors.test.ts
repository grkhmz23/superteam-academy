import { describe, expect, it } from "vitest";
import { getEnrollmentErrorDescription } from "@/lib/progress/client-enrollment";

describe("getEnrollmentErrorDescription", () => {
  it("maps wallet rejection to a clear message", () => {
    const error = new Error("User rejected the request.");
    expect(getEnrollmentErrorDescription(error)).toBe(
      "Transaction was rejected in your wallet."
    );
  });

  it("maps generic wallet send failures to devnet guidance", () => {
    const error = new Error("WalletSendTransactionError: Unexpected error");
    expect(getEnrollmentErrorDescription(error)).toContain("Solana Devnet");
  });
});
