"use client";

import { DashboardContent } from "@/components/dashboard-content";
import { WeeklySchedulePanel } from "@/features/schedule/ui/WeeklySchedulePanel";
import { defaultWeeklySchedule } from "@/features/schedule/api/data";

export default function SchedulePage() {
  return (
    <DashboardContent>
      <WeeklySchedulePanel
        schedule={defaultWeeklySchedule}
        title="Schedule"
        description="Your weekly class schedule"
      />
    </DashboardContent>
  );
}
