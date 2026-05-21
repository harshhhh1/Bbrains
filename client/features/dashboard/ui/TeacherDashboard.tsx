"use client";

import React from "react";

import { AnnouncementsCard } from "@/features/dashboard/ui/AnnouncementsCard";
import { Grid, PageContainer, Stack } from "@/components/layout/page-primitives";
import { LoadingState } from "@/components/ui/loading-state";

import { ClassFocusCard } from "./teacher/ClassFocusCard";
import { ClassProgressHub } from "./teacher/ClassProgressHub";
import { RecentSubmissionsWidget } from "./teacher/RecentSubmissionsWidget";
import { TeacherIncomeChart } from "./teacher/TeacherIncomeChart";
import { formatCurrency } from "./teacher/utils";
import { useTeacherDashboard } from "./teacher/useTeacherDashboard";

export function TeacherDashboard() {
  const {
    loading,
    courseLoading,
    savingChapterProgress,
    teacherSubjects,
    courses,
    selectedCourseId,
    setSelectedCourseId,
    announcements,
    incomeReceived,
    salaryTransactions,
    chapterProgressDraft,
    collegeId,
    selectedCourse,
    hasChapterDraftChanges,
    updateChapterProgress,
    handleSaveChapterProgress,
    recentSubmissions,
  } = useTeacherDashboard();

  if (loading) {
    return <LoadingState label="Loading teacher dashboard..." className="py-12" />;
  }

  return (
    <PageContainer width="2xl" gap="sm">
      <Grid>
        <ClassFocusCard
          selectedCourseId={selectedCourseId}
          setSelectedCourseId={setSelectedCourseId}
          courses={courses}
          incomeReceived={incomeReceived}
          formatCurrency={formatCurrency}
        />
      </Grid>

      <Grid className="xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
        <Stack>
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
        </Stack>

        <Stack>
          <RecentSubmissionsWidget submissions={recentSubmissions} />
          <AnnouncementsCard initialAnnouncements={announcements} collegeId={collegeId} />
        </Stack>
      </Grid>
    </PageContainer>
  );
}
