"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AssessmentCreationForm({
  form,
  onChange,
  courses,
  subjectOptions,
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
          Type
        </label>
        <Select
          value={form.assessmentType}
          onValueChange={(value) => onChange({ assessmentType: value })}
        >
          <SelectTrigger className="rounded-xl h-11 font-bold bg-muted/20 border-border/40">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/60">
            <SelectItem value="test">Class Test</SelectItem>
            <SelectItem value="exam">Main Exam</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
          Class
        </label>
        <Select
          value={form.courseId}
          onValueChange={(value) => onChange({ courseId: value, subject: "" })}
        >
          <SelectTrigger className="rounded-xl h-11 font-bold bg-muted/20 border-border/40">
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/60">
            {courses.map((course) => (
              <SelectItem key={course.id} value={String(course.id)}>
                {course.name}
                {course.standard ? ` (${course.standard})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
          Date
        </label>
        <Input
          type="date"
          className="rounded-xl h-11 font-bold bg-muted/20 border-border/40"
          value={form.assessmentDate}
          onChange={(e) => onChange({ assessmentDate: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
          Subject
        </label>
        {subjectOptions.length <= 1 ? (
          <div className="flex h-11 items-center rounded-xl border border-border/40 bg-muted/40 px-3 text-sm font-bold">
            {subjectOptions[0] || "Select a class first"}
          </div>
        ) : (
          <Select
            value={form.subject}
            onValueChange={(value) => onChange({ subject: value })}
          >
            <SelectTrigger className="rounded-xl h-11 font-bold bg-muted/20 border-border/40">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/60">
              {subjectOptions.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
          Topic
        </label>
        <Input
          className="rounded-xl h-11 font-medium bg-muted/20 border-border/40"
          value={form.topic}
          placeholder="e.g. Algebra Fundamentals"
          onChange={(e) => onChange({ topic: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
          Max Score
        </label>
        <Input
          type="number"
          min="1"
          step="0.01"
          className="rounded-xl h-11 font-bold bg-muted/20 border-border/40"
          value={form.totalMarks}
          placeholder="100"
          onChange={(e) => onChange({ totalMarks: e.target.value })}
        />
      </div>
    </div>
  );
}
