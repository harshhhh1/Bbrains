"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { DashboardContent } from "@/components/dashboard-content";
import { AnnouncementsCard } from "@/features/dashboard/components/AnnouncementsCard";
import { SectionHeader } from "@/features/admin/components/SectionHeader";
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
import { WeeklySchedulePanel } from "@/features/schedule/components/WeeklySchedulePanel";
import { buildWeeklyScheduleFromCourses, type WeeklyScheduleDay } from "@/features/schedule/data";
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
      const data = maybeResponse.data;
      if (typeof data === "object" && data !== null && "message" in data && typeof data.message === "string") {
        return data.message;
      }
    }

    if ("message" in error && typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }
  }

  return fallback;
}

function CompactSummaryCard({
  label,
  value,
  sub,
  icon,
  color = "text-primary",
  href,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  color?: string;
  href?: string;
}) {
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

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}

export default function OverviewPage() {
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

        if (dashboardResult.status === "rejected" && userResult.status === "rejected") {
          throw new Error("Unable to load your teacher profile right now.");
        }

        const dashboardUser =
          dashboardResult.status === "fulfilled" ? dashboardResult.value.data.data?.user : undefined;
        const profileUser = userResult.status === "fulfilled" ? userResult.value.data.data : undefined;
        const teacherProfile = profileUser || dashboardUser;
        const fullName = `${teacherProfile?.firstName || ""} ${teacherProfile?.lastName || ""}`.trim();
        const nextCourses = coursesResult.status === "fulfilled" ? coursesResult.value.data.data || [] : [];
        const partialFailures: string[] = [];

        setTeacherName(fullName || teacherProfile?.username || "Teacher");
        setCollegeId(teacherProfile?.collegeId);
        setTeacherSubjects(Array.isArray(profileUser?.teacherSubjects) ? profileUser.teacherSubjects : []);
        setCourses(nextCourses);
        setAnnouncements(
          announcementsResult.status === "fulfilled" ? (announcementsResult.value.data.data || []).slice(0, 5) : []
        );
        setIncomeReceived(
          transactionsResult.status === "fulfilled"
            ? (transactionsResult.value.data.data || []).reduce(
                (sum, transaction) => sum + Number(transaction.amount || 0),
                0
              )
            : 0
        );
        setAttendance(
          attendanceResult.status === "fulfilled"
            ? normalizeAttendance(attendanceResult.value.data.data || [])
            : normalizeAttendance([])
        );
        setTeacherSchedule(buildWeeklyScheduleFromCourses(nextCourses, fullName || teacherProfile?.username || "Teacher"));

        if (nextCourses.length > 0) {
          setSelectedCourseId((current) => current || String(nextCourses[0].id));
        } else {
          setSelectedCourseId("");
        }

        if (coursesResult.status === "rejected") {
          partialFailures.push(
            getRequestErrorMessage(coursesResult.reason, "Class data is unavailable right now.")
          );
        }

        if (announcementsResult.status === "rejected") {
          partialFailures.push("Announcements could not be loaded.");
        }

        if (transactionsResult.status === "rejected") {
          partialFailures.push("Income totals are temporarily unavailable.");
        }

        if (attendanceResult.status === "rejected") {
          partialFailures.push("Attendance data could not be loaded.");
        }

        setError(partialFailures.length > 0 ? partialFailures[0] : null);
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
      } catch (loadError) {
        console.error(loadError);
        setSelectedCourseStudents([]);
        setSelectedCourseLessons(0);
      } finally {
        setCourseLoading(false);
      }
    }

    loadSelectedCourse();
  }, [selectedCourseId]);

  const selectedCourse = useMemo(
    () => courses.find((course) => String(course.id) === selectedCourseId) || null,
    [courses, selectedCourseId]
  );

  const selectedCourseSubjectProgress = useMemo(
    () => normalizeCourseSubjectProgress(selectedCourse),
    [selectedCourse]
  );

  useEffect(() => {
    setChapterProgressDraft(selectedCourseSubjectProgress);
  }, [selectedCourseSubjectProgress]);

  const hasChapterDraftChanges = useMemo(() => {
    return JSON.stringify(chapterProgressDraft) !== JSON.stringify(selectedCourseSubjectProgress);
  }, [chapterProgressDraft, selectedCourseSubjectProgress]);

  function handleChapterDraftChange(subject: string, patch: Partial<SubjectChapterProgress>) {
    setChapterProgressDraft((current) =>
      current.map((entry) => {
        if (entry.subject !== subject) return entry;

        const next = clampChapterProgress(
          patch.totalChapters ?? entry.totalChapters,
          patch.completedChapters ?? entry.completedChapters
        );

        return {
          ...entry,
          ...next,
        };
      })
    );
  }

  async function handleSaveChapterProgress() {
    if (!selectedCourse) return;

    try {
      setSavingChapterProgress(true);
      const response = await courseApi.updateCourse(selectedCourse.id, {
        subjectProgress: chapterProgressDraft,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to save chapter progress");
      }

      setCourses((current) =>
        current.map((course) =>
          String(course.id) === String(selectedCourse.id) ? { ...course, ...response.data } : course
        )
      );
      toast.success("Chapter progress updated");
    } catch (saveError) {
      console.error(saveError);
      toast.error(saveError instanceof Error ? saveError.message : "Failed to save chapter progress");
    } finally {
      setSavingChapterProgress(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
      </div>
    );
  }
  const girlsCount = selectedCourseStudents.filter(
    (student) => student.user.userDetails?.sex?.toLowerCase() === "female"
  ).length;
  const boysCount = selectedCourseStudents.filter(
    (student) => student.user.userDetails?.sex?.toLowerCase() === "male"
  ).length;
  const now = new Date();
  const todayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const todayLectures =
    teacherSchedule.find((scheduleDay) => scheduleDay.day === todayName)?.classes.length || 0;
  const currentDate = formatLongDate(now);
  const attendancePercent = attendance?.percentage ?? 0;
  const trackedSubjects = chapterProgressDraft.length;
  const subjectOverflowCount = Math.max(teacherSubjects.length - 4, 0);

  return (
    <DashboardContent maxWidth="max-w-[96rem]" className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.85fr)]">
        <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-primary/5 shadow-sm">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col gap-5">
              <SectionHeader
                title="Teacher Dashboard"
                subtitle={`Track classes, chapter coverage, timetable, attendance, and announcements for ${teacherName}.`}
              />

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {teacherSubjects.length > 0 ? (
                    <>
                      {teacherSubjects.slice(0, 4).map((subject) => (
                        <Badge key={subject} variant="secondary" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em]">
                          {subject}
                        </Badge>
                      ))}
                      {subjectOverflowCount > 0 ? (
                        <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em]">
                          +{subjectOverflowCount} more
                        </Badge>
                      ) : null}
                    </>
                  ) : (
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em]">
                      No subjects assigned
                    </Badge>
                  )}

                  <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em]">
                    {selectedCourse ? `Focused on ${selectedCourse.name}` : "Pick a class to start"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-[2.45rem]">
                    Teaching overview for {teacherName}
                  </h1>
                  <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                    This view keeps your active class, chapter coverage, timetable, attendance, and institution updates in one compact workspace so you can move faster between teaching tasks.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <CompactSummaryCard
                  label="Class Strength"
                  value={selectedCourseStudents.length}
                  sub={selectedCourse ? selectedCourse.name : "Select a class"}
                  icon={<Users className="size-4" />}
                />
                <CompactSummaryCard
                  label="Lectures Today"
                  value={todayLectures}
                  sub={todayName}
                  icon={<CalendarDays className="size-4" />}
                />
                <CompactSummaryCard
                  label="Attendance"
                  value={`${attendancePercent}%`}
                  sub={attendance ? `${attendance.present}/${attendance.total} present` : "Attendance unavailable"}
                  icon={<Check className="size-4" />}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/95 shadow-sm">
          <CardContent className="grid gap-4 p-4">
            <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Class Focus
              </p>
              <div className="mt-3">
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger>
                    <SelectValue placeholder={courses.length ? "Select class" : "No classes available"} />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={String(course.id)}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{currentDate}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <CompactSummaryCard
                label="Salary Received"
                value={formatCurrency(incomeReceived)}
                sub="Successful salary credits"
                icon={<BadgeIndianRupee className="size-4" />}
                href="/transactions"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <CompactSummaryCard
                  label="Girls"
                  value={girlsCount}
                  sub="In selected class"
                  icon={<GraduationCap className="size-4" />}
                  color="text-pink-600"
                />
                <CompactSummaryCard
                  label="Boys"
                  value={boysCount}
                  sub="In selected class"
                  icon={<School className="size-4" />}
                  color="text-sky-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50/60 dark:border-red-900/50 dark:bg-red-950/20">
          <CardContent className="flex items-center gap-2 p-4 text-sm text-red-600 dark:text-red-300">
            <AlertCircle className="h-4 w-4" />
            {error}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-brand-orange" />
              Class Progress Hub
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {courseLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading selected class details...
              </div>
            ) : selectedCourse ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{selectedCourse.name}</Badge>
                  <Badge variant="outline">
                    {selectedCourseLessons} lesson{selectedCourseLessons === 1 ? "" : "s"}
                  </Badge>
                  <Badge variant="outline">
                    {selectedCourseStudents.length} student{selectedCourseStudents.length === 1 ? "" : "s"}
                  </Badge>
                  <Badge variant="outline">
                    {trackedSubjects} subject{trackedSubjects === 1 ? "" : "s"} tracked
                  </Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <CompactSummaryCard
                    label="Class"
                    value={selectedCourse.standard || selectedCourse.name}
                    sub="Current teaching focus"
                    icon={<BookOpen className="size-4" />}
                  />
                  <CompactSummaryCard
                    label="Lessons"
                    value={selectedCourseLessons}
                    sub="From current assignments"
                    icon={<CalendarDays className="size-4" />}
                  />
                  <CompactSummaryCard
                    label="Student Mix"
                    value={`${girlsCount}/${boysCount}`}
                    sub="Girls / boys"
                    icon={<Users className="size-4" />}
                  />
                  <CompactSummaryCard
                    label="Progress Items"
                    value={trackedSubjects}
                    sub="Subjects with chapter tracking"
                    icon={<Check className="size-4" />}
                  />
                </div>

                <div className="rounded-2xl border border-border/60 bg-muted/15 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Chapter Progress Tracker
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Update total and completed chapters for each subject in the selected class.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="rounded-2xl"
                      onClick={handleSaveChapterProgress}
                      disabled={!hasChapterDraftChanges || savingChapterProgress || chapterProgressDraft.length === 0}
                    >
                      {savingChapterProgress ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Check className="mr-2 size-4" />}
                      Save Progress
                    </Button>
                  </div>

                  {chapterProgressDraft.length === 0 ? (
                    <div className="mt-4 rounded-xl border border-dashed border-border/70 bg-background px-3 py-4 text-sm text-muted-foreground">
                      Add subjects to this class first to start tracking chapter progress.
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {chapterProgressDraft.map((entry) => {
                        const canEdit = canManageSubjectProgress(teacherSubjects, entry.subject);
                        const progressValue = getSubjectProgressPercent(entry);

                        return (
                          <div key={`${selectedCourse.id}-${entry.subject}`} className="rounded-xl border border-border/60 bg-background p-3">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge variant="secondary">{entry.subject}</Badge>
                                  {canEdit ? null : <Badge variant="outline">Read only</Badge>}
                                  <span className="text-xs text-muted-foreground">
                                    {entry.completedChapters} / {entry.totalChapters || "-"} chapters complete
                                  </span>
                                </div>
                                <Progress value={progressValue} className="mt-3 h-2" />
                                <p className="mt-2 text-xs text-muted-foreground">
                                  {entry.totalChapters > 0
                                    ? `${progressValue}% covered for this subject in the selected class.`
                                    : "Set total chapters to begin progress tracking."}
                                </p>
                              </div>

                              <div className="grid gap-3 sm:grid-cols-[130px_190px]">
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                    Total Chapters
                                  </p>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={entry.totalChapters}
                                    disabled={!canEdit}
                                    onChange={(event) =>
                                      handleChapterDraftChange(entry.subject, {
                                        totalChapters: Number(event.target.value),
                                      })
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                    Completed Chapters
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon-xs"
                                      className="rounded-full"
                                      disabled={!canEdit || entry.completedChapters <= 0}
                                      onClick={() =>
                                        handleChapterDraftChange(entry.subject, {
                                          completedChapters: entry.completedChapters - 1,
                                        })
                                      }
                                    >
                                      <Minus className="size-3" />
                                    </Button>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={entry.completedChapters}
                                      disabled={!canEdit || entry.totalChapters <= 0}
                                      onChange={(event) =>
                                        handleChapterDraftChange(entry.subject, {
                                          completedChapters: Number(event.target.value),
                                        })
                                      }
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon-xs"
                                      className="rounded-full"
                                      disabled={!canEdit || entry.totalChapters <= 0 || entry.completedChapters >= entry.totalChapters}
                                      onClick={() =>
                                        handleChapterDraftChange(entry.subject, {
                                          completedChapters: entry.completedChapters + 1,
                                        })
                                      }
                                    >
                                      <Plus className="size-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No courses are available yet, so class and subject details cannot be shown.
              </p>
            )}
          </CardContent>
        </Card>

        <AnnouncementsCard initialAnnouncements={announcements} collegeId={collegeId} />
      </div>

      <WeeklySchedulePanel
        schedule={teacherSchedule}
        title="Weekly Teaching Timetable"
        description="Generated from the current course list because teacher timetable records are not stored yet."
        emptyMessage="No teaching slots generated yet."
      />
    </DashboardContent>
  );
}
