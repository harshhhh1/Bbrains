"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  BookOpen,
  Users,
  Plus,
  CheckCircle2,
  GraduationCap,
  LayoutGrid,
} from "lucide-react";
import {
  getSubjectProgressPercent,
  normalizeCourseSubjectProgress,
} from "@/lib/subject-progress";
import { cn } from "@/lib/utils";

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export function CourseCard({ course, enrolling, onEnroll }) {
  const progressEntries = normalizeCourseSubjectProgress(course);
  // Exhaustive check for standard/grade field naming variations
  const courseStandard =
    course.standard ||
    course.grade ||
    course.classLevel ||
    course.metadata?.standard ||
    course.metadata?.grade ||
    null;

  return (
    <Card className="hover:shadow-2xl transition-all duration-500 border-border/60 bg-card/50 backdrop-blur-md rounded-[2.5rem] overflow-hidden group flex flex-col h-full">
      <CardContent className="p-8 flex-1 flex flex-col">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group-hover:bg-primary/20 transition-colors">
            <BookOpen className="w-7 h-7 text-primary" />
          </div>
          <div className="flex flex-col items-end gap-2">
            {course.isEnrolled ? (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1 font-black uppercase tracking-widest text-[9px] h-7 rounded-lg">
                Verified Enrollment
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="px-3 py-1 font-black uppercase tracking-widest text-[9px] h-7 rounded-lg"
              >
                Available Access
              </Badge>
            )}
            {courseStandard ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/40 rounded-xl border border-border/50 shadow-sm animate-in fade-in zoom-in-95 duration-500">
                <GraduationCap className="w-3.5 h-3.5 text-primary/70" />
                <span className="text-xs font-black text-foreground tracking-tight uppercase">
                  {courseStandard}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/5 rounded-xl border border-red-500/10 opacity-60">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-tighter text-red-500/70">
                  Standard Pending
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Title & Info */}
        <div className="mb-8">
          <h3 className="font-black text-2xl text-foreground leading-[1.1] tracking-tighter group-hover:text-primary transition-colors">
            {course.name}
          </h3>
          {course.description && (
            <p className="text-sm text-muted-foreground mt-4 line-clamp-2 leading-relaxed font-medium opacity-80">
              {course.description}
            </p>
          )}
        </div>

        {/* Chapter Progress Cards */}
        {course.isEnrolled && (
          <div className="mb-10 space-y-5 flex-1">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-primary/60" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70">
                  Syllabus Progress
                </h4>
              </div>
              <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
                {progressEntries.length} Subjects
              </span>
            </div>

            {progressEntries.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {progressEntries.map((entry) => {
                  const percent = getSubjectProgressPercent(entry);
                  const isDone = percent === 100;
                  return (
                    <div
                      key={`${course.id}-${entry.subject}`}
                      className={cn(
                        "p-4 rounded-[1.5rem] border transition-all hover:scale-[1.02] relative group/item",
                        isDone
                          ? "bg-emerald-500/5 border-emerald-500/20"
                          : "bg-card border-border/60 shadow-sm hover:border-primary/30",
                      )}
                    >
                      <div className="flex flex-col gap-2">
                        <span className="truncate text-[10px] font-black text-foreground/80 tracking-tight uppercase leading-none">
                          {entry.subject}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black tabular-nums tracking-tighter leading-none">
                            {entry.completedChapters}
                          </span>
                          <span className="text-[9px] font-bold text-muted-foreground/40 uppercase">
                            / {entry.totalChapters || "∞"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 relative">
                        <Progress
                          value={percent}
                          className="h-1 rounded-full bg-muted/40"
                        />
                        {isDone && (
                          <CheckCircle2 className="absolute -right-1 -top-10 w-5 h-5 text-emerald-500 fill-white" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[2rem] border-2 border-dashed border-border/40 px-6 py-12 text-center bg-muted/5 flex flex-col items-center justify-center h-full">
                <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] leading-relaxed max-w-[160px]">
                  Awaiting syllabus publishing for current cycle.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer Section */}
        <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/40 mt-auto">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-background shadow-md ring-1 ring-border/20">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-black">
                {getInitials(
                  course.classTeacher?.userDetails?.firstName ||
                    course.classTeacher?.username,
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest opacity-60 mb-0.5">
                Faculty Lead
              </p>
              <p className="text-xs font-bold text-foreground">
                {course.classTeacher?.userDetails?.firstName ||
                  course.classTeacher?.username ||
                  "Agent TBA"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest opacity-60 mb-0.5">
              Enrolled
            </p>
            <div className="flex items-center gap-1.5 justify-end text-sm font-black text-foreground tabular-nums">
              <Users className="w-4 h-4 text-primary" />{" "}
              {course.enrolledStudents || 0}
            </div>
          </div>
        </div>

        {!course.isEnrolled && (
          <Button
            size="lg"
            onClick={() => onEnroll(course.id)}
            disabled={enrolling}
            className="w-full mt-10 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {enrolling ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            {enrolling ? "Initializing Protocol..." : "Finalize Enrollment"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function Loader2({ className }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}
