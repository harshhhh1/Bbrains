import { useState, useEffect, useMemo } from "react";
import {
  courseApi,
  getAuthedClient,
  type SubjectChapterProgress,
  type Transaction,
  type AttendanceRecord,
  type Announcement,
  type AttendanceData
} from "@/services/api/client";
import { normalizeCourseSubjectProgress } from "@/lib/subject-progress";
import { toast } from "sonner";
import { normalizeAttendance, getRequestErrorMessage } from "./utils";

export interface WeeklyScheduleDay {
  day: string;
  classes: any[];
}

function buildWeeklyScheduleFromCourses(courses: any[], teacherName: string): WeeklyScheduleDay[] {
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  const scheduleMap = new Map<string, any[]>();
  daysOfWeek.forEach(day => scheduleMap.set(day, []));

  courses.forEach(course => {
    let timetable: any[] = [];
    if (course.timetable) {
      try {
        timetable = typeof course.timetable === "string" 
          ? JSON.parse(course.timetable) 
          : course.timetable;
      } catch (e) {
        console.error("Failed to parse timetable for course", course.id, e);
      }
    }

    if (Array.isArray(timetable)) {
      timetable.forEach(entry => {
        const entryDayNormalized = daysOfWeek.find(
          d => d.toLowerCase() === entry.day?.toLowerCase() || d.toLowerCase().startsWith(entry.day?.toLowerCase()?.slice(0, 3) || "")
        );

        if (entryDayNormalized) {
          scheduleMap.get(entryDayNormalized)?.push({
            courseId: course.id,
            courseName: course.name,
            standard: course.standard || course.name,
            subject: entry.subject,
            startTime: entry.startTime,
            endTime: entry.endTime,
            room: entry.room || "N/A"
          });
        }
      });
    }
  });

  daysOfWeek.forEach(day => {
    const dayClasses = scheduleMap.get(day) || [];
    dayClasses.sort((a, b) => {
      return (a.startTime || "").localeCompare(b.startTime || "");
    });
    scheduleMap.set(day, dayClasses);
  });

  return daysOfWeek.map(day => ({
    day,
    classes: scheduleMap.get(day) || []
  }));
}
import type {
  TeacherDashboardResponse,
  TeacherDashboardUser,
  TeacherCourse,
  CourseStudentEnrollment,
  CourseAssignment
} from "./types";

