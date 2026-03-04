import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { projectService } from '@/lib/services/implementations';
import { Errors, handleApiError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/projects/[id]/like
 * Toggle like on a project (requires authentication)
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

    const { id: projectId } = await params;
    const userId = session.user.id;

    // Check if project exists
    const project = await projectService.getProjectById(projectId);
    if (!project) {
      throw Errors.notFound('Project not found');
    }

    // Prevent users from liking their own projects
    if (project.ownerId === userId) {
      throw Errors.badRequest('You cannot like your own project');
    }

    const isLiked = await projectService.toggleLike(projectId, userId);

    return NextResponse.json({ liked: isLiked });
  } catch (error) {
    return handleApiError(error);
  }
}
