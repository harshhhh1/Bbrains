"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { DashboardContent } from "@/components/dashboard-content";
import { AnnouncementsCard } from "@/features/dashboard/ui/AnnouncementsCard";
import { SectionHeader } from "@/features/admin/ui/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { courseApi, getAuthedClient, type Announcement, type AttendanceData, type AttendanceRecord, type SubjectChapterProgress, type Transaction } from "@/services/api/client";
import { WeeklySchedulePanel } from "@/features/schedule/ui/WeeklySchedulePanel";
import { buildWeeklyScheduleFromCourses, type WeeklyScheduleDay } from "@/features/schedule/api/data";
import { canManageSubjectProgress, getSubjectProgressPercent, normalizeCourseSubjectProgress } from "@/lib/subject-progress";
import {
  AlertCircle,
  BadgeIndianRupee,
  BookOpen,
  CalendarDays,
  Check,
  GraduationCap,
  Loader2,
  Minus,
  Plus,
  School,
  Users,
} from "lucide-react";
import { toast } from "sonner";

type TeacherDashboardUser = {
  firstName?: string;
  lastName?: string;
  username?: string;
  teacherSubjects?: string[];
  collegeId?: string | number;
};

type TeacherDashboardResponse = {
  user?: TeacherDashboardUser;
};

