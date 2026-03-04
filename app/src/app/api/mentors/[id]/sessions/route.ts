import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { mentorshipService } from '@/lib/services/implementations';
import { Errors, handleApiError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/mentors/[id]/sessions
 * Get mentor's sessions (owner only)
 */
export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw Errors.unauthorized('Unauthorized');
    }

    const { id: mentorId } = params;

    // Check if mentor exists
    const mentor = await mentorshipService.getMentorById(mentorId);
    if (!mentor) {
      throw Errors.notFound('Mentor not found');
    }

    // Check ownership
    if (mentor.userId !== session.user.id) {
      throw Errors.forbidden('You can only view your own sessions');
    }

    const sessions = await mentorshipService.getSessionsForUser(session.user.id, 'mentor');

    return NextResponse.json({ sessions });
  } catch (error) {
    return handleApiError(error);
  }
}
