import { prisma } from '@/lib/db/client';
import type {
  IdeaService,
  CreateIdeaInput,
  ExpressInterestInput,
  IdeaFilter,
} from '@/lib/services/interfaces/index';
import type { StartupIdea, IdeaInterest, Prisma } from '@prisma/client';

export class PrismaIdeaService implements IdeaService {
  async getIdeas(
    filter?: IdeaFilter,
    page = 1,
    limit = 20
  ): Promise<StartupIdea[]> {
    const where: Prisma.StartupIdeaWhereInput = {
      status: 'active',
    };

    if (filter) {
      if (filter.stage) {
        where.stage = filter.stage;
      }

      if (filter.lookingFor?.length) {
        where.lookingFor = {
          hasSome: filter.lookingFor,
        };
      }

      if (filter.ownerId) {
        where.ownerId = filter.ownerId;
      }

      if (filter.query) {
        where.OR = [
          { title: { contains: filter.query, mode: 'insensitive' } },
          { description: { contains: filter.query, mode: 'insensitive' } },
          { problem: { contains: filter.query, mode: 'insensitive' } },
          { solution: { contains: filter.query, mode: 'insensitive' } },
        ];
      }
    }

    return prisma.startupIdea.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            interested: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async getIdeaById(id: string): Promise<StartupIdea | null> {
    return prisma.startupIdea.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
          },
        },
        interested: {
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
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async createIdea(data: CreateIdeaInput, ownerId: string): Promise<StartupIdea> {
    return prisma.startupIdea.create({
      data: {
        ...data,
        ownerId,
        status: 'active',
      },
    });
  }

  async updateIdea(id: string, data: Partial<CreateIdeaInput>): Promise<StartupIdea> {
    return prisma.startupIdea.update({
      where: { id },
      data,
    });
  }

  async deleteIdea(id: string): Promise<void> {
    await prisma.startupIdea.delete({
      where: { id },
    });
  }

  async expressInterest(
    ideaId: string,
    userId: string,
    data: ExpressInterestInput
  ): Promise<IdeaInterest> {
    return prisma.ideaInterest.create({
      data: {
        ideaId,
        userId,
        role: data.role,
        message: data.message,
        status: 'pending',
      },
    });
  }

  async getInterestsForIdea(ideaId: string): Promise<IdeaInterest[]> {
    return prisma.ideaInterest.findMany({
      where: { ideaId },
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyInterests(userId: string): Promise<IdeaInterest[]> {
    return prisma.ideaInterest.findMany({
      where: { userId },
      include: {
        idea: {
          include: {
            owner: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateInterestStatus(
    id: string,
    status: 'pending' | 'accepted' | 'declined'
  ): Promise<IdeaInterest> {
    return prisma.ideaInterest.update({
      where: { id },
      data: { status },
    });
  }

  async closeIdea(id: string): Promise<StartupIdea> {
    return prisma.startupIdea.update({
      where: { id },
      data: { status: 'closed' },
    });
  }
}

export const ideaService = new PrismaIdeaService();
