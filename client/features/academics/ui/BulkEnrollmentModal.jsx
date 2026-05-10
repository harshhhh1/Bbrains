"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Search, UserCheck, X } from "lucide-react";
import { api, userApi, academicApi } from "@/services/api/client";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";

export function BulkEnrollmentModal({ open, onOpenChange, course, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState([]);
  const [alreadyEnrolledIds, setAlreadyEnrolledIds] = useState(new Set());
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open && course) {
      fetchData();
    } else {
      setSelectedIds(new Set());
      setSearch("");
    }
  }, [open, course]);

  const fetchData = async () => {
    if (!course) return;
    try {
      setLoading(true);
      const [allStudentsRes, enrolledStudentsRes] = await Promise.all([
        userApi.getStudents(),
        academicApi.getCourseStudents(course.id),
      ]);

      if (allStudentsRes.success) {
        setStudents(allStudentsRes.data || []);
      }
      if (enrolledStudentsRes.success) {
        const enrolledIds = new Set(
          (enrolledStudentsRes.data || []).map((s) => s.id),
        );
        setAlreadyEnrolledIds(enrolledIds);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
      toast.error("Failed to load student list");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const fullName =
        `${s.userDetails?.firstName || ""} ${s.userDetails?.lastName || ""}`.toLowerCase();
      const query = search.toLowerCase();
      return (
        fullName.includes(query) ||
        s.username.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query)
      );
    });
  }, [students, search]);

  const toggleStudent = (id) => {
    if (alreadyEnrolledIds.has(id)) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    const currentlyVisibleUnenrolled = filteredStudents.filter(
      (s) => !alreadyEnrolledIds.has(s.id),
    );
    const allVisibleAlreadySelected = currentlyVisibleUnenrolled.every((s) =>
      selectedIds.has(s.id),
    );

    const next = new Set(selectedIds);
    if (allVisibleAlreadySelected) {
      currentlyVisibleUnenrolled.forEach((s) => next.delete(s.id));
    } else {
      currentlyVisibleUnenrolled.forEach((s) => next.add(s.id));
    }
    setSelectedIds(next);
  };

  const handleEnroll = async () => {
    if (!course || selectedIds.size === 0) return;

    try {
      setSubmitting(true);
      const res = await academicApi.enrollBulk(
        course.id,
        Array.from(selectedIds),
      );
      if (res.success) {
        toast.success(
          res.message || `Enrolled ${selectedIds.size} students successfully`,
        );
        setSelectedIds(new Set());
        fetchData();
        onSuccess?.();
      } else {
        toast.error(res.message || "Failed to enroll students");
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error("An error occurred during enrollment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnenroll = async (userId) => {
    if (!course) return;
    try {
      const res = await api.delete(`/enrollments/${userId}/${course.id}`);
      if (res.success) {
        toast.success("Student unenrolled successfully");
        fetchData();
        onSuccess?.();
      } else {
        toast.error(res.message || "Failed to unenroll student");
      }
    } catch (error) {
      console.error("Unenrollment error:", error);
      toast.error("An error occurred during unenrollment");
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
        <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
          <DrawerHeader className="border-b border-border/60 p-6 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <DrawerTitle>Enroll Students</DrawerTitle>
                <DrawerDescription>
                  Bulk enroll students to{" "}
                  <span className="font-semibold text-foreground">
                    {course?.name}
                  </span>
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-hidden flex flex-col p-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name, username or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {selectedIds.size} Selected
              </p>
              <Button
                variant="link"
                size="sm"
                onClick={handleSelectAll}
                className="h-auto p-0 text-xs"
              >
                {filteredStudents
                  .filter((s) => !alreadyEnrolledIds.has(s.id))
                  .every((s) => selectedIds.has(s.id))
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto border rounded-xl divide-y">
              {loading ? (
                <div className="h-40 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground text-sm italic">
                  No students found
                </div>
              ) : (
                filteredStudents.map((student) => {
                  const isEnrolled = alreadyEnrolledIds.has(student.id);
                  const isSelected = selectedIds.has(student.id);
                  return (
                    <div
                      key={student.id}
                      className={`flex items-center gap-3 p-3 transition-colors ${isEnrolled ? "opacity-60 bg-muted/30 cursor-not-allowed" : "hover:bg-muted/50 cursor-pointer"}`}
                      onClick={() => !isEnrolled && toggleStudent(student.id)}
                    >
                      <Checkbox
                        checked={isEnrolled || isSelected}
                        disabled={isEnrolled}
                        onCheckedChange={() =>
                          !isEnrolled && toggleStudent(student.id)
                        }
                      />

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {student.userDetails?.firstName}{" "}
                          {student.userDetails?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          @{student.username} • {student.email}
                        </p>
                      </div>
                      {isEnrolled ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnenroll(student.id);
                          }}
                          className="h-7 text-[10px] text-destructive hover:bg-destructive/10 px-2"
                        >
                          Unenroll
                        </Button>
                      ) : (
                        isSelected && (
                          <Badge className="text-[10px] h-5 bg-primary/20 text-primary hover:bg-primary/20 border-none">
                            Selected
                          </Badge>
                        )
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <DrawerFooter className="border-t border-border/60 p-6 flex-row justify-end gap-3">
            <DrawerClose asChild>
              <Button variant="outline" disabled={submitting}>
                Cancel
              </Button>
            </DrawerClose>
            <Button
              disabled={submitting || selectedIds.size === 0}
              onClick={handleEnroll}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enrolling...
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Enroll {selectedIds.size} Students
                </>
              )}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
