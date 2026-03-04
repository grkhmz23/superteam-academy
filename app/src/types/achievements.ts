/**
 * Achievement system types
 */

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji or icon name from lucide-react
  category: "progress" | "streaks" | "skills" | "community" | "career" | "events" | "special";
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  // Checker function receives context and returns true if achievement is earned
  condition: AchievementCondition;
}

export type AchievementCondition =
  // Learning progress
  | { type: "lessons_completed"; count: number }
  | { type: "courses_completed"; count: number }
  | { type: "course_completed"; courseSlug: string }
  | { type: "xp_reached"; amount: number }
  | { type: "level_reached"; level: number }
  | { type: "streak_reached"; days: number }
  | { type: "first_lesson" }
  | { type: "first_challenge" }
  | { type: "all_courses_completed" }
  | { type: "perfect_challenge"; courseSlug: string } // completed challenge without hints
  // Job board
  | { type: "job_applied"; count: number }
  | { type: "job_posted"; count: number }
  | { type: "job_accepted" }
  // Project showcase
  | { type: "project_published"; count: number }
  | { type: "feedback_given"; count: number }
  | { type: "project_likes"; count: number }
  | { type: "badge_earned"; badgeType: string }
  // Mentorship
  | { type: "mentor_verified" }
  | { type: "session_completed"; count: number }
  | { type: "mentor_sessions"; count: number; minRating: number }
  // Startup ideas
  | { type: "ideas_posted"; count: number }
  | { type: "cofounder_found" }
  | { type: "team_joined" }
  | { type: "investor_connected" }
  // Hackathons
  | { type: "hackathons_viewed"; count: number }
  | { type: "hackathon_registered" }
  | { type: "hackathon_won" };

export interface AchievementWithStatus extends AchievementDefinition {
  unlocked: boolean;
  unlockedAt: Date | null;
}

export interface AchievementCheckContext {
  userId: string;
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalLessonsCompleted: number;
  totalCoursesCompleted: number;
  completedCourses: string[]; // slugs
  totalChallengesCompleted: number;
  alreadyUnlocked: string[]; // achievement IDs already earned
}
