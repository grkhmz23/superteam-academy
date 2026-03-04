import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { mentorshipService } from '@/lib/services/implementations';
import { Errors, handleApiError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sessions
 * Get my sessions (both as mentor and mentee)
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw Errors.unauthorized('Unauthorized');
    }

    const userId = session.user.id;

    // Get sessions where user is mentor
    const mentorSessions = await mentorshipService.getSessionsForUser(userId, 'mentor');

    // Get sessions where user is mentee
    const menteeSessions = await mentorshipService.getSessionsForUser(userId, 'mentee');

    // Parse pagination params
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20', 10)));

    // Combine and sort by scheduled date
    const allSessions = [...mentorSessions, ...menteeSessions].sort(
      (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );

    // Calculate pagination
    const total = allSessions.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSessions = allSessions.slice(startIndex, endIndex);

    return NextResponse.json({
      sessions: paginatedSessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
