import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/features/admin/ui/SectionHeader";
import { Users, CalendarDays, Check } from "lucide-react";
import { CompactSummaryCard } from "./CompactSummaryCard";

export function TeacherDashboardHeader({
  teacherName,
  selectedCourseStudentsCount,
  selectedCourseName,
  todayLectures,
  todayName,
  attendancePercentage,
  attendancePresent,
  attendanceTotal,
}) {
  return (
    <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-primary/5 shadow-sm">
      <CardContent className="p-5 sm:p-6">
        <SectionHeader
          title="Teacher Dashboard"
          subtitle={`Teaching overview for ${teacherName}`}
        />
        <div className="grid gap-3 sm:grid-cols-3 mt-6">
          <CompactSummaryCard
            label="Class Strength"
            value={selectedCourseStudentsCount}
            sub={selectedCourseName || "Pick class"}
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
            value={`${attendancePercentage}%`}
            sub={`${attendancePresent}/${attendanceTotal} present`}
            icon={<Check className="size-4" />}
          />
        </div>
      </CardContent>
    </Card>
  );
}
