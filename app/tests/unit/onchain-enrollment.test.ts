import { describe, expect, it } from "vitest";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  ENROLL_DISCRIMINATOR,
  SUPERTEAM_ACADEMY_PROGRAM_ID,
  buildEnrollInstruction,
  encodeAnchorString,
} from "@/lib/progress/onchain-enrollment";

describe("onchain enrollment helpers", () => {
  it("encodes Anchor strings with little-endian length prefix", () => {
    const encoded = encodeAnchorString("abc");

    expect(Array.from(encoded)).toEqual([3, 0, 0, 0, 97, 98, 99]);
  });

  it("builds the direct enroll instruction for the academy program", () => {
    const learner = new PublicKey("11111111111111111111111111111111");
    const instruction = buildEnrollInstruction({
      courseId: "solana-fundamentals",
      learner,
    });

    expect(instruction.programId.toBase58()).toBe(
      SUPERTEAM_ACADEMY_PROGRAM_ID.toBase58()
    );
    expect(instruction.keys).toEqual([
      expect.objectContaining({ pubkey: expect.any(PublicKey), isSigner: false, isWritable: true }),
      expect.objectContaining({ pubkey: expect.any(PublicKey), isSigner: false, isWritable: true }),
      expect.objectContaining({ pubkey: learner, isSigner: true, isWritable: true }),
      expect.objectContaining({ pubkey: SystemProgram.programId, isSigner: false, isWritable: false }),
    ]);

    const expected = Buffer.concat([
      Buffer.from(ENROLL_DISCRIMINATOR),
      Buffer.from([19, 0, 0, 0]),
      Buffer.from("solana-fundamentals", "utf8"),
    ]);

    expect(Buffer.from(instruction.data)).toEqual(expected);
  });
});
