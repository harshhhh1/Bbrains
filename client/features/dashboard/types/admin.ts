export interface OverviewPeopleStats {
    teachers: number
    managers: number
    staff: number
    students: number
    studentToTeacherRatio: number | null
    roleDistribution: Array<{
        role: string
        count: number
    }>
}

export interface OverviewStudentStats {
    total: number
    boys: number
    girls: number
    others: number
}

export interface OverviewFinanceTransaction {
    amount: number
    type: "credit" | "debit"
    transactionDate: string
    note: string
}

export interface OverviewFinanceStats {
    currency: string
    feePerStudent: number
    receivedIncome: number
    accruedIncome: number
    receivableIncome: number
    revenueTrend: Array<{
        date: string
        amount: number
    }>
    salaryTrend: Array<{
        date: string
        amount: number
    }>
    receivedSource: "config" | "transactions"
    accruedSource: "classes" | "config" | "unavailable"
    latestTransactions: OverviewFinanceTransaction[]
}

export interface OverviewAdminProfile {
    id: string
    username: string
    email: string
    type: string
    createdAt: string
    avatar: string | null
    firstName: string
    lastName: string
    displayName: string
    phone: string
    bio: string
    walletBalance: number
    roles: string[]
}

export interface OverviewInstitutionProfile {
    id: number
    name: string
    email: string
    regNo: string
    createdAt: string
    address: string | null
}

export interface OverviewAnnouncement {
    id: number
    title: string
    content: string
    createdAt: string
    createdBy: {
        username: string
        userDetails: {
            firstName: string
            lastName: string
            displayName: string
        } | null
    } | null
}

export interface OverviewAttendance {
    date: string
    present: number
    absent: number
    total: number
}

export interface OverviewAuditLog {
    id: number
    action: string
    category: string
    entityType: string
    entityId: string
    userId: string
    createdAt: string
    user?: {
        username: string
        userDetails: {
            firstName: string
            lastName: string
            displayName: string
        } | null
    } | null
}

export interface OverviewCourse {
    id: number
    name: string
    standard: string
}

export interface OverviewStats {
    people: OverviewPeopleStats
    students: OverviewStudentStats
    finance: OverviewFinanceStats
    admin: OverviewAdminProfile
    institution: OverviewInstitutionProfile | null
    announcements: OverviewAnnouncement[]
    auditLogs: OverviewAuditLog[]
    recentAttendance: OverviewAttendance[]
    courses: OverviewCourse[]
}

export const emptyStats: OverviewStats = {
    people: {
        teachers: 0,
        managers: 0,
        staff: 0,
        students: 0,
        studentToTeacherRatio: null,
        roleDistribution: [],
    },
    students: {
        total: 0,
        boys: 0,
        girls: 0,
        others: 0,
    },
    finance: {
        currency: "INR",
        feePerStudent: 0,
        receivedIncome: 0,
        accruedIncome: 0,
        receivableIncome: 0,
        revenueTrend: [],
        salaryTrend: [],
        receivedSource: "transactions",
        accruedSource: "unavailable",
        latestTransactions: [],
    },
    admin: {
        id: "",
        username: "",
        email: "",
        type: "admin",
        createdAt: "",
        avatar: null,
        firstName: "",
        lastName: "",
        displayName: "",
        phone: "",
        bio: "",
        walletBalance: 0,
        roles: [],
    },
    institution: null,
    announcements: [],
    auditLogs: [],
    recentAttendance: [],
    courses: [],
}
