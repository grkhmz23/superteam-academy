import { prisma } from '@/lib/db/client';
import type {
  HackathonService,
  CreateHackathonInput,
  HackathonFilter,
} from '@/lib/services/interfaces/index';
import type { HackathonEvent, Prisma } from '@prisma/client';

// Mock Devfolio API response for development
const mockDevfolioEvents = [
  {
    title: 'Solana AI Hackathon',
    description: 'Build AI-powered applications on Solana blockchain',
    organizer: 'Devfolio',
    logo: 'https://example.com/solana-ai.png',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    location: 'Virtual',
    prizes: '$50,000 in prizes',
    url: 'https://solana-ai.devfolio.co',
    tags: ['solana', 'ai', 'blockchain'],
  },
  {
    title: 'DeFi Summer Hackathon',
    description: 'Create the next generation of DeFi protocols',
    organizer: 'Devfolio',
    logo: 'https://example.com/defi-summer.png',
    startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    location: 'Hybrid - Bangalore + Virtual',
    prizes: '$100,000 in prizes',
    url: 'https://defi-summer.devfolio.co',
    tags: ['defi', 'ethereum', 'solana'],
  },
  {
    title: 'Web3 Gaming Hackathon',
    description: 'Build the future of gaming on blockchain',
    organizer: 'Devfolio',
    logo: 'https://example.com/web3-gaming.png',
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    location: 'Virtual',
    prizes: '$75,000 in prizes',
    url: 'https://web3-gaming.devfolio.co',
    tags: ['gaming', 'nft', 'unity'],
  },
];

export class PrismaHackathonService implements HackathonService {
  async getUpcomingEvents(limit = 10): Promise<HackathonEvent[]> {
    const now = new Date();

    return prisma.hackathonEvent.findMany({
      where: {
        endDate: {
          gte: now,
        },
      },
      orderBy: { startDate: 'asc' },
      take: limit,
    });
  }

  async getEvents(
    filter?: HackathonFilter,
    page = 1,
    limit = 20
  ): Promise<HackathonEvent[]> {
    const where: Prisma.HackathonEventWhereInput = {};

    if (filter) {
      if (filter.startDate) {
        where.startDate = {
          gte: filter.startDate,
        };
      }

      if (filter.endDate) {
        where.endDate = {
          lte: filter.endDate,
        };
      }

      if (filter.location === 'virtual') {
        where.location = {
          contains: 'Virtual',
        };
      } else if (filter.location === 'physical') {
        where.NOT = {
          location: {
            contains: 'Virtual',
          },
        };
      }

      if (filter.tags?.length) {
        where.tags = {
          hasSome: filter.tags,
        };
      }
    }

    return prisma.hackathonEvent.findMany({
      where,
      orderBy: { startDate: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async getEventsByMonth(year: number, month: number): Promise<HackathonEvent[]> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    return prisma.hackathonEvent.findMany({
      where: {
        OR: [
          {
            // Events that start in this month
            startDate: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          {
            // Events that span into this month
            startDate: {
              lt: startOfMonth,
            },
            endDate: {
              gte: startOfMonth,
            },
          },
        ],
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async getEventById(id: string): Promise<HackathonEvent | null> {
    return prisma.hackathonEvent.findUnique({
      where: { id },
    });
  }

  async createEvent(data: CreateHackathonInput): Promise<HackathonEvent> {
    return prisma.hackathonEvent.create({
      data: {
        ...data,
        source: 'manual',
      },
    });
  }

  async updateEvent(id: string, data: Partial<CreateHackathonInput>): Promise<HackathonEvent> {
    return prisma.hackathonEvent.update({
      where: { id },
      data,
    });
  }

  async deleteEvent(id: string): Promise<void> {
    await prisma.hackathonEvent.delete({
      where: { id },
    });
  }

  async syncFromDevfolio(): Promise<number> {
    // Mock API call - in production, this would fetch from Devfolio API
    const mockApiResponse = await this.mockDevfolioApiCall();

    let syncedCount = 0;

    for (const event of mockApiResponse) {
      // Check if event already exists (by URL)
      const existing = await prisma.hackathonEvent.findFirst({
        where: { url: event.url },
      });

      if (!existing) {
        await prisma.hackathonEvent.create({
          data: {
            ...event,
            source: 'devfolio',
          },
        });
        syncedCount++;
      }
    }

    return syncedCount;
  }

  private async mockDevfolioApiCall(): Promise<typeof mockDevfolioEvents> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return mock data (in production, this would be a fetch call to Devfolio API)
    return mockDevfolioEvents.map(event => ({
      ...event,
      // Randomize dates slightly to simulate new events on each sync
      startDate: new Date(event.startDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(event.endDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
    }));
  }
}

export const hackathonService = new PrismaHackathonService();
