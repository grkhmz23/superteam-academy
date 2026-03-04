import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/config';
import { mentorshipService } from '@/lib/services/implementations';
import { Errors, handleApiError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

const TimeSlotSchema = z.object({
  start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
});

const AvailabilityScheduleSchema = z.record(z.array(TimeSlotSchema));

const UpdateMentorSchema = z.object({
  bio: z.string().min(1).max(2000).optional(),
  expertise: z.array(z.string().min(1).max(50)).min(1).max(20).optional(),
  hourlyRate: z.number().int().min(0).optional().nullable(),
  availability: AvailabilityScheduleSchema.optional(),
});

/**
 * GET /api/mentors/[id]
 * Get mentor profile with availability
 */
export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { id } = await params;

    const mentor = await mentorshipService.getMentorById(id);

    if (!mentor) {
      throw Errors.notFound('Mentor not found');
    }

    return NextResponse.json({ mentor });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/mentors/[id]
 * Update mentor profile (requires auth, must be owner)
 */
export async function PATCH(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw Errors.unauthorized('Unauthorized');
    }

    const { id } = await params;

    // Check if mentor exists
    const existingMentor = await mentorshipService.getMentorById(id);
    if (!existingMentor) {
      throw Errors.notFound('Mentor not found');
    }

    // Check ownership
    if (existingMentor.userId !== session.user.id) {
      throw Errors.forbidden('You can only update your own mentor profile');
    }

    const body = await request.json();
    const parsed = UpdateMentorSchema.parse(body);

    // Build update data
    const updateData: Parameters<typeof mentorshipService.updateMentorProfile>[1] = {};

    if (parsed.bio !== undefined) updateData.bio = parsed.bio;
    if (parsed.expertise !== undefined) updateData.expertise = parsed.expertise;
    if (parsed.hourlyRate !== undefined) updateData.hourlyRate = parsed.hourlyRate ?? undefined;
    if (parsed.availability !== undefined) updateData.availability = parsed.availability;

    const mentor = await mentorshipService.updateMentorProfile(id, updateData);

    return NextResponse.json({ mentor });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.reduce<Record<string, string[]>>(
        (acc, issue) => {
          const key = issue.path.join('.') || 'form';
          if (!acc[key]) acc[key] = [];
          acc[key].push(issue.message);
          return acc;
        },
        {}
      );
      return handleApiError(Errors.validation('Invalid mentor data', fieldErrors));
    }
    return handleApiError(error);
  }
}
