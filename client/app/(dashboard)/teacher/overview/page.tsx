"use client";

import React from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { DashboardContent } from "@/components/dashboard-content";
import { SectionHeader } from "@/features/admin/components/SectionHeader";
import { WeeklySchedulePanel } from "@/features/schedule/components/WeeklySchedulePanel";
import { AttendanceCard } from "@/features/dashboard/components/AttendanceCard";
import { AnnouncementsCard } from "@/features/dashboard/components/AnnouncementsCard";

import { useOverview } from "./hooks/useOverview";
import { StatsOverview, CourseSelector } from "./components";

export default function OverviewPage() {
  const {
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
  } = useOverview();

  if (loading) {
    return (
      <DashboardContent>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardContent>
    );
  }

  if (error) {
    return (
      <DashboardContent>
        <div className="flex h-[80vh] flex-col items-center justify-center text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
          <h2 className="mb-2 text-2xl font-bold">Something went wrong</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent className="space-y-8">
      <SectionHeader
        title={`Welcome back, ${teacherName}`}
        subtitle={
          teacherSubjects.length > 0
            ? `Specializing in ${teacherSubjects.join(", ")}`
            : "View your classes, schedule, and student progress."
        }
      />

      <StatsOverview
        activeCoursesCount={activeCoursesCount}
        totalStudentsEnrolled={totalStudentsEnrolled}
        incomeReceived={incomeReceived}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <CourseSelector
          courses={courses}
          selectedCourseId={selectedCourseId}
          setSelectedCourseId={setSelectedCourseId}
          selectedCourseData={selectedCourseData}
          courseLoading={courseLoading}
          selectedCourseStudents={selectedCourseStudents}
          selectedCourseLessons={selectedCourseLessons}
          chapterProgressDraft={chapterProgressDraft}
          handleUpdateChapterProgress={handleUpdateChapterProgress}
          handleSaveChapterProgress={handleSaveChapterProgress}
          savingChapterProgress={savingChapterProgress}
          teacherSubjects={teacherSubjects}
        />

        <div className="col-span-full space-y-6 lg:col-span-1">
          <AttendanceCard attendance={attendance as any} title="Overall Attendance" />
          <AnnouncementsCard announcements={announcements as any} />
        </div>
      </div>

      <div className="mt-8">
        <h3 className="mb-4 text-xl font-bold text-foreground">Your Weekly Schedule</h3>
        <div className="rounded-2xl border border-border/60 bg-muted/10 p-4 shadow-sm">
          <WeeklySchedulePanel schedule={teacherSchedule} />
        </div>
      </div>
    </DashboardContent>
  );
}
