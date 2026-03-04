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

const RateSessionSchema = z.object({
  rating: z.number().int().min(1).max(5),
  feedback: z.string().max(2000).optional(),
});

/**
 * POST /api/sessions/[id]/rate
 * Rate a completed session
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

    const { id } = await params;
    const userId = session.user.id;

    const mentorshipSession = await mentorshipService.getSessionById(id);

    if (!mentorshipSession) {
      throw Errors.notFound('Session not found');
    }

    // Only mentee can rate the session
    if (mentorshipSession.menteeId !== userId) {
      throw Errors.forbidden('Only the mentee can rate a session');
    }

    // Check if session is completed
    if (mentorshipSession.status !== 'completed') {
      throw Errors.badRequest('Can only rate completed sessions');
    }

    // Check if already rated
    if (mentorshipSession.rating !== null) {
      throw Errors.conflict('Session has already been rated');
    }

    const body = await request.json();
    const parsed = RateSessionSchema.parse(body);

    const updatedSession = await mentorshipService.rateSession(
      id,
      parsed.rating,
      parsed.feedback
    );

    return NextResponse.json({ session: updatedSession });
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
      return handleApiError(Errors.validation('Invalid rating data', fieldErrors));
    }
    return handleApiError(error);
  }
}
