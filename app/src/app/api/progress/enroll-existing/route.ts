import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/auth/config";
import { verifyEnrollmentAccountExists } from "@/lib/progress/onchain-sync";
import { ensureWalletLinkedToUser } from "@/lib/progress/ensure-wallet-link";
import { getProgressService } from "@/lib/services/progress-factory";
import { validate, Schemas } from "@/lib/api/validation";
import { Errors, handleApiError } from "@/lib/api/errors";
import { logger, generateRequestId } from "@/lib/logging/logger";

export const dynamic = "force-dynamic";

const enrollExistingSchema = z.object({
  courseSlug: Schemas.slug,
  courseId: z.string().min(1, "Course ID is required"),
  walletAddress: Schemas.walletAddress,
});

export async function POST(request: Request): Promise<Response> {
  const requestId = generateRequestId();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw Errors.unauthorized("You must be signed in to enroll in a course");
    }

    const body = (await request.json()) as unknown;
    const { courseSlug, courseId, walletAddress } = validate(
      enrollExistingSchema,
      body
    );

    const onChainVerification = await verifyEnrollmentAccountExists({
      courseId,
      walletAddress,
    });

    if (!onChainVerification.ok) {
      throw Errors.badRequest(
        onChainVerification.error ?? "On-chain enrollment account not found"
      );
    }

    await ensureWalletLinkedToUser(session.user.id, walletAddress);

    const progressService = getProgressService();
    await progressService.enrollInCourse(session.user.id, courseSlug);

    logger.info("Synced existing on-chain enrollment", {
      requestId,
      userId: session.user.id,
      courseSlug,
      walletAddress,
    });

    return NextResponse.json({ success: true, requestId }, { status: 200 });
  } catch (error) {
    logger.error("Failed to sync existing on-chain enrollment", {
      requestId,
      error,
    });
    return handleApiError(error);
  }
}
