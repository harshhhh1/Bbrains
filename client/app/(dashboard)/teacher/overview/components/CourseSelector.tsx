"use client";

import React, { useState } from "react";
import { BookOpen, Users, CalendarDays, Loader2, Minus, Plus, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { canManageSubjectProgress, getSubjectProgressPercent } from "@/lib/subject-progress";
import { TeacherCourse, CourseStudentEnrollment } from "../types";
import { searchStudents } from "../utils";

interface CourseSelectorProps {
  courses: TeacherCourse[];
  selectedCourseId: string;
  setSelectedCourseId: (val: string) => void;
  selectedCourseData: TeacherCourse | null;
  courseLoading: boolean;
  selectedCourseStudents: CourseStudentEnrollment[];
  selectedCourseLessons: number;
  chapterProgressDraft: any[];
  handleUpdateChapterProgress: (subject: string, amount: number) => void;
  handleSaveChapterProgress: () => void;
  savingChapterProgress: boolean;
  teacherSubjects: string[];
}

export function CourseSelector({
  courses,
  selectedCourseId,
  setSelectedCourseId,
  selectedCourseData,
  courseLoading,
  selectedCourseStudents,
  selectedCourseLessons,
  chapterProgressDraft,
  handleUpdateChapterProgress,
  handleSaveChapterProgress,
  savingChapterProgress,
  teacherSubjects,
}: CourseSelectorProps) {
  const [studentSearch, setStudentSearch] = useState("");

  if (courses.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No courses assigned yet.
        </CardContent>
      </Card>
    );
  }

  const filteredStudents = searchStudents(selectedCourseStudents, studentSearch);

  return (
    <Card className="col-span-full border-border/60 shadow-sm lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Course Quick View</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a course to view details and progress
          </p>
        </div>
        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={String(course.id)}>
                {course.name} {course.standard ? `(${course.standard})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {courseLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : selectedCourseData ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Students</p>
                  <p className="text-2xl font-bold">{selectedCourseStudents.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Subjects</p>
                  <p className="text-2xl font-bold">{selectedCourseData.subjects?.length || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Assignments</p>
                  <p className="text-2xl font-bold">{selectedCourseLessons}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card">
              <div className="flex items-center justify-between border-b border-border/60 p-4">
                <h4 className="font-semibold text-foreground">Syllabus Progress</h4>
                <Button
                  size="sm"
                  onClick={handleSaveChapterProgress}
                  disabled={savingChapterProgress || chapterProgressDraft.length === 0}
                >
                  {savingChapterProgress ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Save Progress
                </Button>
              </div>
              <div className="divide-y divide-border/60">
                {chapterProgressDraft.length > 0 ? (
                  chapterProgressDraft.map((progress, i) => {
                    const isManageable = canManageSubjectProgress(progress.subject, teacherSubjects);
                    const percent = getSubjectProgressPercent(progress);

                    return (
                      <div key={i} className={`p-4 ${!isManageable ? 'opacity-60 bg-muted/20' : ''}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{progress.subject}</p>
                            {!isManageable && (
                              <Badge variant="outline" className="text-[10px]">Read Only</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                              Chapter {progress.currentChapter} of {progress.totalChapters}
                            </span>
                            {isManageable && (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  disabled={progress.currentChapter <= 0 || savingChapterProgress}
                                  onClick={() => handleUpdateChapterProgress(progress.subject, -1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  disabled={progress.currentChapter >= progress.totalChapters || savingChapterProgress}
                                  onClick={() => handleUpdateChapterProgress(progress.subject, 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <Progress value={percent} className="h-2" />
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No subjects defined for this course yet.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card">
              <div className="flex flex-col gap-4 border-b border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                <h4 className="font-semibold text-foreground">Enrolled Students</h4>
                <Input
                  placeholder="Search students..."
                  className="w-full sm:max-w-xs"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>
              <div className="grid max-h-[300px] gap-2 overflow-y-auto p-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((enrollment) => (
                    <div
                      key={enrollment.user.id}
                      className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/10 p-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {(enrollment.user.userDetails?.firstName?.[0] || enrollment.user.username[0] || "U").toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {enrollment.user.userDetails?.firstName} {enrollment.user.userDetails?.lastName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          @{enrollment.user.username}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
                    {studentSearch ? "No students found matching your search." : "No students enrolled yet."}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
