import type { AchievementDefinition } from "@/types/achievements";

/**
 * All achievement definitions for the platform
 * Easy to add new achievements without code changes
 */
export const achievements: AchievementDefinition[] = [
  // PROGRESS (common → rare)
  {
    id: "first-steps",
    name: "First Steps",
    description: "Complete your first lesson",
    icon: "👣",
    category: "progress",
    rarity: "common",
    condition: { type: "first_lesson" },
  },
  {
    id: "getting-started",
    name: "Getting Started",
    description: "Complete 5 lessons",
    icon: "📚",
    category: "progress",
    rarity: "common",
    condition: { type: "lessons_completed", count: 5 },
  },
  {
    id: "dedicated-learner",
    name: "Dedicated Learner",
    description: "Complete 15 lessons",
    icon: "🎓",
    category: "progress",
    rarity: "uncommon",
    condition: { type: "lessons_completed", count: 15 },
  },
  {
    id: "course-completer",
    name: "Course Completer",
    description: "Complete your first course",
    icon: "🏆",
    category: "progress",
    rarity: "uncommon",
    condition: { type: "courses_completed", count: 1 },
  },
  {
    id: "scholar",
    name: "Scholar",
    description: "Complete all available courses",
    icon: "🎯",
    category: "progress",
    rarity: "legendary",
    condition: { type: "all_courses_completed" },
  },

  // STREAKS
  {
    id: "week-warrior",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "🔥",
    category: "streaks",
    rarity: "uncommon",
    condition: { type: "streak_reached", days: 7 },
  },
  {
    id: "monthly-master",
    name: "Monthly Master",
    description: "Maintain a 30-day streak",
    icon: "💪",
    category: "streaks",
    rarity: "rare",
    condition: { type: "streak_reached", days: 30 },
  },
  {
    id: "consistency-king",
    name: "Consistency King",
    description: "Maintain a 100-day streak",
    icon: "👑",
    category: "streaks",
    rarity: "legendary",
    condition: { type: "streak_reached", days: 100 },
  },

  // SKILLS (course-specific)
  {
    id: "solana-basics",
    name: "Solana Basics",
    description: "Complete Solana Fundamentals",
    icon: "⚡",
    category: "skills",
    rarity: "uncommon",
    condition: { type: "course_completed", courseSlug: "solana-fundamentals" },
  },
  {
    id: "anchor-expert",
    name: "Anchor Expert",
    description: "Complete Anchor Development",
    icon: "⚓",
    category: "skills",
    rarity: "rare",
    condition: { type: "course_completed", courseSlug: "anchor-development" },
  },
  {
    id: "frontend-builder",
    name: "Frontend Builder",
    description: "Complete Solana Frontend Development",
    icon: "🖥️",
    category: "skills",
    rarity: "rare",
    condition: { type: "course_completed", courseSlug: "solana-frontend" },
  },
  {
    id: "defi-degen",
    name: "DeFi Degen",
    description: "Complete DeFi on Solana",
    icon: "💰",
    category: "skills",
    rarity: "epic",
    condition: { type: "course_completed", courseSlug: "defi-solana" },
  },
  {
    id: "full-stack-solana",
    name: "Full Stack Solana",
    description: "Complete all 4 courses",
    icon: "🌟",
    category: "skills",
    rarity: "legendary",
    condition: { type: "all_courses_completed" },
  },

  // XP & LEVEL milestones
  {
    id: "xp-100",
    name: "Century",
    description: "Earn 100 XP",
    icon: "💯",
    category: "progress",
    rarity: "common",
    condition: { type: "xp_reached", amount: 100 },
  },
  {
    id: "xp-1000",
    name: "Thousandaire",
    description: "Earn 1,000 XP",
    icon: "🏅",
    category: "progress",
    rarity: "uncommon",
    condition: { type: "xp_reached", amount: 1000 },
  },
  {
    id: "xp-5000",
    name: "XP Master",
    description: "Earn 5,000 XP",
    icon: "💎",
    category: "progress",
    rarity: "epic",
    condition: { type: "xp_reached", amount: 5000 },
  },
  {
    id: "level-5",
    name: "Rising Star",
    description: "Reach Level 5",
    icon: "⭐",
    category: "progress",
    rarity: "uncommon",
    condition: { type: "level_reached", level: 5 },
  },
  {
    id: "level-10",
    name: "Veteran",
    description: "Reach Level 10",
    icon: "🌟",
    category: "progress",
    rarity: "epic",
    condition: { type: "level_reached", level: 10 },
  },

  // JOB BOARD
  {
    id: "job-seeker",
    name: "Job Seeker",
    description: "Apply to your first job",
    icon: "💼",
    category: "career",
    rarity: "common",
    condition: { type: "job_applied", count: 1 },
  },
  {
    id: "employer",
    name: "Employer",
    description: "Post your first job listing",
    icon: "📢",
    category: "career",
    rarity: "common",
    condition: { type: "job_posted", count: 1 },
  },
  {
    id: "perfect-match",
    name: "Perfect Match",
    description: "Get hired through the platform",
    icon: "🤝",
    category: "career",
    rarity: "epic",
    condition: { type: "job_accepted" },
  },

  // PROJECT SHOWCASE
  {
    id: "showcase-star",
    name: "Showcase Star",
    description: "Publish your first project",
    icon: "🌟",
    category: "community",
    rarity: "common",
    condition: { type: "project_published", count: 1 },
  },
  {
    id: "feedback-champion",
    name: "Feedback Champion",
    description: "Leave feedback on 10 projects",
    icon: "💬",
    category: "community",
    rarity: "uncommon",
    condition: { type: "feedback_given", count: 10 },
  },
  {
    id: "trending-project",
    name: "Trending Project",
    description: "Get 50 likes on a project",
    icon: "🔥",
    category: "community",
    rarity: "rare",
    condition: { type: "project_likes", count: 50 },
  },
  {
    id: "code-quality",
    name: "Code Quality",
    description: "Earn the Code Quality badge on a project",
    icon: "✨",
    category: "community",
    rarity: "rare",
    condition: { type: "badge_earned", badgeType: "code_quality" },
  },

  // MENTORSHIP
  {
    id: "mentor",
    name: "Mentor",
    description: "Become a verified mentor",
    icon: "👨‍🏫",
    category: "community",
    rarity: "rare",
    condition: { type: "mentor_verified" },
  },
  {
    id: "mentee",
    name: "Mentee",
    description: "Complete your first mentorship session",
    icon: "🎓",
    category: "community",
    rarity: "common",
    condition: { type: "session_completed", count: 1 },
  },
  {
    id: "top-mentor",
    name: "Top Mentor",
    description: "Complete 10 mentorship sessions with 4.5+ rating",
    icon: "🏆",
    category: "community",
    rarity: "epic",
    condition: { type: "mentor_sessions", count: 10, minRating: 4.5 },
  },
  {
    id: "eager-learner",
    name: "Eager Learner",
    description: "Complete 5 mentorship sessions",
    icon: "📖",
    category: "community",
    rarity: "uncommon",
    condition: { type: "session_completed", count: 5 },
  },

  // STARTUP IDEAS / TEAM MATCHING
  {
    id: "idea-machine",
    name: "Idea Machine",
    description: "Post 3 startup ideas",
    icon: "💡",
    category: "community",
    rarity: "uncommon",
    condition: { type: "ideas_posted", count: 3 },
  },
  {
    id: "team-builder",
    name: "Team Builder",
    description: "Find a co-founder through the platform",
    icon: "🚀",
    category: "community",
    rarity: "epic",
    condition: { type: "cofounder_found" },
  },
  {
    id: "collaborator",
    name: "Collaborator",
    description: "Join a startup team through the platform",
    icon: "🤝",
    category: "community",
    rarity: "rare",
    condition: { type: "team_joined" },
  },
  {
    id: "investor-ready",
    name: "Investor Ready",
    description: "Connect with an investor through your idea post",
    icon: "💰",
    category: "community",
    rarity: "rare",
    condition: { type: "investor_connected" },
  },

  // HACKATHON EVENTS
  {
    id: "hackathon-hero",
    name: "Hackathon Hero",
    description: "View 3 hackathon events",
    icon: "⏱️",
    category: "events",
    rarity: "common",
    condition: { type: "hackathons_viewed", count: 3 },
  },
  {
    id: "hackathon-participant",
    name: "Hackathon Participant",
    description: "Register for a hackathon through the platform",
    icon: "🎯",
    category: "events",
    rarity: "uncommon",
    condition: { type: "hackathon_registered" },
  },
  {
    id: "hackathon-winner",
    name: "Hackathon Winner",
    description: "Win a prize at a featured hackathon",
    icon: "🏅",
    category: "events",
    rarity: "legendary",
    condition: { type: "hackathon_won" },
  },
];

/**
 * Get achievement by ID
 */
export function getAchievementById(id: string): AchievementDefinition | undefined {
  return achievements.find((a) => a.id === id);
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(
  category: AchievementDefinition["category"]
): AchievementDefinition[] {
  return achievements.filter((a) => a.category === category);
}

/**
 * Rarity order for sorting
 */
const rarityOrder: Record<AchievementDefinition["rarity"], number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};

/**
 * Sort achievements by rarity (common → legendary)
 */
export function sortAchievementsByRarity(
  achievementList: AchievementDefinition[]
): AchievementDefinition[] {
  return [...achievementList].sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
}
