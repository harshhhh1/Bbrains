"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, BookOpen, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

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
  schedule = [],
  title = "Weekly Timetable",
  description = "View your scheduled classes for the week.",
  emptyMessage = "No classes scheduled for this day.",
}: WeeklySchedulePanelProps) {
  const currentDayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const initialTab = schedule.some((s) => s.day.toLowerCase() === currentDayName.toLowerCase())
    ? currentDayName
    : (schedule[0]?.day || "Monday");

  const [activeDay, setActiveDay] = useState(initialTab);

  // Short day label for mobile tabs (e.g. "Monday" -> "Mon")
  const getShortDay = (day: string) => day.slice(0, 3);

  return (
    <Card className="border-border/60 shadow-md overflow-hidden bg-gradient-to-br from-card to-card/95 transition-all hover:shadow-lg">
      <CardHeader className="bg-muted/30 pt-5 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <CardTitle className="text-xl font-bold tracking-tight text-foreground">{title}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">{description}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {schedule.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Calendar className="size-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground max-w-xs">{emptyMessage}</p>
          </div>
        ) : (
          <Tabs value={activeDay} onValueChange={setActiveDay} className="w-full">
            {/* Daily selector tabs */}
            <TabsList className="grid grid-cols-7 w-full h-11 bg-muted/65 p-1 rounded-xl mb-6">
              {schedule.map((dayData) => {
                const hasClasses = dayData.classes.length > 0;
                return (
                  <TabsTrigger
                    key={dayData.day}
                    value={dayData.day}
                    className={cn(
                      "rounded-lg text-xs font-medium transition-all relative py-2",
                      hasClasses && "font-semibold text-foreground"
                    )}
                  >
                    <span className="hidden sm:inline">{dayData.day}</span>
                    <span className="sm:hidden">{getShortDay(dayData.day)}</span>
                    {hasClasses && (
                      <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary" />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Daily Schedule display */}
            {schedule.map((dayData) => (
              <TabsContent key={dayData.day} value={dayData.day} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                {dayData.classes.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center border border-dashed border-border/80 rounded-2xl bg-muted/10">
                    <div className="size-12 rounded-full bg-muted/40 flex items-center justify-center mb-4">
                      <Clock className="size-6 text-muted-foreground/30" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground/80 max-w-xs">{emptyMessage}</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                    {dayData.classes.map((cls, idx) => (
                      <div
                        key={idx}
                        className="group flex items-start gap-4 p-5 rounded-2xl border border-border/50 bg-card hover:bg-muted/10 transition-all duration-300 hover:border-primary/30 hover:shadow-sm"
                      >
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-base font-bold text-foreground truncate group-hover:text-primary transition-colors duration-200">
                              {cls.subject}
                            </h4>
                            <span className="shrink-0 text-xs px-2.5 py-0.5 rounded-full font-medium bg-muted text-muted-foreground border border-border/50">
                              {cls.standard}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Clock className="size-3.5" />
                              <span>
                                {cls.startTime} - {cls.endTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="size-3.5" />
                              <span>{cls.room || "N/A"}</span>
                            </div>
                          </div>
                          {cls.courseName && cls.courseName !== cls.standard && (
                            <p className="text-[11px] text-muted-foreground/60 italic pt-1 truncate">
                              Class: {cls.courseName}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
