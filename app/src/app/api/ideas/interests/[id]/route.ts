import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/config';
import { ideaService } from '@/lib/services/implementations';
import { prisma } from '@/lib/db/client';
import { Errors, handleApiError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

const UpdateInterestSchema = z.object({
  status: z.enum(['pending', 'accepted', 'declined']),
});

/**
 * PATCH /api/ideas/interests/[id]
 * Update interest status (idea owner only)
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

    const { id: interestId } = await params;
    const userId = session.user.id;

    // Get the interest record with idea info
    const interest = await prisma.ideaInterest.findUnique({
      where: { id: interestId },
      include: {
        idea: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!interest) {
      throw Errors.notFound('Interest not found');
    }

    // Check if user is the idea owner
    if (interest.idea.ownerId !== userId) {
      throw Errors.forbidden('You can only update interests for your own ideas');
    }

    const body = await request.json();
    const parsed = UpdateInterestSchema.parse(body);

    const updatedInterest = await ideaService.updateInterestStatus(
      interestId,
      parsed.status
    );

    return NextResponse.json({ interest: updatedInterest });
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
      return handleApiError(Errors.validation('Invalid status data', fieldErrors));
    }
    return handleApiError(error);
  }
}
