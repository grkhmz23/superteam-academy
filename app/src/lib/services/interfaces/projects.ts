import type { Project, ProjectFeedback, ProjectBadge } from '@prisma/client';

export interface ProjectFilter {
  tags?: string[];
  ownerId?: string;
  featured?: boolean;
  query?: string;
}

export interface CreateProjectInput {
  title: string;
  description: string;
  tags: string[];
  thumbnail?: string;
  githubUrl?: string;
  demoUrl?: string;
  contractAddress?: string;
}

export interface CreateFeedbackInput {
  content: string;
  rating: number;
}

export interface ProjectService {
  getProjects(filter?: ProjectFilter, page?: number, limit?: number): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | null>;
  createProject(data: CreateProjectInput, ownerId: string): Promise<Project>;
  updateProject(id: string, data: Partial<CreateProjectInput>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  addFeedback(projectId: string, userId: string, data: CreateFeedbackInput): Promise<ProjectFeedback>;
  getFeedbackForProject(projectId: string): Promise<ProjectFeedback[]>;
  awardBadge(projectId: string, badgeType: 'featured' | 'community_choice' | 'code_quality' | 'innovation'): Promise<ProjectBadge>;
  incrementViews(id: string): Promise<void>;
  toggleLike(id: string, userId: string): Promise<boolean>;
}

export type { Project, ProjectFeedback, ProjectBadge };
