"use client";

import React from "react";
import { Plus, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Course } from "@/services/api/client";

interface ClassSidebarProps {
  search: string;
  setSearch: (value: string) => void;
  filteredClasses: Course[];
  selectedClassId: string | number | null;
  setSelectedClassId: (id: string | number) => void;
  handleCreate: () => void;
  selectedClass: Course | null;
}

export function ClassSidebar({
  search,
  setSearch,
  filteredClasses,
  selectedClassId,
  setSelectedClassId,
  handleCreate,
  selectedClass,
}: ClassSidebarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search classes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-card"
        />
        <Button onClick={handleCreate} className="shrink-0" title="Add Class">
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {filteredClasses.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">
            No classes found matching "{search}"
          </p>
        ) : (
          filteredClasses.map((course) => {
            const enrolled = course._count?.enrollments ?? course.enrolledStudents ?? 0;
            return (
              <div
                key={course.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedClassId(course.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedClassId(course.id);
                  }
                }}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selectedClass?.id === course.id
                    ? "border-primary bg-primary/5"
                    : "border-border/70 bg-card hover:border-primary/40"
                }`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-foreground">{course.name}</p>
                      <Badge variant="outline">{course.standard || "Standard not set"}</Badge>
                    </div>
                    {course.description ? (
                      <p className="text-sm text-muted-foreground">{course.description}</p>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      {course.subjects?.slice(0, 3).map((sub, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {sub}
                        </Badge>
                      ))}
                      {(course.subjects?.length || 0) > 3 ? (
                        <Badge variant="secondary" className="text-xs">
                          +{(course.subjects?.length || 0) - 3} more
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col items-center md:items-end gap-2 mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-border/50 w-full md:w-auto justify-between md:justify-end shrink-0">
                    <div className="flex items-center gap-2 md:gap-1 text-xs uppercase tracking-[0.14em] text-muted-foreground md:mb-1">
                      <Users className="size-3.5" />
                      <span className="md:hidden">Students</span>
                    </div>
                    <p className="text-sm font-bold text-foreground bg-muted/50 px-2 py-1 rounded-md">
                      {enrolled} {course.studentCapacity ? `/ ${course.studentCapacity}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
