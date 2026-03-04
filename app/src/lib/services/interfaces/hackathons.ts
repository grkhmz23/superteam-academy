import type { HackathonEvent } from '@prisma/client';

export interface HackathonFilter {
  startDate?: Date;
  endDate?: Date;
  location?: 'virtual' | 'physical';
  tags?: string[];
}

export interface CreateHackathonInput {
  title: string;
  description: string;
  organizer: string;
  logo?: string;
  startDate: Date;
  endDate: Date;
  location: string;
  prizes?: string;
  url: string;
  tags: string[];
}

export interface HackathonService {
  getUpcomingEvents(limit?: number): Promise<HackathonEvent[]>;
  getEvents(filter?: HackathonFilter, page?: number, limit?: number): Promise<HackathonEvent[]>;
  getEventsByMonth(year: number, month: number): Promise<HackathonEvent[]>;
  getEventById(id: string): Promise<HackathonEvent | null>;
  createEvent(data: CreateHackathonInput): Promise<HackathonEvent>;
  updateEvent(id: string, data: Partial<CreateHackathonInput>): Promise<HackathonEvent>;
  deleteEvent(id: string): Promise<void>;
  syncFromDevfolio(): Promise<number>; // returns count of synced events
}

export type { HackathonEvent };
