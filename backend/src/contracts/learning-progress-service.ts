export type LeaderboardTimeframe = "weekly" | "monthly" | "alltime";

export interface CourseProgressRecord {
  userId: string;
  courseId: string;
  completedLessonIds: string[];
  completionPercent: number;
  enrolledAt: string;
  completedAt?: string | null;
}

export interface StreakRecord {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string | null;
  history: string[];
}

export interface LeaderboardEntry {
  walletAddress?: string | null;
  userId?: string | null;
  xp: number;
  level: number;
  rank: number;
  streak?: number;
}

export interface CredentialRecord {
  assetId: string;
  name: string;
  track?: string;
  level?: string;
  metadataUri?: string;
  ownerWallet: string;
}

/**
 * Backend-facing contract for learning progress orchestration.
 * The app implementation may be local/DB-backed today and on-chain-backed later.
 */
export interface LearningProgressServiceContract {
  getProgressForUserCourse(userId: string, courseId: string): Promise<CourseProgressRecord | null>;
  completeLesson(userId: string, courseId: string, lessonId: string): Promise<{
    xpAwarded: number;
    totalXP: number;
    level: number;
    completed: boolean;
  }>;
  getXPBalance(input: { userId?: string; walletAddress?: string }): Promise<number>;
  getStreakData(userId: string): Promise<StreakRecord>;
  getLeaderboardEntries(
    timeframe: LeaderboardTimeframe,
    opts?: { limit?: number; courseId?: string }
  ): Promise<LeaderboardEntry[]>;
  getCredentialsForWallet(walletAddress: string): Promise<CredentialRecord[]>;
}
