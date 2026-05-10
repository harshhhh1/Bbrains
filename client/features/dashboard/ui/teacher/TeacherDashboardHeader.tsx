import React from "react";
import { useUser } from "@/context/user-context";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/features/admin/ui/SectionHeader";
import { Users, CalendarDays, Check } from "lucide-react";
import { CompactSummaryCard } from "./CompactSummaryCard";

interface TeacherDashboardHeaderProps {
  teacherName: string;
  selectedCourseStudentsCount: number;
  selectedCourseName: string;
  todayLectures: number;
  todayName: string;
  attendancePercentage: number;
  attendancePresent: number;
  attendanceTotal: number;
}

export function TeacherDashboardHeader({
  teacherName,
  selectedCourseStudentsCount,
  selectedCourseName,
  todayLectures,
  todayName,
  attendancePercentage,
  attendancePresent,
  attendanceTotal,
}: TeacherDashboardHeaderProps) {
  const { user } = useUser();
  const greetingName = user?.displayName || user?.firstName || teacherName || "Teacher";

  return (
    <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-primary/5 shadow-sm">
      <CardContent className="p-5 sm:p-6">
        <SectionHeader title="Teacher Dashboard" subtitle={`Teaching overview for ${greetingName}`} />
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
