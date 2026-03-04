import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/config';
import { ideaService } from '@/lib/services/implementations';
import { prisma } from '@/lib/db/client';
import { Errors, handleApiError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

const ExpressInterestSchema = z.object({
  role: z.enum(['developer', 'investor', 'advisor', 'designer', 'marketer']),
  message: z.string().min(1).max(2000),
});

/**
 * POST /api/ideas/[id]/interest
 * Express interest in an idea (requires authentication)
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

    const { id: ideaId } = params;
    const userId = session.user.id;

    // Check if idea exists
    const idea = await ideaService.getIdeaById(ideaId);
    if (!idea) {
      throw Errors.notFound('Idea not found');
    }

    // Prevent owner from expressing interest in their own idea
    if (idea.ownerId === userId) {
      throw Errors.badRequest('You cannot express interest in your own idea');
    }

    // Check if already expressed interest
    const existingInterest = await prisma.ideaInterest.findUnique({
      where: {
        ideaId_userId: {
          ideaId,
          userId,
        },
      },
    });
    if (existingInterest) {
      throw Errors.conflict('You have already expressed interest in this idea');
    }

    const body = await request.json();
    const parsed = ExpressInterestSchema.parse(body);

    const interest = await ideaService.expressInterest(ideaId, userId, {
      role: parsed.role,
      message: parsed.message,
    });

    return NextResponse.json({ interest }, { status: 201 });
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
      return handleApiError(Errors.validation('Invalid interest data', fieldErrors));
    }
    return handleApiError(error);
  }
}
