import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { ideaService } from '@/lib/services/implementations';
import { Errors, handleApiError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ideas/interests
 * Get my interests (as interested party)
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw Errors.unauthorized('Unauthorized');
    }

    const userId = session.user.id;

    const interests = await ideaService.getMyInterests(userId);

    // Parse pagination params for the response
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20', 10)));

    // Calculate pagination
    const total = interests.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedInterests = interests.slice(startIndex, endIndex);

    return NextResponse.json({
      interests: paginatedInterests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
