import type { MentorProfile, MentorshipSession } from '@prisma/client';

export interface MentorFilter {
  expertise?: string[];
  maxHourlyRate?: number;
  availableNow?: boolean;
  query?: string;
}

export interface CreateMentorInput {
  bio: string;
  expertise: string[];
  hourlyRate?: number;
  availability: AvailabilitySchedule;
}

export interface AvailabilitySchedule {
  [day: string]: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:MM format
  end: string;
}

export interface ScheduleSessionInput {
  scheduledAt: Date;
  duration: number; // minutes
  topic: string;
}

export interface MentorshipService {
  getMentors(filter?: MentorFilter, page?: number, limit?: number): Promise<MentorProfile[]>;
  getMentorById(id: string): Promise<MentorProfile | null>;
  getMentorByUserId(userId: string): Promise<MentorProfile | null>;
  createMentorProfile(userId: string, data: CreateMentorInput): Promise<MentorProfile>;
  updateMentorProfile(id: string, data: Partial<CreateMentorInput>): Promise<MentorProfile>;
  scheduleSession(mentorId: string, menteeId: string, data: ScheduleSessionInput): Promise<MentorshipSession>;
  getSessionById(id: string): Promise<MentorshipSession | null>;
  getSessionsForUser(userId: string, role: 'mentor' | 'mentee'): Promise<MentorshipSession[]>;
  completeSession(id: string, notes?: string): Promise<MentorshipSession>;
  cancelSession(id: string, reason?: string): Promise<MentorshipSession>;
  rateSession(id: string, rating: number, feedback?: string): Promise<MentorshipSession>;
  getAvailableSlots(mentorId: string, date: Date): Promise<TimeSlot[]>;
}

export type { MentorProfile, MentorshipSession };
