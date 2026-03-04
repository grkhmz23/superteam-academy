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

const BookSessionSchema = z.object({
  scheduledAt: z.string().datetime(),
  duration: z.number().int().min(15).max(240),
  topic: z.string().min(1).max(500),
});

/**
 * POST /api/mentors/[id]/book
 * Book a session with a mentor (requires authentication)
 */
export async function POST(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw Errors.unauthorized('Unauthorized');
    }

    const { id: mentorId } = await params;
    const menteeId = session.user.id;

    // Check if mentor exists
    const mentor = await mentorshipService.getMentorById(mentorId);
    if (!mentor) {
      throw Errors.notFound('Mentor not found');
    }

    // Prevent booking yourself
    if (mentor.userId === menteeId) {
      throw Errors.badRequest('You cannot book a session with yourself');
    }

    const body = await request.json();
    const parsed = BookSessionSchema.parse(body);

    const mentorshipSession = await mentorshipService.scheduleSession(
      mentorId,
      menteeId,
      {
        scheduledAt: new Date(parsed.scheduledAt),
        duration: parsed.duration,
        topic: parsed.topic,
      }
    );

    return NextResponse.json({ session: mentorshipSession }, { status: 201 });
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
      return handleApiError(Errors.validation('Invalid booking data', fieldErrors));
    }
    // Handle service errors (e.g., slot not available)
    if (error instanceof Error && error.message.includes('not available')) {
      return handleApiError(Errors.conflict('Selected time slot is not available'));
    }
    return handleApiError(error);
  }
}
