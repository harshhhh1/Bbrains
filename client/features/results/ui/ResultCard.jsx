"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, User } from "lucide-react";

function fmtDate(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function resultPercentage(result) {
  const total = Number(result.assessment.totalMarks || 0);
  if (!total) return 0;
  return Math.round((Number(result.marksObtained || 0) / total) * 100);
}

function teacherName(result) {
  const details = result.assessment.createdBy?.userDetails;
  const full = `${details?.firstName || ""} ${details?.lastName || ""}`.trim();
  return full || result.assessment.createdBy?.username || "Faculty";
}

export function ResultCard({ result }) {
  const percentage = resultPercentage(result);

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-all group">
      <CardContent className="space-y-4 bg-card/50 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="font-bold tracking-widest uppercase text-[9px] px-2 py-0"
              >
                {result.assessment.assessmentType}
              </Badge>
              <Badge
                variant="secondary"
                className="bg-primary/5 text-primary border-primary/10 text-[10px] font-bold"
              >
                {result.assessment.subject}
              </Badge>
              {result.assessment.course?.name && (
                <Badge variant="secondary" className="text-[10px] font-bold">
                  {result.assessment.course.name}
                </Badge>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold leading-tight text-foreground tracking-tight group-hover:text-primary transition-colors">
                {result.assessment.topic}
              </h3>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <Calendar className="h-3 w-3" />
                  {fmtDate(result.assessment.assessmentDate)}
                </div>
                <div className="w-1 h-1 rounded-full bg-border" />
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <User className="h-3 w-3" />
                  {teacherName(result)}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/50 backdrop-blur-sm p-4 text-left shadow-inner sm:min-w-[160px] sm:text-right flex flex-col justify-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Performance
            </p>
            <div className="flex items-baseline gap-1 sm:justify-end">
              <span className="text-2xl font-black text-foreground tabular-nums">
                {result.marksObtained}
              </span>
              <span className="text-xs font-bold text-muted-foreground opacity-40">
                / {result.assessment.totalMarks}
              </span>
            </div>
            <p
              className={cn(
                "text-sm font-black mt-1",
                percentage >= 75
                  ? "text-emerald-500"
                  : percentage >= 40
                    ? "text-primary"
                    : "text-destructive",
              )}
            >
              {percentage}% Result
            </p>
          </div>
        </div>

        {result.remark && (
          <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 animate-in fade-in slide-in-from-top-1 duration-500">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
              <Trophy className="h-3.5 w-3.5" />
              Faculty Verdict
            </div>
            <p className="text-sm font-medium leading-relaxed text-foreground/80 italic italic-quote">
              &ldquo;{result.remark}&rdquo;
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const cn = (...classes) => classes.filter(Boolean).join(" ");
