"use client";

import React from "react";
import { DashboardContent } from "@/components/dashboard-content";
import { AnnouncementsCard } from "@/features/dashboard/ui/AnnouncementsCard";
import { WeeklySchedulePanel } from "@/features/schedule/ui/WeeklySchedulePanel";
import { Loader2 } from "lucide-react";

// Local teacher dashboard components and hooks
import { useTeacherDashboard } from "./teacher/useTeacherDashboard";
import { TeacherDashboardHeader } from "./teacher/TeacherDashboardHeader";
import { ClassFocusCard } from "./teacher/ClassFocusCard";
import { ClassProgressHub } from "./teacher/ClassProgressHub";
import { formatCurrency } from "./teacher/utils";
import { TeacherStatsCards } from "./teacher/TeacherStatsCards";
import { TeacherIncomeChart } from "./teacher/TeacherIncomeChart";
import { PendingTasksWidget } from "./teacher/PendingTasksWidget";

export function TeacherDashboard() {
  const {
    loading,
    courseLoading,
    savingChapterProgress,
    teacherName,
    teacherSubjects,
    courses,
    selectedCourseId,
    setSelectedCourseId,
    selectedCourseStudents,
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
    handleSaveChapterProgress
  } = useTeacherDashboard();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  const now = new Date();
  const todayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const todayLectures = teacherSchedule.find(s => s.day === todayName)?.classes.length || 0;

  return (
    <DashboardContent maxWidth="max-w-[96rem]" className="space-y-4">

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.85fr)]">
        <TeacherDashboardHeader 
          teacherName={teacherName}
          selectedCourseStudentsCount={selectedCourseStudents.length}
          selectedCourseName={selectedCourse?.name || ""}
          todayLectures={todayLectures}
          todayName={todayName}
          attendancePercentage={attendance?.percentage ?? 0}
          attendancePresent={attendance?.present ?? 0}
          attendanceTotal={attendance?.total ?? 0}
        />
        
        <ClassFocusCard 
          selectedCourseId={selectedCourseId}
          setSelectedCourseId={setSelectedCourseId}
          courses={courses}
          incomeReceived={incomeReceived}
          formatCurrency={formatCurrency}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
        <div className="space-y-4">
          <ClassProgressHub 
            courseLoading={courseLoading}
            selectedCourse={selectedCourse}
            chapterProgressDraft={chapterProgressDraft}
            teacherSubjects={teacherSubjects}
            savingChapterProgress={savingChapterProgress}
            hasChapterDraftChanges={hasChapterDraftChanges}
            onUpdateProgress={updateChapterProgress}
            onSave={handleSaveChapterProgress}
          />
          
          <TeacherIncomeChart salaryTransactions={salaryTransactions} />
        </div>
        
        <div className="space-y-4">
          <PendingTasksWidget 
            pendingAssignments={pendingAssignments}
            pendingAttendance={0}
          />
          
          <AnnouncementsCard 
            initialAnnouncements={announcements} 
            collegeId={collegeId} 
          />
        </div>
      </div>

      <WeeklySchedulePanel 
        schedule={teacherSchedule} 
        title="Weekly Teaching Timetable" 
      />
    </DashboardContent>
  );
}
