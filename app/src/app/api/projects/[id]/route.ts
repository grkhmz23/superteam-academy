import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/config';
import { projectService } from '@/lib/services/implementations';
import { prisma } from '@/lib/db/client';
import { Errors, handleApiError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

const UpdateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(10000).optional(),
  tags: z.array(z.string().min(1).max(50)).min(1).max(10).optional(),
  thumbnail: z.string().url().optional().nullable(),
  githubUrl: z.string().url().optional().nullable(),
  demoUrl: z.string().url().optional().nullable(),
  contractAddress: z.string().optional().nullable(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

/**
 * GET /api/projects/[id]
 * Get project by ID with feedback
 */
export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { id } = params;

    const project = await projectService.getProjectById(id);

    if (!project) {
      throw Errors.notFound('Project not found');
    }

    // Increment views
    await projectService.incrementViews(id);

    return NextResponse.json({ project });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/projects/[id]
 * Update project (requires auth, must be owner or admin)
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

    // Check if project exists
    const existingProject = await projectService.getProjectById(id);
    if (!existingProject) {
      throw Errors.notFound('Project not found');
    }

    // Check ownership or admin status
    const isOwner = existingProject.ownerId === session.user.id;
    const isAdmin = await checkIsAdmin(session.user.id);

    if (!isOwner && !isAdmin) {
      throw Errors.forbidden('You can only update your own projects');
    }

    const body = await request.json();
    const parsed = UpdateProjectSchema.parse(body);

    // Build update data
    const updateData: Partial<{
      title: string;
      description: string;
      tags: string[];
      thumbnail: string;
      githubUrl: string;
      demoUrl: string;
      contractAddress: string;
      status: string;
    }> = {};

    if (parsed.title !== undefined) updateData.title = parsed.title;
    if (parsed.description !== undefined) updateData.description = parsed.description;
    if (parsed.tags !== undefined) updateData.tags = parsed.tags;
    if (parsed.thumbnail !== undefined) updateData.thumbnail = parsed.thumbnail ?? undefined;
    if (parsed.githubUrl !== undefined) updateData.githubUrl = parsed.githubUrl ?? undefined;
    if (parsed.demoUrl !== undefined) updateData.demoUrl = parsed.demoUrl ?? undefined;
    if (parsed.contractAddress !== undefined) updateData.contractAddress = parsed.contractAddress ?? undefined;
    if (parsed.status !== undefined) updateData.status = parsed.status;

    const project = await projectService.updateProject(id, updateData);

    return NextResponse.json({ project });
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
      return handleApiError(Errors.validation('Invalid project data', fieldErrors));
    }
    return handleApiError(error);
  }
}

/**
 * DELETE /api/projects/[id]
 * Delete project (requires auth, must be owner or admin)
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

    // Check if project exists
    const existingProject = await projectService.getProjectById(id);
    if (!existingProject) {
      throw Errors.notFound('Project not found');
    }

    // Check ownership or admin status
    const isOwner = existingProject.ownerId === session.user.id;
    const isAdmin = await checkIsAdmin(session.user.id);

    if (!isOwner && !isAdmin) {
      throw Errors.forbidden('You can only delete your own projects');
    }

    await projectService.deleteProject(id);

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
