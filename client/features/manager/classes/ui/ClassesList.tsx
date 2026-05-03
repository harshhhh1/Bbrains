"use client";

import { BookOpen, CalendarDays, IndianRupee, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Course } from "@/services/api/client";
import { formatCurrency } from "@/features/manager/classes/model/classes";

type ClassesListProps = {
  loading: boolean;
  search: string;
  selectedClassId: Course["id"] | null;
  filteredClasses: Course[];
  onSearchChange: (value: string) => void;
  onSelectClass: (courseId: Course["id"]) => void;
  onEditDetails: (course: Course) => void;
  onEditTimetable: (course: Course) => void;
  onDelete: (courseId: Course["id"]) => void;
};

export function ClassesList({
  loading,
  search,
  selectedClassId,
  filteredClasses,
  onSearchChange,
  onSelectClass,
  onEditDetails,
  onEditTimetable,
  onDelete,
}: ClassesListProps) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Classes</CardTitle>
            <CardDescription>
              Every class can carry its own standard, subjects, fee model, duration, and timetable.
            </CardDescription>
          </div>
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search classes, standards, or subjects"
            className="md:max-w-xs"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading classes...
          </div>
        ) : filteredClasses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No classes found yet.</p>
        ) : (
          filteredClasses.map((course) => {
            const enrolled = course._count?.enrollments ?? course.enrolledStudents ?? 0;

            return (
              <div
                key={course.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectClass(course.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectClass(course.id);
                  }
                }}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selectedClassId === course.id
                    ? "border-primary bg-primary/5"
                    : "border-border/70 bg-card hover:border-primary/40"
                }`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-foreground">{course.name}</p>
                      <Badge variant="outline">{course.standard || "Standard not set"}</Badge>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          navigator.clipboard.writeText(String(course.id));
                          toast.success("Class ID copied to clipboard");
                        }}
                        className="group flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-0.5 text-[10px] font-mono text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Click to copy Class ID"
                      >
                        ID: {course.id}
                      </button>
                    </div>
                    {course.description ? <p className="text-sm text-muted-foreground">{course.description}</p> : null}
                    <div className="flex flex-wrap gap-2">
                      {(course.subjects || []).map((subject) => (
                        <Badge key={`${course.id}-${subject}`} variant="secondary">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-xl bg-muted/40 p-3">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      <IndianRupee className="size-3.5" />
                      Fee / Student
                    </div>
                    <p className="mt-2 text-lg font-semibold text-foreground">{formatCurrency(course.feePerStudent)}</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      <CalendarDays className="size-3.5" />
                      Duration
                    </div>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {course.durationValue} {course.durationUnit}
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      <Users className="size-3.5" />
                      Students
                    </div>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {enrolled} / {course.studentCapacity || 0}
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      <BookOpen className="size-3.5" />
                      Slots
                    </div>
                    <p className="mt-2 text-lg font-semibold text-foreground">{course.timetable?.length || 0}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/40 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEditDetails(course);
                    }}
                  >
                    Edit Details
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEditTimetable(course);
                    }}
                  >
                    Timetable
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="px-4"
                    onClick={(event) => {
                      event.stopPropagation();
                      void onDelete(course.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
