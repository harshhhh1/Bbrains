import { Loader2, Plus, X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Course } from "../../../types";
import { useCourseForm } from "../hooks/useCourseForm";
import { EmptySubjectState, SubjectEntryRow } from "./SubjectEntryRow";

interface CourseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (course: Course) => void;
}

export function CourseFormModal({ open, onOpenChange, onSuccess }: CourseFormModalProps) {
  const {
    submitting,
    loadingTeachers,
    teachers,
    name,
    setName,
    description,
    setDescription,
    standard,
    setStandard,
    subjects,
    addSubject,
    removeSubject,
    updateSubject,
    handleSubmit,
  } = useCourseForm({ open, onOpenChange, onSuccess });

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-2xl before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
        <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
          <DrawerHeader className="border-b border-border/60 p-6 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <DrawerTitle>Create Course</DrawerTitle>
                <DrawerDescription>
                  Define the course details and assign subjects to specific teachers.
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="courseName">Course Name</Label>
                  <Input
                    id="courseName"
                    placeholder="e.g. Science Class 10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="standard">Standard</Label>
                  <Input
                    id="standard"
                    placeholder="e.g. 10th Standard"
                    value={standard}
                    onChange={(e) => setStandard(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Short clear description of the course..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-none"
                  rows={2}
                />
              </div>

              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Subjects & Teachers</Label>
                    <p className="text-xs text-muted-foreground mt-1">Assign teachers to their respective subjects.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addSubject}>
                    <Plus className="w-4 h-4 mr-1" /> Add Subject
                  </Button>
                </div>

                {subjects.length === 0 ? (
                  <EmptySubjectState onAdd={addSubject} />
                ) : (
                  <div className="space-y-2">
                    {subjects.map((subject) => (
                      <SubjectEntryRow
                        key={subject.id}
                        subject={subject}
                        teachers={teachers}
                        loadingTeachers={loadingTeachers}
                        onUpdate={updateSubject}
                        onRemove={removeSubject}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DrawerFooter className="border-t border-border/60 p-6 sm:flex-row sm:justify-end">
            <DrawerClose asChild>
              <Button variant="outline" disabled={submitting}>
                Cancel
              </Button>
            </DrawerClose>
            <Button onClick={() => void handleSubmit()} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Course"
              )}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
