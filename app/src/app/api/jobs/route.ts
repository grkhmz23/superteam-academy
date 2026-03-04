import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/config';
import { jobService } from '@/lib/services/implementations';
import { Errors, handleApiError } from '@/lib/api/errors';
import type { JobFilter } from '@/lib/services/interfaces/jobs';

export const dynamic = 'force-dynamic';

const CreateJobSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(10000),
  company: z.string().min(1).max(200),
  companyLogo: z.string().url().optional(),
  location: z.string().min(1).max(200),
  type: z.enum(['full-time', 'part-time', 'contract']),
  salaryRange: z.string().max(100).optional(),
  skills: z.array(z.string().min(1).max(50)).min(1).max(20),
  experience: z.enum(['junior', 'mid', 'senior']),
  expiresAt: z.string().datetime().optional(),
});

/**
 * GET /api/jobs
 * List jobs with filtering and pagination
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Parse pagination params
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));

    // Build filter
    const filter: JobFilter = {};

    const skills = searchParams.get('skills');
    if (skills) {
      filter.skills = skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    const experience = searchParams.get('experience');
    if (experience && ['junior', 'mid', 'senior'].includes(experience)) {
      filter.experience = experience as JobFilter['experience'];
    }

    const location = searchParams.get('location');
    if (location && ['remote', 'on-site', 'hybrid'].includes(location)) {
      filter.location = location as JobFilter['location'];
    }

    const type = searchParams.get('type');
    if (type && ['full-time', 'part-time', 'contract'].includes(type)) {
      filter.type = type as JobFilter['type'];
    }

    const query = searchParams.get('query');
    if (query) {
      filter.query = query;
    }

    // Get current user session (optional - for skill match score)
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Fetch jobs
    const jobs = await jobService.getJobs(filter, page, limit);

    // Add skill match scores for authenticated users
    let jobsWithScore = jobs;
    if (userId) {
      jobsWithScore = await Promise.all(
        jobs.map(async (job) => {
          const skillMatchScore = await jobService.getSkillMatchScore(job.id, userId);
          return { ...job, skillMatchScore };
        })
      );
    }

    return NextResponse.json({
      jobs: jobsWithScore,
      pagination: {
        page,
        limit,
        total: jobs.length, // Note: This is the count for current page, ideally we'd get total count
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/jobs
 * Create a new job (requires authentication)
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw Errors.unauthorized('Unauthorized');
    }

    const body = await request.json();
    const parsed = CreateJobSchema.parse(body);

    // Set default expiration to 30 days if not provided
    const expiresAt = parsed.expiresAt
      ? new Date(parsed.expiresAt)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const job = await jobService.createJob(
      {
        title: parsed.title,
        description: parsed.description,
        company: parsed.company,
        companyLogo: parsed.companyLogo,
        location: parsed.location,
        type: parsed.type,
        salaryRange: parsed.salaryRange,
        skills: parsed.skills,
        experience: parsed.experience,
        expiresAt,
      },
      session.user.id
    );

    return NextResponse.json({ job }, { status: 201 });
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
