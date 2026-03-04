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

const ApplySchema = z.object({
  coverLetter: z.string().max(5000).optional(),
});

/**
 * POST /api/jobs/[id]/apply
 * Apply to a job (requires authentication)
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

    const { id: jobId } = await params;
    const userId = session.user.id;

    // Check if job exists and is active
    const job = await jobService.getJobById(jobId);
    if (!job) {
      throw Errors.notFound('Job not found');
    }

    if (job.status !== 'active') {
      throw Errors.badRequest('This job is no longer accepting applications');
    }

    // Check if job has expired
    if (new Date() > new Date(job.expiresAt)) {
      throw Errors.badRequest('This job posting has expired');
    }

    // Check if user is the job poster
    if (job.postedBy === userId) {
      throw Errors.badRequest('You cannot apply to your own job posting');
    }

    // Check if user already applied
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        jobId_userId: {
          jobId,
          userId,
        },
      },
    });

    if (existingApplication) {
      throw Errors.conflict('You have already applied to this job');
    }

    const body = await request.json();
    const parsed = ApplySchema.parse(body);

    // Create application
    const application = await jobService.applyToJob(jobId, userId, {
      coverLetter: parsed.coverLetter,
    });

    return NextResponse.json({ application }, { status: 201 });
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
      return handleApiError(Errors.validation('Invalid application data', fieldErrors));
    }
    return handleApiError(error);
  }
}
