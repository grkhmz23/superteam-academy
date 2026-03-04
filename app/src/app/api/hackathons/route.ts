import { NextResponse } from 'next/server';
import { hackathonService } from '@/lib/services/implementations';
import { handleApiError } from '@/lib/api/errors';
import type { HackathonFilter } from '@/lib/services/interfaces/hackathons';

export const dynamic = 'force-dynamic';

/**
 * GET /api/hackathons
 * List upcoming hackathon events with filtering and pagination
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Parse pagination params
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));

    // Check if we should only show upcoming events (default: true)
    const upcomingOnly = searchParams.get('upcoming') !== 'false';

    let events;
    if (upcomingOnly) {
      events = await hackathonService.getUpcomingEvents(limit);
    } else {
      // Build filter for all events
      const filter: HackathonFilter = {};

      const location = searchParams.get('location');
      if (location && ['virtual', 'physical'].includes(location)) {
        filter.location = location as HackathonFilter['location'];
      }

      const tags = searchParams.get('tags');
      if (tags) {
        filter.tags = tags.split(',').map(t => t.trim()).filter(Boolean);
      }

      const startDate = searchParams.get('startDate');
      if (startDate) {
        filter.startDate = new Date(startDate);
      }

      const endDate = searchParams.get('endDate');
      if (endDate) {
        filter.endDate = new Date(endDate);
      }

      events = await hackathonService.getEvents(filter, page, limit);
    }

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total: events.length,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
