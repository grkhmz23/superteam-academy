import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/config';
import { mentorshipService } from '@/lib/services/implementations';
import { Errors, handleApiError } from '@/lib/api/errors';
import type { MentorFilter } from '@/lib/services/interfaces/mentorship';

export const dynamic = 'force-dynamic';

const TimeSlotSchema = z.object({
  start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
});

const AvailabilityScheduleSchema = z.record(z.array(TimeSlotSchema));

const CreateMentorSchema = z.object({
  bio: z.string().min(1).max(2000),
  expertise: z.array(z.string().min(1).max(50)).min(1).max(20),
  hourlyRate: z.number().int().min(0).optional(),
  availability: AvailabilityScheduleSchema,
});

/**
 * GET /api/mentors
 * List mentors with filtering and pagination
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Parse pagination params
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));

    // Build filter
    const filter: MentorFilter = {};

    const expertise = searchParams.get('expertise');
    if (expertise) {
      filter.expertise = expertise.split(',').map(e => e.trim()).filter(Boolean);
    }

    const maxRate = searchParams.get('maxRate');
    if (maxRate) {
      const rate = parseInt(maxRate, 10);
      if (!isNaN(rate)) {
        filter.maxHourlyRate = rate;
      }
    }

    const availableNow = searchParams.get('availableNow');
    if (availableNow === 'true') {
      filter.availableNow = true;
    }

    const query = searchParams.get('query');
    if (query) {
      filter.query = query;
    }

    const mentors = await mentorshipService.getMentors(filter, page, limit);

    return NextResponse.json({
      mentors,
      pagination: {
        page,
        limit,
        total: mentors.length,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/mentors
 * Become a mentor (requires authentication)
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw Errors.unauthorized('Unauthorized');
    }

    // Check if user already has a mentor profile
    const existingProfile = await mentorshipService.getMentorByUserId(session.user.id);
    if (existingProfile) {
      throw Errors.conflict('You already have a mentor profile');
    }

    const body = await request.json();
    const parsed = CreateMentorSchema.parse(body);

    const mentor = await mentorshipService.createMentorProfile(session.user.id, {
      bio: parsed.bio,
      expertise: parsed.expertise,
      hourlyRate: parsed.hourlyRate,
      availability: parsed.availability,
    });

    return NextResponse.json({ mentor }, { status: 201 });
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
      return handleApiError(Errors.validation('Invalid mentor data', fieldErrors));
    }
    return handleApiError(error);
  }
}
