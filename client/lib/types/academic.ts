export interface ApiAssignment {
    id: number
    courseId: number
    createdById?: string | null
    title: string
    description?: string
    content?: string
    file?: string
    rewardPoints?: number
    rewardCoins?: number
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
            displayName?: string
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
    createdBy?: { username: string; userDetails?: string }
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
            displayName?: string
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
            displayName?: string
            avatar?: string | null
        }
    }
    reviewer?: {
        id?: string
        username: string
        userDetails?: {
            firstName?: string
            lastName?: string
            displayName?: string
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

export interface ApiCourse {
    id: number
    name: string
    description?: string
    standard?: string
    collegeId?: number | string
    college?: { id: number; name: string }
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
            displayName?: string
        }
    } | null
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
    isEnrolled?: boolean
    enrolledStudents?: number
    _count?: {
        enrollments: number
    }
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