"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Coffee } from "lucide-react";
import { WeeklyScheduleDay } from "@/features/schedule/api/data";

const colors = [
  "bg-primary/10 border-primary/30",
  "bg-green-500/10 border-green-500/30",
  "bg-yellow-500/10 border-yellow-500/30",
  "bg-purple-500/10 border-purple-500/30",
  "bg-pink-500/10 border-pink-500/30",
];

interface WeeklySchedulePanelProps {
  schedule: WeeklyScheduleDay[];
  title?: string;
  description?: string;
  emptyMessage?: string;
}

export function WeeklySchedulePanel({
  schedule,
  title = "Weekly Timetable",
  description = "Your weekly class schedule",
  emptyMessage = "No classes scheduled yet.",
}: WeeklySchedulePanelProps) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Calendar className="w-3 h-3" /> {today}
        </Badge>
      </div>

      <div className="grid gap-4">
        {schedule.map((day) => (
          <Card key={day.day} className={day.day === today ? "ring-2 ring-primary/50" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                {day.day}
                {day.day === today && <Badge className="text-xs">Today</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {day.classes.length === 0 ? (
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
              ) : (
                <div className="grid gap-2">
                  {day.classes.map((cls, index) => {
                    const isBreak = cls.subject.toLowerCase() === "break";
                    return (
                      <div
                        key={`${day.day}-${cls.time}-${cls.subject}-${index}`}
                        className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                          isBreak 
                            ? "bg-orange-50/50 border-orange-200/50" 
                            : colors[index % colors.length]
                        }`}
                      >
                        <div className="shrink-0 text-center min-w-[84px]">
                          <p className={`text-xs font-medium flex items-center gap-1 ${
                            isBreak ? "text-orange-600" : "text-muted-foreground"
                          }`}>
                            <Clock className="w-3 h-3" /> {cls.time}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${
                            isBreak ? "text-orange-700" : "text-foreground"
                          }`}>
                            {cls.subject}
                          </p>
                          {cls.teacher ? (
                            <p className="text-xs text-muted-foreground">{cls.teacher}</p>
                          ) : null}
                        </div>
                        {!isBreak && (
                          <Badge variant="outline" className="shrink-0 text-xs gap-1">
                            <MapPin className="w-3 h-3" /> {cls.room}
                          </Badge>
                        )}
                        {isBreak && (
                          <Coffee className="size-3.5 text-orange-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
