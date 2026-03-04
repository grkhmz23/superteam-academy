import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/config';
import { mentorshipService } from '@/lib/services/implementations';
import { prisma } from '@/lib/db/client';
import { Errors, handleApiError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

const UpdateSessionSchema = z.object({
  status: z.enum(['completed', 'cancelled']),
  notes: z.string().max(2000).optional(),
});

/**
 * GET /api/sessions/[id]
 * Get session detail
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

    const { id } = params;
    const userId = session.user.id;

    const mentorshipSession = await mentorshipService.getSessionById(id);

    if (!mentorshipSession) {
      throw Errors.notFound('Session not found');
    }

    // Get mentor info to check ownership
    const mentor = await prisma.mentorProfile.findUnique({
      where: { id: mentorshipSession.mentorId },
      select: { userId: true },
    });

    // Check if user is either the mentor or mentee
    const isMentor = mentor?.userId === userId;
    const isMentee = mentorshipSession.menteeId === userId;

    if (!isMentor && !isMentee) {
      throw Errors.forbidden('You can only view your own sessions');
    }

    return NextResponse.json({ session: mentorshipSession });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/sessions/[id]
 * Update session status (complete, cancel)
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

    const { id } = params;
    const userId = session.user.id;

    const mentorshipSession = await mentorshipService.getSessionById(id);

    if (!mentorshipSession) {
      throw Errors.notFound('Session not found');
    }

    // Get mentor info to check ownership
    const mentor = await prisma.mentorProfile.findUnique({
      where: { id: mentorshipSession.mentorId },
      select: { userId: true },
    });

    // Check if user is either the mentor or mentee
    const isMentor = mentor?.userId === userId;
    const isMentee = mentorshipSession.menteeId === userId;

    if (!isMentor && !isMentee) {
      throw Errors.forbidden('You can only update your own sessions');
    }

    const body = await request.json();
    const parsed = UpdateSessionSchema.parse(body);

    let updatedSession;

    if (parsed.status === 'completed') {
      // Only mentor can mark as completed
      if (!isMentor) {
        throw Errors.forbidden('Only the mentor can mark a session as completed');
      }
      updatedSession = await mentorshipService.completeSession(id, parsed.notes);
    } else if (parsed.status === 'cancelled') {
      updatedSession = await mentorshipService.cancelSession(id, parsed.notes);
    }

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
      return handleApiError(Errors.validation('Invalid session data', fieldErrors));
    }
    return handleApiError(error);
  }
}
