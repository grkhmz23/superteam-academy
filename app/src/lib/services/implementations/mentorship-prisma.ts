import { prisma } from '@/lib/db/client';
import type {
  MentorshipService,
  CreateMentorInput,
  ScheduleSessionInput,
  MentorFilter,
  AvailabilitySchedule,
  TimeSlot,
} from '@/lib/services/interfaces/index';
import type { MentorProfile, MentorshipSession, Prisma } from '@prisma/client';

export class PrismaMentorshipService implements MentorshipService {
  async getMentors(
    filter?: MentorFilter,
    page = 1,
    limit = 20
  ): Promise<MentorProfile[]> {
    const where: Prisma.MentorProfileWhereInput = {};

    if (filter) {
      if (filter.expertise?.length) {
        where.expertise = {
          hasSome: filter.expertise,
        };
      }

      if (filter.maxHourlyRate !== undefined) {
        where.hourlyRate = {
          lte: filter.maxHourlyRate,
        };
      }

      if (filter.availableNow) {
        // For now, verified mentors are considered available
        where.isVerified = true;
      }

      if (filter.query) {
        where.OR = [
          { bio: { contains: filter.query, mode: 'insensitive' } },
          {
            user: {
              displayName: { contains: filter.query, mode: 'insensitive' },
            },
          },
          {
            user: {
              username: { contains: filter.query, mode: 'insensitive' },
            },
          },
        ];
      }
    }

    return prisma.mentorProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { totalSessions: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async getMentorById(id: string): Promise<MentorProfile | null> {
    return prisma.mentorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });
  }

  async getMentorByUserId(userId: string): Promise<MentorProfile | null> {
    return prisma.mentorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });
  }

  async createMentorProfile(
    userId: string,
    data: CreateMentorInput
  ): Promise<MentorProfile> {
    return prisma.mentorProfile.create({
      data: {
        userId,
        bio: data.bio,
        expertise: data.expertise,
        hourlyRate: data.hourlyRate,
        availability: data.availability as unknown as Prisma.InputJsonValue,
        isVerified: false,
        totalSessions: 0,
        rating: 0,
      },
    });
  }

  async updateMentorProfile(
    id: string,
    data: Partial<CreateMentorInput>
  ): Promise<MentorProfile> {
    const updateData: Prisma.MentorProfileUpdateInput = {};

    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.expertise !== undefined) updateData.expertise = data.expertise;
    if (data.hourlyRate !== undefined) updateData.hourlyRate = data.hourlyRate;
    if (data.availability !== undefined) {
      updateData.availability = data.availability as unknown as Prisma.InputJsonValue;
    }

    return prisma.mentorProfile.update({
      where: { id },
      data: updateData,
    });
  }

  async scheduleSession(
    mentorId: string,
    menteeId: string,
    data: ScheduleSessionInput
  ): Promise<MentorshipSession> {
    // Check if the slot is available
    const isAvailable = await this.isSlotAvailable(mentorId, data.scheduledAt, data.duration);
    if (!isAvailable) {
      throw new Error('Selected time slot is not available');
    }

    return prisma.mentorshipSession.create({
      data: {
        mentorId,
        menteeId,
        scheduledAt: data.scheduledAt,
        duration: data.duration,
        topic: data.topic,
        status: 'scheduled',
      },
    });
  }

  async getSessionById(id: string): Promise<MentorshipSession | null> {
    return prisma.mentorshipSession.findUnique({
      where: { id },
      include: {
        mentor: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
        mentee: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async getSessionsForUser(
    userId: string,
    role: 'mentor' | 'mentee'
  ): Promise<MentorshipSession[]> {
    const where: Prisma.MentorshipSessionWhereInput =
      role === 'mentor' ? { mentor: { userId } } : { menteeId: userId };

    return prisma.mentorshipSession.findMany({
      where,
      include: {
        mentor: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
        mentee: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async completeSession(id: string, notes?: string): Promise<MentorshipSession> {
    const session = await prisma.mentorshipSession.update({
      where: { id },
      data: {
        status: 'completed',
        notes: notes || undefined,
      },
    });

    // Update mentor stats
    await prisma.mentorProfile.update({
      where: { id: session.mentorId },
      data: {
        totalSessions: {
          increment: 1,
        },
      },
    });

    return session;
  }

  async cancelSession(id: string, reason?: string): Promise<MentorshipSession> {
    return prisma.mentorshipSession.update({
      where: { id },
      data: {
        status: 'cancelled',
        notes: reason || undefined,
      },
    });
  }

  async rateSession(
    id: string,
    rating: number,
    feedback?: string
  ): Promise<MentorshipSession> {
    const session = await prisma.mentorshipSession.update({
      where: { id },
      data: {
        rating,
        feedback,
      },
    });

    // Recalculate mentor's average rating
    const sessions = await prisma.mentorshipSession.findMany({
      where: {
        mentorId: session.mentorId,
        rating: { not: null },
      },
      select: { rating: true },
    });

    const ratings = sessions.map(s => s.rating).filter((r): r is number => r !== null);
    const avgRating = ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

    await prisma.mentorProfile.update({
      where: { id: session.mentorId },
      data: { rating: avgRating },
    });

    return session;
  }

  async getAvailableSlots(mentorId: string, date: Date): Promise<TimeSlot[]> {
    const mentor = await prisma.mentorProfile.findUnique({
      where: { id: mentorId },
      select: { availability: true },
    });

    if (!mentor || !mentor.availability) {
      return [];
    }

    const availability = mentor.availability as unknown as AvailabilitySchedule;
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    return availability[dayOfWeek] || [];
  }

  private async isSlotAvailable(
    mentorId: string,
    scheduledAt: Date,
    duration: number
  ): Promise<boolean> {
    // Get mentor's availability
    const mentor = await prisma.mentorProfile.findUnique({
      where: { id: mentorId },
      select: { availability: true },
    });

    if (!mentor || !mentor.availability) {
      return false;
    }

    const availability = mentor.availability as unknown as AvailabilitySchedule;
    const dayOfWeek = scheduledAt.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const slots = availability[dayOfWeek] || [];

    // Convert scheduled time to HH:MM format
    const hours = scheduledAt.getHours().toString().padStart(2, '0');
    const minutes = scheduledAt.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    // Check if time falls within any available slot
    const isInAvailability = slots.some((slot: TimeSlot) => timeStr >= slot.start && timeStr <= slot.end);
    if (!isInAvailability) {
      return false;
    }

    // Check for conflicting sessions
    const conflictingSessions = await prisma.mentorshipSession.findMany({
      where: {
        mentorId,
        status: { in: ['scheduled', 'in_progress'] },
        scheduledAt: {
          gte: new Date(scheduledAt.getTime() - duration * 60000),
          lte: new Date(scheduledAt.getTime() + duration * 60000),
        },
      },
    });

    return conflictingSessions.length === 0;
  }
}

export const mentorshipService = new PrismaMentorshipService();
