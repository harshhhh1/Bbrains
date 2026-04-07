"use client";

import React from "react";
import { BookOpen, CalendarDays, IndianRupee, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WeeklySchedulePanel } from "@/features/schedule/components/WeeklySchedulePanel";
import { Course } from "@/services/api/client";
import { formatCurrency, toWeeklySchedule } from "../utils";

interface ClassDetailsProps {
  selectedClass: Course | null;
  handleEdit: (c: Course) => void;
}

export function ClassDetails({ selectedClass, handleEdit }: ClassDetailsProps) {
  if (!selectedClass) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Class preview</CardTitle>
          <CardDescription>Select a class to view its timetable</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
            <BookOpen className="mb-4 h-12 w-12 opacity-20" />
            <p>Select a class from the list to view details</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const enrolled = selectedClass._count?.enrollments ?? selectedClass.enrolledStudents ?? 0;

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle>{selectedClass.name} timetable</CardTitle>
        <CardDescription>
          Timetable and class setup for {selectedClass.standard || selectedClass.name}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="rounded-xl bg-muted/40 p-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <IndianRupee className="size-3.5" />
                Fee Base
              </div>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {selectedClass.feePerStudent ? formatCurrency(selectedClass.feePerStudent) : "TBD"}
              </p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <CalendarDays className="size-3.5" />
                Duration
              </div>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {selectedClass.duration?.value
                  ? `${selectedClass.duration.value} ${selectedClass.duration.unit}`
                  : "Ongoing"}
              </p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <Users className="size-3.5" />
                Students
              </div>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {enrolled} / {selectedClass.studentCapacity || 0}
              </p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <BookOpen className="size-3.5" />
                Timetable Slots
              </div>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {selectedClass.timetable?.length || 0}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-muted/10 p-4">
            <WeeklySchedulePanel schedule={toWeeklySchedule(selectedClass)} />
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => handleEdit(selectedClass)}>
              Edit Class Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
