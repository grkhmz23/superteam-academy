import { Buffer } from "buffer";
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";

const DEFAULT_SUPERTEAM_ACADEMY_PROGRAM_ID =
  "ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf";

export const SUPERTEAM_ACADEMY_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_SUPERTEAM_ACADEMY_PROGRAM_ID ||
    DEFAULT_SUPERTEAM_ACADEMY_PROGRAM_ID
);

export const ENROLL_DISCRIMINATOR = Uint8Array.from([
  58, 12, 36, 3, 142, 28, 1, 43,
]);

function utf8Bytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function concatBytes(...chunks: Uint8Array[]): Uint8Array {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

export function encodeAnchorString(value: string): Uint8Array {
  const text = utf8Bytes(value);
  const length = new Uint8Array(4);
  new DataView(length.buffer).setUint32(0, text.length, true);
  return concatBytes(length, text);
}

export function deriveCoursePda(courseId: string): PublicKey {
  const [coursePda] = PublicKey.findProgramAddressSync(
    [utf8Bytes("course"), utf8Bytes(courseId)],
    SUPERTEAM_ACADEMY_PROGRAM_ID
  );

  return coursePda;
}

export function deriveEnrollmentPda(
  courseId: string,
  learner: PublicKey
): PublicKey {
  const [enrollmentPda] = PublicKey.findProgramAddressSync(
    [
      utf8Bytes("enrollment"),
      utf8Bytes(courseId),
      learner.toBuffer(),
    ],
    SUPERTEAM_ACADEMY_PROGRAM_ID
  );

  return enrollmentPda;
}

export function buildEnrollInstruction(input: {
  courseId: string;
  learner: PublicKey;
}): TransactionInstruction {
  const { courseId, learner } = input;
  const coursePda = deriveCoursePda(courseId);
  const enrollmentPda = deriveEnrollmentPda(courseId, learner);
  const data = Buffer.from(
    concatBytes(ENROLL_DISCRIMINATOR, encodeAnchorString(courseId))
  );

  return new TransactionInstruction({
    programId: SUPERTEAM_ACADEMY_PROGRAM_ID,
    keys: [
      { pubkey: coursePda, isSigner: false, isWritable: true },
      { pubkey: enrollmentPda, isSigner: false, isWritable: true },
      { pubkey: learner, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}
