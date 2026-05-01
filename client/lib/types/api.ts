// Shared API Types

export type LogCategory = "AUTH" | "ACADEMIC" | "MARKET" | "FINANCE" | "USER" | "SYSTEM" | "LEVELS";

export interface ApiUser {
    id: string
    username: string
    email: string
    type: "student" | "teacher" | "admin" | "staff" | "superadmin" | "manager"
    roles?: {
        role?: ApiRole
    }[]
    userDetails?: {
        firstName: string
        lastName: string
        avatar?: string
        sex?: string
        dob?: string
        phone?: string
        bio?: string
        teacherSubjects?: string[]
    }
    wallet?: { id: string; balance: number }
    xp?: { xp: number; level: number }
    userAchievements?: {
        achievement: ApiAchievement
        unlockedAt: string
    }[]
    enrollments?: { courseId: number; course: { name: string; id: number; standard?: string } }[]
    classTeacherCourse?: { id: number; name: string; standard?: string } | null
    college?: { id: number; name: string }
}

export interface ApiAssignment {
    id: number
    courseId: number
    createdById?: string | null
    title: string
    description?: string
    content?: string
    file?: string
    rewardPoints?: number
    dueDate: string
    createdAt: string
    type?: "assignment" | "test"
    semesterNumber?: number
    subjectCode?: string
    course?: { id?: number; name: string; standard?: string }
    createdBy?: {
        id: string
        username: string
        userDetails?: {
            firstName?: string
            lastName?: string
        }
    } | null
    submission?: ApiSubmission
    status?: string
    _count?: { submissions: number }
}

export interface ApiExam {
    id: number
    courseId: number
    semesterNumber: number
    subjectName: string
    subjectCode: string
    topic: string
    examDate: string
    totalMarks: number | string
    course?: { id: number; name: string; standard?: string }
    createdBy?: { username: string; userDetails?: any }
    results?: ApiExamResult[]
}

export interface ApiExamResult {
    id: number
    examId: number
    studentId: string
    marksObtained: number | string
    remark?: string
    exam?: ApiExam
    student?: {
        id: string
        username: string
        userDetails?: {
            firstName: string
            lastName: string
        }
    }
}

export interface StudentExamResult {
    id: number
    examId: number
    userId: string
    marksObtained: number | string
    remark?: string
    exam: {
        id: number
        subjectName: string
        subjectCode: string
        topic: string
        examDate: string
        totalMarks: number | string
        semesterNumber: number
        course?: { name: string }
    }
}

export interface ExamCourseOption {
    id: number
    name: string
    standard?: string
    semesters?: Array<{
        semesterNumber: number
        subjects: Array<{
            name: string
            code: string
            examTotalMarks: number
        }>
    }>
    semesterCount?: number
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
            avatar?: string;
        }
    }
}

export interface ApiProduct {
    id: number
    name: string
    description?: string
    price: number | string
    stock: number
    image?: string
    images?: string[]
    approval: "pending" | "approved" | "rejected" | "draft"
    createdAt: string
    creator?: { 
        username: string; 
        type: string;
        userDetails?: {
            firstName: string;
            lastName: string;
            avatar?: string;
        }
    }
    rating?: number
    reviewCount?: number
    unitsSold?: number
    totalRevenue?: number | string
    productType?: "digital" | "physical"
    metadata?: {
        productType?: "digital" | "physical"
        rejectionReason?: string
        fileType?: string
        fileUrl?: string
        images?: string[]
        previewImages?: string[]
        [key: string]: unknown
    }
}

export interface ApiRole {
    id: number
    name: string
    description?: string
}

export interface ApiAchievement {
    id: number
    name: string
    description?: string
    icon?: string
    requiredXp: number | string
    category?: string
    rewardXP?: number
    rewardCoins?: number
}

export interface UserAchievement {
    id: number
    userId: string
    achievementId: number
    unlockedAt: string
    achievement: ApiAchievement
}

export interface ChatAttachment {
    id?: string
    name?: string
    url: string
    type: string
}

export interface ChatMessageRecord {
    id: string
    userId: string
    username: string
    displayName?: string
    avatar?: string
    content: string
    createdAt: string
    editedAt?: string | null
    updatedAt?: string | null
    badge?: string
    badgeColor?: string
    replyToMessageId?: string | null
    replyTo?: any
    mentions?: string[]
    mentionedUserIds?: string[]
    attachments?: ChatAttachment[]
}

export interface ChatMentionUser {
    id: string
    username: string
    displayName: string
    avatar?: string
    avatarUrl?: string
}

export interface ChatMemberProfile {
    id: string
    userId: string
    username: string
    displayName?: string
    avatar?: string
    pronouns?: string
    grade?: string
    roles?: string[]
    type?: string
    badge?: string
    badgeColor?: string
}

export interface StreakData {
    currentStreak: number
    longestStreak: number
    lastClaimedAt?: string
    canClaim?: boolean
}

export interface LibraryItem {
    id: string | number
    productId: number
    name: string
    image?: string | null
    creator?: string
    purchasedAt: string
    category: string
    fileUrl?: string | null
}

