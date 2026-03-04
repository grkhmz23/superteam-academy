import { randomBytes } from "crypto";
import type { OnChainCredential } from "@/lib/services/onchain";
import type { Certificate } from "@/types";

interface CertificateRecordSnapshot {
  publicId: string;
  courseSlug: string;
  courseNameSnapshot: string;
  completedAt: Date;
  xpEarned: number;
  recipientNameSnapshot: string;
  recipientWalletSnapshot: string | null;
  credentialMintSnapshot: string | null;
  verificationUrlSnapshot: string | null;
}

export function generateCertificatePublicId(): string {
  return `cert_${randomBytes(9).toString("base64url")}`;
}

export function findMatchingCredential(
  courseId: string,
  credentials: OnChainCredential[]
): OnChainCredential | null {
  const normalizedCourseId = courseId.toLowerCase();

  return (
    credentials.find(
      (credential) =>
        credential.trackName.toLowerCase().includes(normalizedCourseId) ||
        credential.name.toLowerCase().includes(normalizedCourseId)
    ) ?? null
  );
}

export function buildVerificationUrl(credentialMint: string | null): string {
  return credentialMint
    ? `https://explorer.solana.com/address/${credentialMint}?cluster=devnet`
    : "";
}

export function buildCertificateFromRecord(
  record: CertificateRecordSnapshot
): Certificate {
  return {
    id: record.publicId,
    courseId: record.courseSlug,
    courseName: record.courseNameSnapshot,
    recipientName: record.recipientNameSnapshot,
    recipientWallet: record.recipientWalletSnapshot ?? "",
    completedAt: record.completedAt.toISOString(),
    credentialMint: record.credentialMintSnapshot,
    xpEarned: record.xpEarned,
    verificationUrl: record.verificationUrlSnapshot ?? "",
  };
}
