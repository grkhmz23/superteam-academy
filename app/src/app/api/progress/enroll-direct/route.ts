import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/auth/config";
import { getProgressService } from "@/lib/services/progress-factory";
import { validate, Schemas } from "@/lib/api/validation";
import { Errors, handleApiError } from "@/lib/api/errors";
import { logger, generateRequestId } from "@/lib/logging/logger";

export const dynamic = "force-dynamic";

const enrollDirectSchema = z.object({
  courseSlug: Schemas.slug,
});

export async function POST(request: Request): Promise<Response> {
  const requestId = generateRequestId();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw Errors.unauthorized("You must be signed in to enroll in a course");
    }

    const body = (await request.json()) as unknown;
    const { courseSlug } = validate(enrollDirectSchema, body);

    const progressService = getProgressService();
    await progressService.enrollInCourse(session.user.id, courseSlug);

    logger.info("User enrolled in course without wallet signature", {
      requestId,
      userId: session.user.id,
      courseSlug,
    });

    return NextResponse.json({ success: true, requestId }, { status: 200 });
  } catch (error) {
    logger.error("Failed to enroll in course without wallet signature", {
      requestId,
      error,
    });
    return handleApiError(error);
  }
}
