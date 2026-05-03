// --- Base Logic & Types ---
export * from "@/services/api/base";

// --- Domain Services ---
import { authApi } from "@/services/api/auth.service";
import { userApi } from "@/services/api/user.service";
import { academicApi } from "@/services/api/academic.service";
import { marketApi } from "@/services/api/market.service";
import { financeApi } from "@/services/api/finance.service";
import { notificationApi } from "@/services/api/notification.service";
import { communicationApi } from "@/services/api/communication.service";
import { chatApi } from "@/services/api/chat.service";
import { gamificationApi } from "@/services/api/gamification.service";
import { dashboardService } from "@/services/api/dashboard.service";
import { systemApi } from "@/services/api/system.service";

// Re-export services for backward compatibility and centralized access
export {
  authApi,
  userApi,
  academicApi,
  marketApi,
  financeApi,
  notificationApi,
  communicationApi,
  chatApi,
  gamificationApi,
  systemApi,
};

// Aliases for common access patterns used throughout the app
export const dashboardApi = {
  getDashboard: dashboardService.getDashboard,
  getAdminOverview: dashboardService.getAdminOverview,
  getManagerOverview: dashboardService.getManagerOverview,
  claimDaily: dashboardService.claimDaily,
  ...communicationApi, 
  ...notificationApi,
  ...gamificationApi,
  ...academicApi,
  getUser: userApi.getMe,
  searchUsers: (query: string) => chatApi.searchUsers(query),
  getStreak: gamificationApi.getStreaks,
  getUpcomingEvents: communicationApi.getEvents,
  getAnnouncements: communicationApi.getAnnouncements,
};

export const announcementApi = communicationApi;
export const eventApi = communicationApi;
export const suggestionApi = communicationApi;
export const assessmentApi = academicApi;
export const examApi = academicApi;
export const assignmentApi = academicApi;
export const courseApi = academicApi;
export const attendanceApi = academicApi;
export const enrollmentApi = academicApi;
export const feeApi = financeApi;
export const transactionApi = financeApi;
export const walletApi = financeApi;

// Specific backward-compatible aliases
export const achievementApi = gamificationApi;
export const leaderboardApi = gamificationApi;
export const streakApi = gamificationApi;
export const xpApi = gamificationApi;
export const configApi = systemApi;
export const libraryApi = marketApi;
export const orderApi = marketApi;
export const reviewApi = marketApi;

export type FeeSummary = {
    currency: string;
    totalFee: number;
    paidAmount: number;
    remainingAmount: number | null;
    configured: boolean;
};

export type ManualTransactionInput = {
    userId: string;
    type: "credit" | "debit";
    amount: number;
    category?: string;
    paymentMode?: string;
    note?: string;
    reason?: string;
};

export type { ApiUser as User } from "@/lib/types/api";
export type { 
    ApiProduct as Product, 
    ApiAchievement as Achievement, 
    ApiTransaction as Transaction,
    ApiAnnouncement as Announcement,
    ApiAssessment as Assessment,
    ApiAssignment as Assignment,
    ApiSubmission as Submission,
    ApiCourse as Course,
    UserAchievement,
    SystemConfig,
    LevelThreshold,
    ApiEvent as Event,
    ChatAttachment,
    ChatMessageRecord,
    ChatMentionUser,
    ChatMemberProfile,
    StreakData,
    LibraryItem,
    CartItem,
    Suggestion,
    DuesData,
    ApiNotification,
    ApiNotification as Notification,
    NotificationUnreadCount,
    WalletData,
    MoneyRequest,
    SubjectChapterProgress,
    StudentAssessmentResult,
    AssessmentCourseOption,
    AssessmentStudent,
    AttendanceData,
    AttendanceRecord,
    ClassTimetableEntry,
    Review,
    ReviewStats,
    SalesData,
    ApiOrder as Order,
    DashboardData,
    LeaderboardEntry,
    ApiExam,
    ApiExamResult,
    StudentExamResult,
    ExamCourseOption
} from "@/lib/types/api";
