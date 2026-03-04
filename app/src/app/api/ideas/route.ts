import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/config';
import { ideaService } from '@/lib/services/implementations';
import { Errors, handleApiError } from '@/lib/api/errors';
import type { IdeaFilter } from '@/lib/services/interfaces/ideas';

export const dynamic = 'force-dynamic';

const CreateIdeaSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(10000),
  problem: z.string().min(1).max(5000),
  solution: z.string().min(1).max(5000),
  marketSize: z.string().max(1000).optional(),
  traction: z.string().max(2000).optional(),
  lookingFor: z.array(z.enum(['developer', 'investor', 'advisor', 'designer', 'marketer'])).min(1),
  stage: z.enum(['idea', 'mvp', 'launched']),
});

/**
 * GET /api/ideas
 * List ideas with filtering and pagination
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Parse pagination params
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));

    // Build filter
    const filter: IdeaFilter = {};

    const stage = searchParams.get('stage');
    if (stage && ['idea', 'mvp', 'launched'].includes(stage)) {
      filter.stage = stage as IdeaFilter['stage'];
    }

    const lookingFor = searchParams.get('lookingFor');
    if (lookingFor) {
      filter.lookingFor = lookingFor.split(',').map(l => l.trim()).filter(Boolean);
    }

    const query = searchParams.get('query');
    if (query) {
      filter.query = query;
    }

    const ideas = await ideaService.getIdeas(filter, page, limit);

    return NextResponse.json({
      ideas,
      pagination: {
        page,
        limit,
        total: ideas.length,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/ideas
 * Create a new idea (requires authentication)
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw Errors.unauthorized('Unauthorized');
    }

    const body = await request.json();
    const parsed = CreateIdeaSchema.parse(body);

    const idea = await ideaService.createIdea(
      {
        title: parsed.title,
        description: parsed.description,
        problem: parsed.problem,
        solution: parsed.solution,
        marketSize: parsed.marketSize,
        traction: parsed.traction,
        lookingFor: parsed.lookingFor,
        stage: parsed.stage,
      },
      session.user.id
    );

    return NextResponse.json({ idea }, { status: 201 });
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