type TeacherCourse = {
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

type CourseStudentEnrollment = {
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

type CourseAssignment = {
  id: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function normalizeAttendance(records: AttendanceRecord[]): AttendanceData {
  const normalizedRecords = records.map((record) => ({
    ...record,
    status: String(record.status).toLowerCase() as AttendanceRecord["status"],
  }));

  const total = normalizedRecords.length;
  const present = normalizedRecords.filter((record) => record.status === "present").length;
  const absent = normalizedRecords.filter((record) => record.status === "absent").length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  return {
    total,
    present,
    absent,
    percentage,
    records: normalizedRecords,
  };
}

function clampChapterProgress(totalChapters: number, completedChapters: number) {
  const safeTotal = Math.max(0, Math.floor(Number(totalChapters) || 0));
  const safeCompleted = Math.max(0, Math.floor(Number(completedChapters) || 0));

  return {
    totalChapters: safeTotal,
    completedChapters: safeTotal > 0 ? Math.min(safeCompleted, safeTotal) : 0,
  };
}

function getRequestErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null) {
    const maybeResponse = "response" in error ? error.response : null;
    if (typeof maybeResponse === "object" && maybeResponse !== null && "data" in maybeResponse) {
      const data = maybeResponse.data as any;
      if (data && typeof data.message === "string") return data.message;
    }
    if ("message" in error && typeof error.message === "string" && error.message.trim()) return error.message;
  }
  return fallback;
}

function CompactSummaryCard({ label, value, sub, icon, color = "text-primary", href }: any) {
  const content = (
    <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm transition-all hover:border-primary/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <p className={`mt-2 text-2xl font-bold tracking-tight ${color}`}>{value}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{sub}</p>
        </div>
        <div className="rounded-xl bg-primary/10 p-2.5 text-primary">{icon}</div>
      </div>
    </div>
  );
  if (!href) return content;
  return <Link href={href} className="block">{content}</Link>;
}

export function TeacherDashboard() {
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
        const [dashboardResult, userResult, coursesResult, announcementsResult, transactionsResult, attendanceResult] = await Promise.allSettled([
          client.get<{ success: boolean; data: TeacherDashboardResponse }>("/dashboard"),
          client.get<{ success: boolean; data: TeacherDashboardUser }>("/user/me"),
          client.get<{ success: boolean; data: TeacherCourse[] }>("/courses?limit=100"),
          client.get<{ success: boolean; data: Announcement[] }>("/announcements"),
          client.get<{ success: boolean; data: Transaction[] }>("/transactions/me?limit=100&category=salary&type=credit&status=success"),
          client.get<{ success: boolean; data: AttendanceRecord[] }>("/attendance"),
        ]);

        if (dashboardResult.status === "rejected" && userResult.status === "rejected") {
          throw new Error("Unable to load your teacher profile right now.");
        }

        const teacherProfile = (userResult.status === "fulfilled" ? userResult.value.data.data : undefined) || (dashboardResult.status === "fulfilled" ? dashboardResult.value.data.data?.user : undefined);
        const fullName = `${teacherProfile?.firstName || ""} ${teacherProfile?.lastName || ""}`.trim();
        const nextCourses = coursesResult.status === "fulfilled" ? coursesResult.value.data.data || [] : [];
        
        setTeacherName(fullName || teacherProfile?.username || "Teacher");
        setCollegeId(teacherProfile?.collegeId);
        setTeacherSubjects(Array.isArray(teacherProfile?.teacherSubjects) ? teacherProfile.teacherSubjects : []);
        setCourses(nextCourses);
        setAnnouncements(announcementsResult.status === "fulfilled" ? (announcementsResult.value.data.data || []).slice(0, 5) : []);
        setIncomeReceived(transactionsResult.status === "fulfilled" ? (transactionsResult.value.data.data || []).reduce((sum, t) => sum + Number(t.amount || 0), 0) : 0);
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
  useEffect(() => { setChapterProgressDraft(selectedCourseSubjectProgress); }, [selectedCourseSubjectProgress]);
  const hasChapterDraftChanges = useMemo(() => JSON.stringify(chapterProgressDraft) !== JSON.stringify(selectedCourseSubjectProgress), [chapterProgressDraft, selectedCourseSubjectProgress]);

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

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground/50" /></div>;
  }

  const girlsCount = selectedCourseStudents.filter(s => s.user.userDetails?.sex?.toLowerCase() === "female").length;
  const boysCount = selectedCourseStudents.filter(s => s.user.userDetails?.sex?.toLowerCase() === "male").length;
  const now = new Date();
  const todayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const todayLectures = teacherSchedule.find(s => s.day === todayName)?.classes.length || 0;

  return (
    <DashboardContent maxWidth="max-w-[96rem]" className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.85fr)]">
        <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-primary/5 shadow-sm">
          <CardContent className="p-5 sm:p-6">
            <SectionHeader title="Teacher Dashboard" subtitle={`Teaching overview for ${teacherName}`} />
            <div className="grid gap-3 sm:grid-cols-3 mt-6">
                <CompactSummaryCard label="Class Strength" value={selectedCourseStudents.length} sub={selectedCourse?.name || "Pick class"} icon={<Users className="size-4" />} />
                <CompactSummaryCard label="Lectures Today" value={todayLectures} sub={todayName} icon={<CalendarDays className="size-4" />} />
                <CompactSummaryCard label="Attendance" value={`${attendance?.percentage ?? 0}%`} sub={attendance ? `${attendance.present}/${attendance.total} present` : "-"} icon={<Check className="size-4" />} />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/95 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">Class Focus</p>
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>{courses.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
            <div className="grid gap-3 mt-4">
                <CompactSummaryCard label="Salary Received" value={formatCurrency(incomeReceived)} sub="Successful credits" icon={<BadgeIndianRupee className="size-4" />} href="/transactions" />
            </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
        <Card className="border-border/60">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-5 w-5 text-brand-orange" />Class Progress Hub</CardTitle></CardHeader>
            <CardContent>
                {courseLoading ? <Loader2 className="animate-spin h-5 w-5" /> : selectedCourse ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-xs font-bold uppercase text-muted-foreground">Chapter Progress</p>
                            <Button size="sm" onClick={handleSaveChapterProgress} disabled={!hasChapterDraftChanges || savingChapterProgress}>Save</Button>
                        </div>
                        <div className="space-y-3">
                            {chapterProgressDraft.map(entry => (
                                <div key={entry.subject} className="p-3 border rounded-xl">
                                    <div className="flex justify-between mb-2"><Badge>{entry.subject}</Badge><span>{entry.completedChapters}/{entry.totalChapters}</span></div>
                                    <Progress value={getSubjectProgressPercent(entry)} />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : <p>Select a class</p>}
            </CardContent>
        </Card>
        <AnnouncementsCard initialAnnouncements={announcements} collegeId={collegeId} />
      </div>

      <WeeklySchedulePanel schedule={teacherSchedule} title="Weekly Teaching Timetable" />
    </DashboardContent>
  );
}
