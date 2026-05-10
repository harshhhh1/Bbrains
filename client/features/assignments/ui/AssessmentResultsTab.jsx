"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Filter,
  Loader2,
  ClipboardEdit,
  Users,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionHeader } from "@/features/admin/ui/SectionHeader";
import { examApi } from "@/services/api/client";
import { ResultEntryDrawer } from "@/features/assignments/ui/ResultEntryDrawer";

function personName(student) {
  const full =
    `${student.userDetails?.firstName || ""} ${student.userDetails?.lastName || ""}`.trim();
  return full || student.username || "Student";
}

function initials(student) {
  const first = student.userDetails?.firstName?.[0] || "";
  const last = student.userDetails?.lastName?.[0] || "";
  if (first || last) return `${first}${last}`.toUpperCase();
  return student.username?.[0]?.toUpperCase() || "?";
}

export function AssessmentResultsTab({ courses }) {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerStudent, setDrawerStudent] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadStudentsAndExams = useCallback(async () => {
    const courseId = Number(selectedCourseId);
    if (!courseId) {
      setStudents([]);
      setExams([]);
      return;
    }

    try {
      setLoading(true);
      const [studentsRes, examsRes] = await Promise.all([
        examApi.getCourseStudents(courseId),
        examApi.getTeacherExams(),
      ]);

      if (studentsRes.success && studentsRes.data) {
        setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
      }

      if (examsRes.success && examsRes.data) {
        // Filter exams for this course only
        const courseExams = (
          Array.isArray(examsRes.data) ? examsRes.data : []
        ).filter((e) => e.courseId === courseId);
        setExams(courseExams);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    void loadStudentsAndExams();
  }, [loadStudentsAndExams]);

  const drawerStudentIndex = useMemo(
    () =>
      drawerStudent ? students.findIndex((s) => s.id === drawerStudent.id) : -1,
    [drawerStudent, students],
  );

  function openDrawer(student) {
    setDrawerStudent(student);
    setDrawerOpen(true);
  }

  function handleDrawerClose() {
    setDrawerOpen(false);
    setDrawerStudent(null);
  }

  async function handleSaved() {
    // Reload exams to get fresh results
    await loadStudentsAndExams();
    setDrawerOpen(false);
    setDrawerStudent(null);
  }

  async function handleSaveAndNext() {
    // Reload exams to get fresh results
    await loadStudentsAndExams();
    const nextIndex = drawerStudentIndex + 1;
    if (nextIndex < students.length) {
      setDrawerStudent(students[nextIndex]);
    } else {
      setDrawerOpen(false);
      setDrawerStudent(null);
      toast.success("All students processed!");
    }
  }

  const selectedCourse = useMemo(
    () => courses.find((c) => String(c.id) === selectedCourseId) || null,
    [courses, selectedCourseId],
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Results Management"
        subtitle="Enter exam results for students by selecting a class."
      />

      {/* Course Filter */}
      <Card className="rounded-[2rem] border-border/60 bg-card/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Filter className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 max-w-sm">
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
              >
                <SelectTrigger className="rounded-xl h-11 font-bold bg-muted/20 border-border/40">
                  <SelectValue placeholder="Filter by class…" />
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
            {selectedCourse && (
              <Badge
                variant="outline"
                className="font-black uppercase tracking-widest text-[9px] px-3 py-1"
              >
                {students.length} Students • {exams.length} Exams
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
            Loading students…
          </p>
        </div>
      )}

      {/* No course selected */}
      {!selectedCourseId && !loading && (
        <div className="py-20 text-center rounded-3xl border-2 border-dashed border-border/40 bg-muted/10">
          <GraduationCap className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground font-bold italic">
            Select a class to view students
          </p>
        </div>
      )}

      {/* Empty state */}
      {selectedCourseId && !loading && students.length === 0 && (
        <div className="py-20 text-center rounded-3xl border-2 border-dashed border-border/40 bg-muted/10">
          <Users className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground font-bold italic">
            No students enrolled in this class
          </p>
        </div>
      )}

      {/* Student Cards - Horizontal Scroll */}
      {!loading && students.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-black tracking-tight">
              Student Roster
            </h3>
            <Badge variant="secondary" className="font-bold text-[10px]">
              {students.length} enrolled
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {students.map((student) => {
              // Count how many exams this student has results for
              const completedExams = exams.filter((exam) =>
                exam.results?.some((r) => r.studentId === student.id),
              ).length;

              return (
                <Card
                  key={student.id}
                  className="rounded-2xl border-border/60 bg-card/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group cursor-pointer"
                  onClick={() => openDrawer(student)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative">
                        {student.userDetails?.avatar ? (
                          <img
                            src={student.userDetails.avatar}
                            alt={personName(student)}
                            className="h-10 w-10 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 font-black text-sm text-primary">
                            {initials(student)}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                          {personName(student)}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">
                          @{student.username}
                        </p>
                      </div>

                      {/* Result Badge */}
                      <div className="shrink-0">
                        {completedExams > 0 ? (
                          <Badge
                            variant="secondary"
                            className="text-[9px] font-black px-2"
                          >
                            {completedExams}/{exams.length}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[9px] font-bold text-muted-foreground/60 px-2"
                          >
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-3 h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDrawer(student);
                      }}
                    >
                      <ClipboardEdit className="mr-1.5 h-3.5 w-3.5" />
                      Enter Results
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* No exams warning */}
      {selectedCourseId &&
        !loading &&
        students.length > 0 &&
        exams.length === 0 && (
          <Card className="rounded-2xl border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4 text-center">
              <p className="text-sm font-bold text-amber-600">
                No exams created for this class yet. Create an exam in the Setup
                tab first.
              </p>
            </CardContent>
          </Card>
        )}

      {/* Drawer */}
      <ResultEntryDrawer
        open={drawerOpen}
        student={drawerStudent}
        exams={exams}
        onClose={handleDrawerClose}
        onSaved={handleSaved}
        onSaveAndNext={handleSaveAndNext}
        hasNext={drawerStudentIndex < students.length - 1}
      />
    </div>
  );
}
