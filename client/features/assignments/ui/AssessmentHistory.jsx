"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PenSquare, Target, Trophy } from "lucide-react";

function fmtDate(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function assessmentLabel(type) {
  return type === "exam" ? "Main Exam" : "Class Test";
}

function averagePercentage(assessment) {
  const totalMarks = Number(assessment.totalMarks || 0);
  if (!totalMarks || assessment.results.length === 0) return 0;
  const totalScored = assessment.results.reduce(
    (sum, result) => sum + Number(result.marksObtained || 0),
    0,
  );
  return Math.round(
    (totalScored / (assessment.results.length * totalMarks)) * 100,
  );
}

export function AssessmentHistory({ assessments, onEdit }) {
  return (
    <div className="space-y-4">
      {assessments.map((assessment) => (
        <div
          key={assessment.id}
          className="flex flex-col gap-4 rounded-[2rem] border border-border/60 bg-muted/10 p-6 lg:flex-row lg:items-center lg:justify-between hover:bg-muted/20 transition-colors group"
        >
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="font-black uppercase tracking-widest text-[9px] px-2 py-0.5 border-primary/20 text-primary bg-primary/5"
              >
                {assessmentLabel(assessment.assessmentType)}
              </Badge>
              <Badge variant="secondary" className="font-bold text-[10px]">
                {assessment.subject}
              </Badge>
              <Badge variant="secondary" className="font-bold text-[10px]">
                {assessment.course?.name || `Class ${assessment.courseId}`}
              </Badge>
            </div>
            <div>
              <p className="font-black text-foreground text-lg tracking-tight group-hover:text-primary transition-colors">
                {assessment.topic}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                <span>{fmtDate(assessment.assessmentDate)}</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>{assessment.results.length} Candidates</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="text-primary/70 flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  Avg {averagePercentage(assessment)}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center rounded-xl bg-card border border-border/60 px-4 py-2 text-xs font-black uppercase tracking-widest text-muted-foreground shadow-sm">
              <Target className="mr-2 h-4 w-4 text-primary" />
              Scale: {assessment.totalMarks}
            </div>
            <Button
              variant="outline"
              className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all"
              onClick={() => onEdit(assessment)}
            >
              <PenSquare className="mr-2 h-4 w-4" />
              Correction
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
