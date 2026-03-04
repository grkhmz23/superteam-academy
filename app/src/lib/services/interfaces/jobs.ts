import type { Job, JobApplication } from '@prisma/client';

export interface JobFilter {
  skills?: string[];
  experience?: 'junior' | 'mid' | 'senior';
  location?: 'remote' | 'on-site' | 'hybrid';
  type?: 'full-time' | 'part-time' | 'contract';
  query?: string;
}

export interface CreateJobInput {
  title: string;
  description: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: string;
  salaryRange?: string;
  skills: string[];
  experience: string;
  expiresAt: Date;
}

export interface CreateApplicationInput {
  coverLetter?: string;
}

export interface JobService {
  getJobs(filter?: JobFilter, page?: number, limit?: number): Promise<Job[]>;
  getJobById(id: string): Promise<Job | null>;
  createJob(data: CreateJobInput, postedBy: string): Promise<Job>;
  updateJob(id: string, data: Partial<CreateJobInput>): Promise<Job>;
  deleteJob(id: string): Promise<void>;
  applyToJob(jobId: string, userId: string, data: CreateApplicationInput): Promise<JobApplication>;
  getApplicationsForJob(jobId: string): Promise<JobApplication[]>;
  getMyApplications(userId: string): Promise<JobApplication[]>;
  updateApplicationStatus(id: string, status: 'pending' | 'reviewed' | 'accepted' | 'rejected'): Promise<JobApplication>;
  getSkillMatchScore(jobId: string, userId: string): Promise<number>;
}

// Re-export Prisma types for convenience
export type { Job, JobApplication };
