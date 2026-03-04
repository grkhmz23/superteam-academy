import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { Errors, handleApiError } from "@/lib/api/errors";
import { generateBookableSlots } from "@/lib/mentorship/slots";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const days = Math.min(30, Math.max(1, Number.parseInt(url.searchParams.get("days") ?? "14", 10)));
    const durationMinutes = Math.min(
      240,
      Math.max(15, Number.parseInt(url.searchParams.get("duration") ?? "60", 10))
    );

    const mentor = await prisma.mentorProfile.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        availability: true,
      },
    });

    if (!mentor) {
      throw Errors.notFound("Mentor not found");
    }

    const now = new Date();
    const sessions = await prisma.mentorshipSession.findMany({
      where: {
        mentorId: params.id,
        status: { in: ["scheduled", "in_progress"] },
        scheduledAt: { gte: now },
      },
      select: {
        scheduledAt: true,
        duration: true,
        status: true,
      },
      orderBy: { scheduledAt: "asc" },
    });

    const slots = generateBookableSlots({
      availability: (mentor.availability as Record<string, Array<{ start: string; end: string }>>) ?? {},
      startDate: now,
      now,
      days,
      durationMinutes,
      sessions,
    });

    return NextResponse.json({
      slots: slots.map((slot) => ({
        id: slot.id,
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
        isBooked: slot.isBooked,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
