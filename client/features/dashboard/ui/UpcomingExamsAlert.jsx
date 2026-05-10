"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { examApi } from "@/services/api/client";

const ALERT_WINDOW_DAYS = 7;

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(dateStr);
  exam.setHours(0, 0, 0, 0);
  return Math.round((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function fmtDate(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function UpcomingExamsAlert() {
  const [upcomingExams, setUpcomingExams] = useState([]);

  useEffect(() => {
    async function loadExams() {
      try {
        const res = await examApi.getUpcomingExams();
        if (res.success && res.data) {
          const allExams = Array.isArray(res.data) ? res.data : [];
          // Sort by closest first (server already orders, but ensure)
          allExams.sort(
            (a, b) =>
              new Date(a.examDate).getTime() - new Date(b.examDate).getTime(),
          );
          setUpcomingExams(allExams);
        }
      } catch {
        // Silently fail — alert is non-critical
      }
    }
    void loadExams();
  }, []);

  if (upcomingExams.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 overflow-hidden">
      {/* Header strip */}
      <div className="flex items-center gap-2 px-5 py-3 bg-amber-500/15 border-b border-amber-500/20">
        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
        <p className="text-xs font-black uppercase tracking-widest text-amber-600">
          {upcomingExams.length === 1
            ? "1 Upcoming Exam This Week"
            : `${upcomingExams.length} Upcoming Exams This Week`}
        </p>
      </div>

      {/* Exam list */}
      <div className="divide-y divide-amber-500/10">
        {upcomingExams.map((exam) => {
          const days = daysUntil(exam.examDate);
          const isToday = days === 0;
          const isTomorrow = days === 1;
          const urgencyLabel = isToday
            ? "TODAY"
            : isTomorrow
              ? "TOMORROW"
              : `IN ${days} DAYS`;

          return (
            <div
              key={exam.id}
              className="flex items-center gap-4 px-5 py-4 hover:bg-amber-500/5 transition-colors"
            >
              {/* Urgency badge */}
              <div
                className={`
                  flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-2xl
                  font-black text-[10px] uppercase tracking-widest
                  ${
                    isToday || isTomorrow
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
                      : "bg-amber-500/15 text-amber-600"
                  }
                `}
              >
                <CalendarDays className="h-5 w-5 mb-0.5" />
                {urgencyLabel}
              </div>

              {/* Exam info */}
              <div className="flex-1 min-w-0">
                <p className="font-black text-foreground truncate">
                  {exam.topic}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <BookOpen className="h-3 w-3" />
                    {exam.subjectName}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="text-[10px] font-bold text-muted-foreground">
                    Sem {exam.semesterNumber}
                  </span>
                  {exam.course?.name && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {exam.course.name}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-[11px] font-bold text-amber-600 mt-1">
                  {fmtDate(exam.examDate)} • Max: {exam.totalMarks} marks
                </p>
              </div>

              <ChevronRight className="h-4 w-4 text-amber-500/60 shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
