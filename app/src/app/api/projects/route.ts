import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/config';
import { projectService } from '@/lib/services/implementations';
import { Errors, handleApiError } from '@/lib/api/errors';
import type { ProjectFilter } from '@/lib/services/interfaces/projects';

export const dynamic = 'force-dynamic';

const CreateProjectSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(10000),
  tags: z.array(z.string().min(1).max(50)).min(1).max(10),
  thumbnail: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  demoUrl: z.string().url().optional(),
  contractAddress: z.string().optional(),
});

/**
 * GET /api/projects
 * List projects with filtering and pagination
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Parse pagination params
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));

    // Build filter
    const filter: ProjectFilter = {};

    const tags = searchParams.get('tags');
    if (tags) {
      filter.tags = tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    const ownerId = searchParams.get('ownerId');
    if (ownerId) {
      filter.ownerId = ownerId;
    }

    const featured = searchParams.get('featured');
    if (featured === 'true') {
      filter.featured = true;
    }

    const query = searchParams.get('query');
    if (query) {
      filter.query = query;
    }

    const projects = await projectService.getProjects(filter, page, limit);

    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total: projects.length,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/projects
 * Create a new project (requires authentication)
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw Errors.unauthorized('Unauthorized');
    }

    const body = await request.json();
    const parsed = CreateProjectSchema.parse(body);

    const project = await projectService.createProject(
      {
        title: parsed.title,
        description: parsed.description,
        tags: parsed.tags,
        thumbnail: parsed.thumbnail,
        githubUrl: parsed.githubUrl,
        demoUrl: parsed.demoUrl,
        contractAddress: parsed.contractAddress,
      },
      session.user.id
    );

    return NextResponse.json({ project }, { status: 201 });
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
