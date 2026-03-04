import type { StartupIdea, IdeaInterest } from '@prisma/client';

export interface IdeaFilter {
  stage?: 'idea' | 'mvp' | 'launched';
  lookingFor?: string[];
  ownerId?: string;
  query?: string;
}

export interface CreateIdeaInput {
  title: string;
  description: string;
  problem: string;
  solution: string;
  marketSize?: string;
  traction?: string;
  lookingFor: string[];
  stage: 'idea' | 'mvp' | 'launched';
}

export interface ExpressInterestInput {
  role: 'developer' | 'investor' | 'advisor' | 'designer' | 'marketer';
  message: string;
}

export interface IdeaService {
  getIdeas(filter?: IdeaFilter, page?: number, limit?: number): Promise<StartupIdea[]>;
  getIdeaById(id: string): Promise<StartupIdea | null>;
  createIdea(data: CreateIdeaInput, ownerId: string): Promise<StartupIdea>;
  updateIdea(id: string, data: Partial<CreateIdeaInput>): Promise<StartupIdea>;
  deleteIdea(id: string): Promise<void>;
  expressInterest(ideaId: string, userId: string, data: ExpressInterestInput): Promise<IdeaInterest>;
  getInterestsForIdea(ideaId: string): Promise<IdeaInterest[]>;
  getMyInterests(userId: string): Promise<IdeaInterest[]>;
  updateInterestStatus(id: string, status: 'pending' | 'accepted' | 'declined'): Promise<IdeaInterest>;
  closeIdea(id: string): Promise<StartupIdea>;
}

export type { StartupIdea, IdeaInterest };
