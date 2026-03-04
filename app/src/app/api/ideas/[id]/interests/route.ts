import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { ideaService } from '@/lib/services/implementations';
import { Errors, handleApiError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/ideas/[id]/interests
 * Get interests for idea (owner only)
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

    const { id: ideaId } = await params;
    const userId = session.user.id;

    // Check if idea exists
    const idea = await ideaService.getIdeaById(ideaId);
    if (!idea) {
      throw Errors.notFound('Idea not found');
    }

    // Check ownership
    if (idea.ownerId !== userId) {
      throw Errors.forbidden('You can only view interests for your own ideas');
    }

    const interests = await ideaService.getInterestsForIdea(ideaId);

    return NextResponse.json({ interests });
  } catch (error) {
    return handleApiError(error);
  }
}
