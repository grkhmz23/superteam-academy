import { prisma } from '@/lib/db/client';
import type {
  JobService,
  CreateJobInput,
  CreateApplicationInput,
  JobFilter,
} from '@/lib/services/interfaces/index';
import type { Job, JobApplication, Prisma } from '@prisma/client';

export class PrismaJobService implements JobService {
  async getJobs(
    filter?: JobFilter,
    page = 1,
    limit = 20
  ): Promise<Job[]> {
    const where: Prisma.JobWhereInput = {
      status: 'active',
    };

    if (filter) {
      if (filter.skills?.length) {
        where.skills = {
          hasSome: filter.skills,
        };
      }

      if (filter.experience) {
        where.experience = filter.experience;
      }

      if (filter.location) {
        where.location = {
          contains: filter.location,
          mode: 'insensitive',
        };
      }

      if (filter.type) {
        where.type = filter.type;
      }

      if (filter.query) {
        where.OR = [
          { title: { contains: filter.query, mode: 'insensitive' } },
          { description: { contains: filter.query, mode: 'insensitive' } },
          { company: { contains: filter.query, mode: 'insensitive' } },
        ];
      }
    }

    return prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async getJobById(id: string): Promise<Job | null> {
    return prisma.job.findUnique({
      where: { id },
    });
  }

  async createJob(data: CreateJobInput, postedBy: string): Promise<Job> {
    return prisma.job.create({
      data: {
        ...data,
        postedBy,
        status: 'active',
      },
    });
  }

  async updateJob(id: string, data: Partial<CreateJobInput>): Promise<Job> {
    return prisma.job.update({
      where: { id },
      data,
    });
  }

  async deleteJob(id: string): Promise<void> {
    await prisma.job.delete({
      where: { id },
    });
  }

  async applyToJob(
    jobId: string,
    userId: string,
    data: CreateApplicationInput
  ): Promise<JobApplication> {
    return prisma.jobApplication.create({
      data: {
        jobId,
        userId,
        coverLetter: data.coverLetter,
        status: 'pending',
      },
    });
  }

  async getApplicationsForJob(jobId: string): Promise<JobApplication[]> {
    return prisma.jobApplication.findMany({
      where: { jobId },
      include: {
        applicant: {
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

  async getMyApplications(userId: string): Promise<JobApplication[]> {
    return prisma.jobApplication.findMany({
      where: { userId },
      include: {
        job: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateApplicationStatus(
    id: string,
    status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  ): Promise<JobApplication> {
    return prisma.jobApplication.update({
      where: { id },
      data: { status },
    });
  }

  async getSkillMatchScore(jobId: string, userId: string): Promise<number> {
    // Get the job's required skills
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { skills: true },
    });

    if (!job || job.skills.length === 0) {
      return 0;
    }

    // Get user's completed courses
    const userCompletions = await prisma.lessonCompletion.findMany({
      where: { userId },
      select: { courseSlug: true },
      distinct: ['courseSlug'],
    });

    // Map course slugs to skills (simple mapping based on course content)
    const courseToSkills: Record<string, string[]> = {
      'solana-fundamentals': ['solana', 'rust', 'blockchain'],
      'anchor-basics': ['anchor', 'rust', 'solana'],
      'rust-programming': ['rust', 'systems'],
      'web3-development': ['web3', 'javascript', 'typescript'],
      'defi-development': ['defi', 'solana', 'rust'],
      'nft-development': ['nft', 'solana', 'metaplex'],
    };

    // Aggregate user's skills from completed courses
    const userSkills = new Set<string>();
    for (const completion of userCompletions) {
      const skills = courseToSkills[completion.courseSlug] || [];
      skills.forEach(skill => userSkills.add(skill.toLowerCase()));
    }

    // Calculate match score
    const jobSkillsLower = job.skills.map(s => s.toLowerCase());
    const matchedSkills = jobSkillsLower.filter(skill => 
      Array.from(userSkills).some(userSkill => 
        userSkill.includes(skill) || skill.includes(userSkill)
      )
    );

    return Math.round((matchedSkills.length / jobSkillsLower.length) * 100);
  }
}

export const jobService = new PrismaJobService();
