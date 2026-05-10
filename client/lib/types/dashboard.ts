import type { ApiUser } from './user';
import type { ApiAnnouncement, ApiEvent } from './system';

export interface StreakData {
    currentStreak: number
    longestStreak: number
    lastClaimedAt?: string
    canClaim?: boolean
}

export interface DuesData {
    dues: number
    totalCourseFee: number
    paidAmount: number
    courses: { id: number | string; name: string; fee: number | string }[]
}

export interface DashboardData {
  user: ApiUser;
  stats: {
    totalCourses: number;
    xp: number;
    level: number;
    nextLevelRequiredXp?: number;
    walletBalance: number;
    leaderboardRank: number | null;
    totalAchievements: number;
    streak: number;
  };
  wallet: {
    id?: string;
    balance: number | string;
    pinSet?: boolean;
  };
  attendance: {
    total: number;
    present: number;
    absent: number;
    percentage: number;
    records?: Array<Record<string, unknown>>;
  };
  leaderboard: Array<Record<string, unknown>>;
  announcements: ApiAnnouncement[];
  recentGrades?: {
    assignment: { title: string };
    grade: string | number;
    gradedAt: string;
  }[];
  events: Array<Record<string, unknown>>;
  streak: {
    current: number;
    longest: number;
  };
  feeSummary?: {
    currency: string;
    totalFee: number;
    paidAmount: number;
    remainingAmount: number | null;
    configured: boolean;
  };
}