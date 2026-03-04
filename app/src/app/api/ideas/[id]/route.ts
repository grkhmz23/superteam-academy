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

const UpdateIdeaSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(10000).optional(),
  problem: z.string().min(1).max(5000).optional(),
  solution: z.string().min(1).max(5000).optional(),
  marketSize: z.string().max(1000).optional().nullable(),
  traction: z.string().max(2000).optional().nullable(),
  lookingFor: z.array(z.enum(['developer', 'investor', 'advisor', 'designer', 'marketer'])).min(1).optional(),
  stage: z.enum(['idea', 'mvp', 'launched']).optional(),
  status: z.enum(['active', 'closed']).optional(),
});

/**
 * GET /api/ideas/[id]
 * Get idea detail with interests
 */
export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { id } = params;

    const idea = await ideaService.getIdeaById(id);

    if (!idea) {
      throw Errors.notFound('Idea not found');
    }

    return NextResponse.json({ idea });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/ideas/[id]
 * Update idea (requires auth, must be owner)
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

    // Check if idea exists
    const existingIdea = await ideaService.getIdeaById(id);
    if (!existingIdea) {
      throw Errors.notFound('Idea not found');
    }

    // Check ownership
    if (existingIdea.ownerId !== session.user.id) {
      throw Errors.forbidden('You can only update your own ideas');
    }

    const body = await request.json();
    const parsed = UpdateIdeaSchema.parse(body);

    let idea;

    // Handle status change separately using closeIdea
    if (parsed.status === 'closed') {
      idea = await ideaService.closeIdea(id);
    } else {
      // Build update data
      const updateData: Parameters<typeof ideaService.updateIdea>[1] = {};

      if (parsed.title !== undefined) updateData.title = parsed.title;
      if (parsed.description !== undefined) updateData.description = parsed.description;
      if (parsed.problem !== undefined) updateData.problem = parsed.problem;
      if (parsed.solution !== undefined) updateData.solution = parsed.solution;
      if (parsed.marketSize !== undefined) updateData.marketSize = parsed.marketSize ?? undefined;
      if (parsed.traction !== undefined) updateData.traction = parsed.traction ?? undefined;
      if (parsed.lookingFor !== undefined) updateData.lookingFor = parsed.lookingFor;
      if (parsed.stage !== undefined) updateData.stage = parsed.stage;

      idea = await ideaService.updateIdea(id, updateData);
    }

    return NextResponse.json({ idea });
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
      return handleApiError(Errors.validation('Invalid idea data', fieldErrors));
    }
    return handleApiError(error);
  }
}

/**
 * DELETE /api/ideas/[id]
 * Delete idea (requires auth, must be owner)
 */
export async function DELETE(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw Errors.unauthorized('Unauthorized');
    }

    const { id } = params;

    // Check if idea exists
    const existingIdea = await ideaService.getIdeaById(id);
    if (!existingIdea) {
      throw Errors.notFound('Idea not found');
    }

    // Check ownership
    const isOwner = existingIdea.ownerId === session.user.id;
    const isAdmin = await checkIsAdmin(session.user.id);

    if (!isOwner && !isAdmin) {
      throw Errors.forbidden('You can only delete your own ideas');
    }

    await ideaService.deleteIdea(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

async function checkIsAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  const adminEmails = process.env.ADMIN_EMAILS?.split(',') ?? [];
  return adminEmails.includes(user?.email ?? '');
}
