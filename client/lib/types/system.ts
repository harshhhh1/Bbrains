export type LogCategory = "AUTH" | "ACADEMIC" | "MARKET" | "FINANCE" | "USER" | "SYSTEM" | "LEVELS";

export interface ApiNotification {
    id: number
    userId: string
    title: string
    message?: string
    type: string
    read: boolean
    readAt?: string
    createdAt: string
    relatedId?: string
    channelId?: string
    entityUrl?: string
}

export interface NotificationUnreadCount {
    count: number
    total: number
    byChannel: Record<string, number>
}

export interface ApiAuditLog {
    id: number
    userId?: string
    category: string
    action: string
    entity: string
    entityId: string
    change?: Record<string, unknown>
    reason?: string
    createdAt: string
    user?: {
        username: string
        avatar?: string | null
    }
}

export interface SystemConfig {
    key: string
    value: string | number | boolean | Record<string, unknown>
    type: string
    description?: string
    updatedAt?: string
}

export interface LevelThreshold {
    levelNumber: number
    requiredXp: number
}

export interface ApiAnnouncement {
    id: number
    userId: string
    title: string
    description?: string
    image?: string
    isGlobal?: boolean
    collegeId?: number | string
    createdAt: string
    user?: {
        username: string;
        type: string;
        userDetails?: {
            firstName: string;
            lastName: string;
            displayName?: string;
            avatar?: string;
        }
    }
}

export interface ApiEvent {
    id: string | number
    title: string
    description?: string
    startDate: string
    endDate: string
    date: string
    location?: string
    type?: string
    banner?: string
}

export interface ApiAssessment {
    id: number
    courseId: number
    subject: string
    topic: string
    assessmentType: "test" | "exam"
    assessmentDate: string
    totalMarks: number | string
    course?: { name: string }
    results: { studentId: string; marksObtained: number | string; remark?: string }[]
}

export interface StudentAssessmentResult {
    id: number
    assessmentId: number
    userId: string
    marksObtained: number | string
    remark?: string
    assessment: {
        id: number
        subject: string
        topic: string
        assessmentType: string
        assessmentDate: string
        totalMarks: number | string
        course?: { name: string }
        createdBy?: {
            username: string
            userDetails?: {
                firstName: string
                lastName?: string
                displayName?: string
            }
        }
    }
}

export interface AssessmentCourseOption {
    id: number
    name: string
    standard?: string
    subjects?: string[]
    availableSubjects?: string[]
    semesters?: Array<{
        id?: number;
        semesterNumber: number;
        subjects: Array<{
            id?: number;
            name: string;
            code: string;
            examTotalMarks: number
        }>;
    }>;
}

export interface AssessmentStudent {
    id: string
    username: string
    userDetails?: {
        firstName: string
        lastName: string
        displayName?: string
    }
}

export interface Suggestion {
    id: number
    userId: string
    title: string
    content: string
    status: "pending" | "reviewed" | "implemented" | "rejected"
    createdAt: string
    user?: {
        username: string
        userDetails?: {
            firstName: string
            lastName: string
            displayName?: string
        }
    }
}

export type LeaderboardCategory = 'weekly' | 'monthly' | 'allTime' | 'course';
export type LeaderboardSort = 'xp' | 'points';

export interface LeaderboardEntry {
  userId: string;
  username: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  totalXp: number;
  totalPoints: number;
  rank: number;
  value: number;
}

export interface LeaderboardState {
  entries: LeaderboardEntry[];
  myPosition: LeaderboardEntry | null;
  category: LeaderboardCategory;
  sortBy: LeaderboardSort;
  loading: boolean;
}

export interface RewardTier {
  rank: 1 | 2 | 3;
  xp: number;
  coins: number;
}

export interface LeaderboardRewardPreview {
  category: 'weekly' | 'monthly';
  rewards: RewardTier[];
  topUsers: LeaderboardEntry[];
  periodEndsAt: string;
}