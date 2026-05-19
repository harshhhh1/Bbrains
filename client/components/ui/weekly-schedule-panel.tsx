"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export interface WeeklyScheduleDay {
  day: string;
  classes: any[];
}

interface WeeklySchedulePanelProps {
  schedule: WeeklyScheduleDay[];
  title?: string;
  description?: string;
  emptyMessage?: string;
}

export function WeeklySchedulePanel({
  title = "Weekly Timetable",
  description = "View your scheduled classes for the week.",
}: WeeklySchedulePanelProps) {
  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Calendar className="size-5" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-12 flex flex-col items-center justify-center text-center">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Calendar className="size-6 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-medium text-muted-foreground max-w-xs">
          The unified schedule module is currently being updated. Please check your individual class pages for specific timings.
        </p>
      </CardContent>
    </Card>
  );
}
