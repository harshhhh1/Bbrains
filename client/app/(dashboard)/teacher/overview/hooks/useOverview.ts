import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  courseApi,
  getAuthedClient,
  Announcement,
  AttendanceData,
  AttendanceRecord,
  SubjectChapterProgress,
  Transaction,
} from "@/services/api/client";
import { buildWeeklyScheduleFromCourses, WeeklyScheduleDay } from "@/features/schedule/data";
import { normalizeCourseSubjectProgress } from "@/lib/subject-progress";
import { TeacherCourse, TeacherDashboardResponse, TeacherDashboardUser, CourseStudentEnrollment, CourseAssignment } from "../types";
import { normalizeAttendance } from "../utils";

export function useOverview() {
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
  const [teacherSchedule, setTeacherSchedule] = useState<WeeklyScheduleDay[]>([]);
  const [chapterProgressDraft, setChapterProgressDraft] = useState<SubjectChapterProgress[]>([]);
  const [collegeId, setCollegeId] = useState<string | number | undefined>();

  useEffect(() => {
    async function loadOverview() {
      try {
        setLoading(true);
        setError(null);

        const client = await getAuthedClient();
        const [
          dashboardResult,
          userResult,
          coursesResult,
          announcementsResult,
          transactionsResult,
          attendanceResult,
        ] = await Promise.allSettled([
          client.get<{ success: boolean; data: TeacherDashboardResponse }>("/dashboard"),
          client.get<{ success: boolean; data: TeacherDashboardUser }>("/user/me"),
          client.get<{ success: boolean; data: TeacherCourse[] }>("/courses?limit=100"),
          client.get<{ success: boolean; data: Announcement[] }>("/announcements"),
          client.get<{ success: boolean; data: Transaction[] }>("/transactions/me?limit=100&category=salary&type=credit&status=success"),
          client.get<{ success: boolean; data: AttendanceRecord[] }>("/attendance"),
        ]);

        let combinedUser: TeacherDashboardUser = {};

        if (dashboardResult.status === "fulfilled" && dashboardResult.value.data.success && dashboardResult.value.data.data?.user) {
          combinedUser = { ...dashboardResult.value.data.data.user };
        }

        if (userResult.status === "fulfilled" && userResult.value.data.success && userResult.value.data.data) {
          const u = userResult.value.data.data;
          combinedUser = { ...combinedUser, ...u };

          if (u.collegeId !== undefined) {
             setCollegeId(u.collegeId);
          }
        }

        const name =
          combinedUser.firstName && combinedUser.lastName
            ? `${combinedUser.firstName} ${combinedUser.lastName}`
            : combinedUser.firstName || combinedUser.username || "Teacher";
        setTeacherName(name);

        const tSubjects = Array.isArray(combinedUser.teacherSubjects) ? combinedUser.teacherSubjects : [];
        setTeacherSubjects(tSubjects);

        if (coursesResult.status === "fulfilled" && coursesResult.value.data.success) {
          const coursesData = coursesResult.value.data.data;
          setCourses(coursesData);

          if (coursesData && coursesData.length > 0) {
            setSelectedCourseId(String(coursesData[0].id));
            const schedule = buildWeeklyScheduleFromCourses(coursesData as any[]);
            setTeacherSchedule(schedule);
          }
        }

        if (announcementsResult.status === "fulfilled" && announcementsResult.value.data.success) {
          setAnnouncements(announcementsResult.value.data.data || []);
        }

        if (transactionsResult.status === "fulfilled" && transactionsResult.value.data.success) {
          const transactions = transactionsResult.value.data.data || [];
          const totalIncome = transactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
          setIncomeReceived(totalIncome);
        }

        if (attendanceResult.status === "fulfilled" && attendanceResult.value.data.success) {
          const rawRecords = attendanceResult.value.data.data || [];
          setAttendance(normalizeAttendance(rawRecords));
        }

      } catch (err: any) {
        console.error("Dashboard error:", err);
        setError("Failed to load dashboard data. Please try refreshing.");
        toast.error("Failed to load teacher dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, []);

  const loadCourseDetails = useCallback(async (courseId: string | number) => {
    if (!courseId) return;

    try {
      setCourseLoading(true);
      const client = await getAuthedClient();

      const [studentsResult, lessonsResult] = await Promise.allSettled([
        client.get<{ success: boolean; data: CourseStudentEnrollment[] }>(`/courses/${courseId}/students`),
        client.get<{ success: boolean; data: CourseAssignment[] }>(`/courses/${courseId}/assignments`),
      ]);

      if (studentsResult.status === "fulfilled" && studentsResult.value.data.success) {
        setSelectedCourseStudents(studentsResult.value.data.data || []);
      } else {
        setSelectedCourseStudents([]);
      }

      if (lessonsResult.status === "fulfilled" && lessonsResult.value.data.success) {
        setSelectedCourseLessons(lessonsResult.value.data.data?.length || 0);
      } else {
        setSelectedCourseLessons(0);
      }
    } catch (err) {
      console.error("Failed to load course details:", err);
    } finally {
      setCourseLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseDetails(selectedCourseId);
    }
  }, [selectedCourseId, loadCourseDetails]);

  const selectedCourseData = useMemo(
    () => courses.find((c) => String(c.id) === selectedCourseId) || null,
    [courses, selectedCourseId]
  );

  useEffect(() => {
    if (selectedCourseData) {
      const normalized = normalizeCourseSubjectProgress(selectedCourseData.subjectProgress as any, selectedCourseData.subjects as any);
      setChapterProgressDraft(normalized);
    } else {
      setChapterProgressDraft([]);
    }
  }, [selectedCourseData]);

  const activeCoursesCount = courses.length;
  const totalStudentsEnrolled = courses.reduce(
    (sum, course) => sum + (course._count?.enrollments || 0),
    0
  );

  const handleUpdateChapterProgress = (subject: string, amount: number) => {
    setChapterProgressDraft(prev => {
      return prev.map(p => {
        if (p.subject === subject) {
          const newCurrent = Math.max(0, Math.min(p.totalChapters || 0, (p.currentChapter || 0) + amount));
          return { ...p, currentChapter: newCurrent };
        }
        return p;
      });
    });
  };

  const handleSaveChapterProgress = async () => {
    if (!selectedCourseId) return;

    try {
      setSavingChapterProgress(true);

      const payload = {
        subjectProgress: chapterProgressDraft.map(p => ({
          subject: p.subject,
          currentChapter: p.currentChapter,
          totalChapters: p.totalChapters
        }))
      };

      const response = await courseApi.updateCourse(Number(selectedCourseId), payload);

      if (response.success) {
        toast.success("Progress updated successfully");
        setCourses(prev => prev.map(c =>
          String(c.id) === selectedCourseId
            ? { ...c, subjectProgress: chapterProgressDraft }
            : c
        ));
      } else {
        toast.error("Failed to update progress");
      }
    } catch (error) {
      console.error("Save progress error:", error);
      toast.error("An error occurred saving progress");
    } finally {
      setSavingChapterProgress(false);
    }
  };

  return {
    loading,
    error,
    teacherName,
    teacherSubjects,
    courses,
    selectedCourseId,
    setSelectedCourseId,
    selectedCourseData,
    courseLoading,
    selectedCourseStudents,
    selectedCourseLessons,
    attendance,
    announcements,
    incomeReceived,
    teacherSchedule,
    chapterProgressDraft,
    savingChapterProgress,
    collegeId,
    activeCoursesCount,
    totalStudentsEnrolled,
    handleUpdateChapterProgress,
    handleSaveChapterProgress
  };
}
