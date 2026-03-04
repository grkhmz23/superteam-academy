import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/config';
import { jobService } from '@/lib/services/implementations';
import { prisma } from '@/lib/db/client';
import { Errors, handleApiError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

const UpdateJobSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(10000).optional(),
  company: z.string().min(1).max(200).optional(),
  companyLogo: z.string().url().optional().nullable(),
  location: z.string().min(1).max(200).optional(),
  type: z.enum(['full-time', 'part-time', 'contract']).optional(),
  salaryRange: z.string().max(100).optional().nullable(),
  skills: z.array(z.string().min(1).max(50)).min(1).max(20).optional(),
  experience: z.enum(['junior', 'mid', 'senior']).optional(),
  status: z.enum(['active', 'closed', 'expired']).optional(),
  expiresAt: z.string().datetime().optional(),
});

/**
 * GET /api/jobs/[id]
 * Get job by ID with applicant count
 */
export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { id } = await params;

    const job = await jobService.getJobById(id);

    if (!job) {
      throw Errors.notFound('Job not found');
    }

    // Get applicant count
    const applications = await jobService.getApplicationsForJob(id);
    const applicantCount = applications.length;

    // Get current user session (optional - for skill match score)
    const session = await getServerSession(authOptions);
    let skillMatchScore: number | undefined;
    let hasApplied = false;

    if (session?.user?.id) {
      skillMatchScore = await jobService.getSkillMatchScore(id, session.user.id);
      hasApplied = applications.some(
        (app) => app.userId === session.user.id
      );
    }

    return NextResponse.json({
      job: {
        ...job,
        applicantCount,
        skillMatchScore,
        hasApplied,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/jobs/[id]
 * Update job (requires auth, must be owner or admin)
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

    const { id } = await params;

    // Check if job exists
    const existingJob = await jobService.getJobById(id);
    if (!existingJob) {
      throw Errors.notFound('Job not found');
    }

    // Check ownership or admin status
    const isOwner = existingJob.postedBy === session.user.id;
    const isAdmin = await checkIsAdmin(session.user.id);

    if (!isOwner && !isAdmin) {
      throw Errors.forbidden('You can only update your own jobs');
    }

    const body = await request.json();
    const parsed = UpdateJobSchema.parse(body);

    // Build update data (convert null to undefined for optional string fields)
    const updateData: Partial<{
      title: string;
      description: string;
      company: string;
      companyLogo: string;
      location: string;
      type: string;
      salaryRange: string;
      skills: string[];
      experience: string;
      status: string;
      expiresAt: Date;
    }> = {};

    if (parsed.title !== undefined) updateData.title = parsed.title;
    if (parsed.description !== undefined) updateData.description = parsed.description;
    if (parsed.company !== undefined) updateData.company = parsed.company;
    if (parsed.companyLogo !== undefined) updateData.companyLogo = parsed.companyLogo ?? undefined;
    if (parsed.location !== undefined) updateData.location = parsed.location;
    if (parsed.type !== undefined) updateData.type = parsed.type;
    if (parsed.salaryRange !== undefined) updateData.salaryRange = parsed.salaryRange ?? undefined;
    if (parsed.skills !== undefined) updateData.skills = parsed.skills;
    if (parsed.experience !== undefined) updateData.experience = parsed.experience;
    if (parsed.status !== undefined) updateData.status = parsed.status;
    if (parsed.expiresAt !== undefined) updateData.expiresAt = new Date(parsed.expiresAt);

    const job = await jobService.updateJob(id, updateData);

    return NextResponse.json({ job });
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
      return handleApiError(Errors.validation('Invalid job data', fieldErrors));
    }
    return handleApiError(error);
  }
}

/**
 * DELETE /api/jobs/[id]
 * Delete job (requires auth, must be owner or admin)
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

    const { id } = await params;

    // Check if job exists
    const existingJob = await jobService.getJobById(id);
    if (!existingJob) {
      throw Errors.notFound('Job not found');
    }

    // Check ownership or admin status
    const isOwner = existingJob.postedBy === session.user.id;
    const isAdmin = await checkIsAdmin(session.user.id);

    if (!isOwner && !isAdmin) {
      throw Errors.forbidden('You can only delete your own jobs');
    }

    await jobService.deleteJob(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

async function checkIsAdmin(userId: string): Promise<boolean> {
  // For now, simple check - can be extended with roles system
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  // Add admin email patterns if needed
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') ?? [];
  return adminEmails.includes(user?.email ?? '');
}
