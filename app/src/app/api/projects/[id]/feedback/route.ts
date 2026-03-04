import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/config';
import { projectService } from '@/lib/services/implementations';
import { Errors, handleApiError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

const FeedbackSchema = z.object({
  content: z.string().min(1).max(5000),
  rating: z.number().int().min(1).max(5),
});

/**
 * POST /api/projects/[id]/feedback
 * Add feedback to a project (requires authentication)
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

    const { id: projectId } = params;
    const userId = session.user.id;

    // Check if project exists
    const project = await projectService.getProjectById(projectId);
    if (!project) {
      throw Errors.notFound('Project not found');
    }

    // Prevent users from reviewing their own projects
    if (project.ownerId === userId) {
      throw Errors.badRequest('You cannot review your own project');
    }

    const body = await request.json();
    const parsed = FeedbackSchema.parse(body);

    const feedback = await projectService.addFeedback(projectId, userId, {
      content: parsed.content,
      rating: parsed.rating,
    });

    return NextResponse.json({ feedback }, { status: 201 });
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
      return handleApiError(Errors.validation('Invalid feedback data', fieldErrors));
    }
    return handleApiError(error);
  }
}