export interface CartItem {
    id: number
    userId: string
    productId: number
    quantity: number
    createdAt: string
    product?: ApiProduct
}

export interface Review {
    id: number
    userId: string
    productId: number
    rating: number
    comment: string
    createdAt: string
    user?: {
        username: string
        userDetails?: {
            firstName: string
            lastName?: string
        }
    }
}

export interface ReviewStats {
    averageRating: number
    totalReviews: number
    ratingCounts: Record<number, number>
}

export interface SalesData {
    totalEarnings: number
    digitalSales: { units: number; revenue: number }
    physicalSales: { units: number; revenue: number }
    productBreakdown: {
        productId: number
        name: string
        productType: string
        unitsSold: number
        revenue: number
        avgRating: number
    }[]
    recentTransactions: {
        product: string
        buyer: string
        amount: number
        date: string
    }[]
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
        }
    }
}

export interface DuesData {
    dues: number
    totalCourseFee: number
    paidAmount: number
    courses: { id: number | string; name: string; fee: number | string }[]
}

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

export interface WalletData {
    id: string
    balance: number | string
    pinSet?: boolean
    user?: {
        username: string
        avatarUrl?: string
    }
}

export interface MoneyRequest {
    id: string
    fromUserId: string
    toUserId: string
    amount: number
    reason: string
    status: string
    createdAt: string
    fromUser?: {
        username: string
        displayName?: string
        avatarUrl?: string
    }
}

export interface ApiOrderItem {
    id: number
    productId: number
    quantity: number
    price: number | string
    product?: ApiProduct
}

export interface ApiOrder {
    id: number | string
    userId: string
    totalAmount: number | string
    status: string
    orderDate: string
    orderType?: string
    qrCode?: string | null
    items: ApiOrderItem[]
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
}

export interface AssessmentStudent {
    id: string
    username: string
    userDetails?: {
        firstName: string
        lastName: string
    }
}

export interface AttendanceRecord {
    id: string | number
    userId: string
    date: string
    status: "present" | "absent" | "late"
    notes?: string
}

export interface AttendanceData {
    total: number
    present: number
    absent: number
    percentage: number
    records?: AttendanceRecord[]
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

export interface ApiTransaction {
    id: number
    userId: string
    recordedById?: string | null
    relatedUserId?: string | null
    entryGroupId?: string | null
    transactionDate: string
    amount: number | string
    type: "credit" | "debit"
    category?: "salary" | "fee" | "transfer" | "other" | string
    status: "success" | "failed" | "pending"
    paymentMode?: string | null
    referenceId?: string | null
    primaryRecord?: boolean
    note?: string
    description?: string
    user?: ApiUser | null
    relatedUser?: ApiUser | null
    recordedByUser?: ApiUser | null
}

export interface SubjectChapterProgress {
    subject: string
    totalChapters: number
    completedChapters: number
}

export interface ClassTimetableEntry {
    day: string
    subject: string
    startTime: string
    endTime: string
    room?: string | null
}

export interface ApiCourse {
    id: number
    name: string
    description?: string
    standard?: string
    subjects?: string[]
    subjectProgress?: SubjectChapterProgress[]
    feePerStudent?: number | string
    durationValue?: number
    durationUnit?: "months" | "years"
    studentCapacity?: number
    timetable?: {
        day: string
        subject: string
        startTime: string
        endTime: string
        room?: string | null
    }[]
    classTeacherId?: string | null
    classTeacher?: {
        id: string
        username: string
        userDetails?: {
            firstName?: string
            lastName?: string
        }
    } | null
    isEnrolled?: boolean
    enrolledStudents?: number
    _count?: {
        enrollments: number
    }
}

export interface ApiSubmission {
    id: number
    assignmentId: number
    userId: string
    filePath: string
    content?: string | null
    reviewStatus?: "submitted" | "completed" | "incomplete" | "rework"
    reviewRemark?: string | null
    reviewedAt?: string | null
    reviewedBy?: string | null
    xpAwardedAt?: string | null
    submittedAt: string
    user?: {
        id?: string
        username: string
        email?: string
        userDetails?: {
            firstName?: string
            lastName?: string
            avatar?: string | null
        }
    }
    reviewer?: {
        id?: string
        username: string
        userDetails?: {
            firstName?: string
            lastName?: string
        }
    } | null
    assignment?: {
        id?: number
        title: string
        description?: string
        dueDate?: string
        file?: string
        rewardPoints?: number
        courseId?: number
        course?: { name: string; standard?: string }
    }
}

export interface ApiGrade {
    id: number
    userId: string
    assignmentId: number
    grade: string
    gradedAt: string
    gradedBy: string
    assignment?: { title: string }
    user?: { username: string }
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

export type LeaderboardCategory = 'weekly' | 'monthly' | 'allTime' | 'course';
export type LeaderboardSort = 'xp' | 'points';

export interface LeaderboardEntry {
  userId: string;
  username: string;
  firstName?: string;
  lastName?: string;
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