export function useTeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(false);
  const [savingChapterProgress, setSavingChapterProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState("Teacher");
  const [teacherSubjects, setTeacherSubjects] = useState<string[]>([]);
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedCourseStudents, setSelectedCourseStudents] = useState<CourseStudentEnrollment[]>([]);
  const [selectedCourseLessons, setSelectedCourseLessons] = useState(0);
  const [attendance, setAttendance] = useState<AttendanceData | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [incomeReceived, setIncomeReceived] = useState(0);
  const [salaryTransactions, setSalaryTransactions] = useState<Transaction[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState(0);
  const [teacherSchedule, setTeacherSchedule] = useState<WeeklyScheduleDay[]>([]);
  const [chapterProgressDraft, setChapterProgressDraft] = useState<SubjectChapterProgress[]>([]);
  const [collegeId, setCollegeId] = useState<string | number | undefined>();
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);

  useEffect(() => {
    async function loadOverview() {
      try {
        setLoading(true);
        setError(null);
        const client = await getAuthedClient();
        const [dashboardResult, userResult, coursesResult, announcementsResult, transactionsResult, attendanceResult, assignmentsResult] = await Promise.allSettled([
          client.get<{ success: boolean; data: TeacherDashboardResponse }>("/dashboard"),
          client.get<{ success: boolean; data: TeacherDashboardUser }>("/user/me"),
          client.get<{ success: boolean; data: TeacherCourse[] }>("/courses?limit=100"),
          client.get<{ success: boolean; data: Announcement[] }>("/announcements"),
          client.get<{ success: boolean; data: Transaction[] }>("/transactions/me?limit=100&category=salary&type=credit&status=success"),
          client.get<{ success: boolean; data: AttendanceRecord[] }>("/attendance"),
          client.get<{ success: boolean; data: any }>("/academic/assignments?status=pending"),
        ]);

        if (dashboardResult.status === "rejected" && userResult.status === "rejected") {
          throw new Error("Unable to load your teacher profile right now.");
        }

        const teacherProfile = (userResult.status === "fulfilled" ? userResult.value.data.data : undefined) as any || (dashboardResult.status === "fulfilled" ? dashboardResult.value.data.data?.user : undefined);
        const displayName = teacherProfile?.displayName || teacherProfile?.userDetails?.displayName || "";
        const firstName = teacherProfile?.firstName || teacherProfile?.userDetails?.firstName || "";
        const lastName = teacherProfile?.lastName || teacherProfile?.userDetails?.lastName || "";
        const fullName = displayName || `${firstName} ${lastName}`.trim();
        const nextCourses = coursesResult.status === "fulfilled" ? coursesResult.value.data.data || [] : [];

        setTeacherName(fullName || teacherProfile?.username || "Teacher");
        setCollegeId(teacherProfile?.collegeId);
        const nextTeacherSubjects = Array.isArray(teacherProfile?.teacherSubjects)
          ? teacherProfile.teacherSubjects
          : Array.isArray(teacherProfile?.userDetails?.teacherSubjects)
            ? teacherProfile.userDetails.teacherSubjects
            : [];
        setTeacherSubjects(nextTeacherSubjects);
        setCourses(nextCourses);
        setAnnouncements(announcementsResult.status === "fulfilled" ? (announcementsResult.value.data.data || []).slice(0, 5) : []);
        setIncomeReceived(transactionsResult.status === "fulfilled" ? (transactionsResult.value.data.data || []).reduce((sum, t) => sum + Number(t.amount || 0), 0) : 0);
        setSalaryTransactions(transactionsResult.status === "fulfilled" ? (transactionsResult.value.data.data || []) : []);

        const assignmentsData = assignmentsResult.status === "fulfilled" ? (assignmentsResult.value.data.data || []) : [];
        setPendingAssignments(Array.isArray(assignmentsData) ? assignmentsData.length : 0);

        const nextSubmissions = dashboardResult.status === "fulfilled" ? dashboardResult.value.data.data?.recentSubmissions || [] : [];
        setRecentSubmissions(nextSubmissions);

        setAttendance(attendanceResult.status === "fulfilled" ? normalizeAttendance(attendanceResult.value.data.data || []) : normalizeAttendance([]));
        setTeacherSchedule(buildWeeklyScheduleFromCourses(nextCourses, fullName || teacherProfile?.username || "Teacher"));
        if (nextCourses.length > 0) setSelectedCourseId(String(nextCourses[0].id));
      } catch (loadError) {
        console.error(loadError);
        setError(getRequestErrorMessage(loadError, "Failed to load teacher dashboard data."));
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, []);

  useEffect(() => {
    async function loadSelectedCourse() {
      if (!selectedCourseId) {
        setSelectedCourseStudents([]);
        setSelectedCourseLessons(0);
        return;
      }
      try {
        setCourseLoading(true);
        const client = await getAuthedClient();
        const [studentsRes, assignmentsRes] = await Promise.all([
          client.get<{ success: boolean; data: CourseStudentEnrollment[] }>(`/courses/${selectedCourseId}/students`),
          client.get<{ success: boolean; data: CourseAssignment[] }>(`/courses/${selectedCourseId}/assignments`),
        ]);
        setSelectedCourseStudents(studentsRes.data.data || []);
        setSelectedCourseLessons((assignmentsRes.data.data || []).length);
      } catch (e) {
        console.error(e);
      } finally {
        setCourseLoading(false);
      }
    }
    loadSelectedCourse();
  }, [selectedCourseId]);

  const selectedCourse = useMemo(() => courses.find((c) => String(c.id) === selectedCourseId) || null, [courses, selectedCourseId]);
  const selectedCourseSubjectProgress = useMemo(() => normalizeCourseSubjectProgress(selectedCourse), [selectedCourse]);

  useEffect(() => {
    setChapterProgressDraft(selectedCourseSubjectProgress);
  }, [selectedCourseSubjectProgress]);

  const hasChapterDraftChanges = useMemo(() => JSON.stringify(chapterProgressDraft) !== JSON.stringify(selectedCourseSubjectProgress), [chapterProgressDraft, selectedCourseSubjectProgress]);

  const updateChapterProgress = (subject: string, field: "completedChapters" | "totalChapters", value: number) => {
    setChapterProgressDraft((prev) =>
      prev.map((p) =>
        p.subject === subject
          ? { ...p, [field]: value }
          : p
      )
    );
  };

  async function handleSaveChapterProgress() {
    if (!selectedCourse) return;
    try {
      setSavingChapterProgress(true);
      const response = await courseApi.updateCourse(selectedCourse.id, { subjectProgress: chapterProgressDraft });
      if (response.success) {
        setCourses((prev) => prev.map((c) => String(c.id) === String(selectedCourse.id) ? { ...c, ...response.data } : c));
        toast.success("Chapter progress updated");
      }
    } catch (e) {
      toast.error("Failed to save chapter progress");
    } finally {
      setSavingChapterProgress(false);
    }
  }

  return {
    loading,
    courseLoading,
    savingChapterProgress,
    error,
    teacherName,
    teacherSubjects,
    courses,
    selectedCourseId,
    setSelectedCourseId,
    selectedCourseStudents,
    selectedCourseLessons,
    attendance,
    announcements,
    incomeReceived,
    salaryTransactions,
    pendingAssignments,
    teacherSchedule,
    chapterProgressDraft,
    collegeId,
    selectedCourse,
    hasChapterDraftChanges,
    updateChapterProgress,
    handleSaveChapterProgress,
    recentSubmissions
  };
}
