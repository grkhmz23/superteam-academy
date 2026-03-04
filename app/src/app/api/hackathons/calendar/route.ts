import { NextResponse } from 'next/server';
import { hackathonService } from '@/lib/services/implementations';
import { Errors, handleApiError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';

/**
 * GET /api/hackathons/calendar
 * Get hackathon events by month/year for calendar view
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Get year and month from query params, default to current month
    const now = new Date();
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');

    const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
    const month = monthParam ? parseInt(monthParam, 10) : now.getMonth() + 1;

    // Validate year and month
    if (isNaN(year) || year < 2000 || year > 2100) {
      throw Errors.validation('Invalid year', { year: ['Year must be between 2000 and 2100'] });
    }

    if (isNaN(month) || month < 1 || month > 12) {
      throw Errors.validation('Invalid month', { month: ['Month must be between 1 and 12'] });
    }

    const events = await hackathonService.getEventsByMonth(year, month);

    return NextResponse.json({
      events,
      year,
      month,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
