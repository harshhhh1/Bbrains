"use client";

import { WeeklySchedulePanel } from "@/features/schedule/components/WeeklySchedulePanel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Course } from "@/services/api/client";
import { formatCurrency, toWeeklySchedule } from "../utils/classes";

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
                  {selectedClass.durationValue} {selectedClass.durationUnit} at {formatCurrency(selectedClass.feePerStudent)} per
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
