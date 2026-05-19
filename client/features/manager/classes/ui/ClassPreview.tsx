"use client";

import { WeeklySchedulePanel } from "@/components/ui/weekly-schedule-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Course } from "@/services/api/client";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
}

function toWeeklySchedule(course: any) {
  if (!course) return [];
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  const scheduleMap = new Map<string, any[]>();
  daysOfWeek.forEach(day => scheduleMap.set(day, []));

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

  daysOfWeek.forEach(day => {
    const dayClasses = scheduleMap.get(day) || [];
    dayClasses.sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
    scheduleMap.set(day, dayClasses);
  });

  return daysOfWeek.map(day => ({
    day,
    classes: scheduleMap.get(day) || []
  }));
}

export function ClassPreview({ selectedClass }: { selectedClass: Course | null }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle>{selectedClass ? `${selectedClass.name} timetable` : "Class preview"}</CardTitle>
        <CardDescription>
          {selectedClass
            ? `Timetable and class setup for ${selectedClass.standard || selectedClass.name}.`
            : "Select a class to preview its weekly timetable."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedClass ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Subjects</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(selectedClass.subjects || []).map((subject) => (
                    <Badge key={`${selectedClass.id}-subject-${subject}`} variant="secondary">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Duration And Fees
                </p>
                <p className="mt-3 text-sm text-foreground">
                  {selectedClass.durationValue} {selectedClass.durationUnit} at {formatCurrency(Number(selectedClass.feePerStudent || 0))} per
                  student
                </p>
              </div>
            </div>
            <WeeklySchedulePanel
              schedule={toWeeklySchedule(selectedClass)}
              title="Weekly Class Timetable"
              description="Manager-defined timetable for this class"
              emptyMessage="No timetable slots defined for this day."
            />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No class selected.</p>
        )}
      </CardContent>
    </Card>
  );
}
