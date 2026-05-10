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
        displayName?: string
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