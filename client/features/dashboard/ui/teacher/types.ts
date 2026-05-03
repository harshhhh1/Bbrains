import type { AttendanceRecord, SubjectChapterProgress } from "@/services/api/client";

export type TeacherDashboardUser = {
  firstName?: string;
  lastName?: string;
  username?: string;
  teacherSubjects?: string[];
  collegeId?: string | number;
};

export type TeacherDashboardResponse = {
  user?: TeacherDashboardUser;
};

export type TeacherCourse = {
  id: number | string;
  name: string;
  description?: string;
  standard?: string;
  subjects?: string[];
  subjectProgress?: SubjectChapterProgress[];
  _count?: {
    enrollments?: number;
    assignments?: number;
  };
};

export type CourseStudentEnrollment = {
  user: {
    id: string;
    username: string;
    userDetails?: {
      firstName?: string;
      lastName?: string;
      sex?: string;
    };
  };
};

export type CourseAssignment = {
  id: number;
};
