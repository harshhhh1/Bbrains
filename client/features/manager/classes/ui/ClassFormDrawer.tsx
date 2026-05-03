"use client";

import type { Dispatch, SetStateAction } from "react";
import { CalendarDays, Loader2, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TimetableEditorDialog } from "@/features/manager/classes/ui/TimetableEditorDialog";
import type { Course } from "@/services/api/client";
import type { ClassFormState } from "@/features/manager/classes/types/classes";
import { standardOptions } from "@/features/manager/classes/model/classes";

type ClassFormDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timetableDialogOpen: boolean;
  onTimetableDialogOpenChange: (open: boolean) => void;
  editingClassId: Course["id"] | null;
  submitting: boolean;
  form: ClassFormState;
  subjectSuggestions: string[];
  timetableSummary: {
    totalSlots: number;
    activeDays: number;
  };
  setForm: Dispatch<SetStateAction<ClassFormState>>;
  onSubmit: () => Promise<void>;
  onTimetableSave: (entries: ClassFormState["timetable"]) => void;
  addSemester: () => void;
  removeSemester: (id: string) => void;
  addSubjectToSemester: (id: string) => void;
  removeSubjectFromSemester: (semId: string, subId: string) => void;
  updateSubjectInSemester: (semId: string, subId: string, field: string, value: string | number) => void;
};


export function ClassFormDrawer({
  open,
  onOpenChange,
  timetableDialogOpen,
  onTimetableDialogOpenChange,
  editingClassId,
  submitting,
  form,
  subjectSuggestions,
  timetableSummary,
  setForm,
  onSubmit,
  onTimetableSave,
  addSemester,
  removeSemester,
  addSubjectToSemester,
  removeSubjectFromSemester,
  updateSubjectInSemester,
}: ClassFormDrawerProps) {

  return (
    <>
      <Drawer
        direction="right"
        open={open}
        onOpenChange={(nextOpen) => {
          onOpenChange(nextOpen);
          if (!nextOpen) {
            onTimetableDialogOpenChange(false);
          }
        }}
      >
        <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-4xl before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
          <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
            <DrawerHeader className="border-b border-border/60 p-6 text-left">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <DrawerTitle>{editingClassId ? "Edit class" : "Create class"}</DrawerTitle>
                  <DrawerDescription>
                    Define the standard, subject list, fee model, duration, class size, and a timetable for this class.
                  </DrawerDescription>
                </div>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>

            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="class-name">Class Name</Label>
                  <Input
                    id="class-name"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Class A / BSc Computer Science"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class-standard">Standard / Course</Label>
                  <Input
                    id="class-standard"
                    list="class-standard-options"
                    value={form.standard}
                    onChange={(event) => setForm((current) => ({ ...current, standard: event.target.value }))}
                    placeholder="8th Standard / FY BCom / BSc 1st Year"
                  />
                  <datalist id="class-standard-options">
                    {standardOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="class-description">Description</Label>
                <Textarea
                  id="class-description"
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Short description for the class"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="class-fee">Fee Per Student</Label>
                  <Input
                    id="class-fee"
                    type="number"
                    min="0"
                    value={form.feePerStudent}
                    onChange={(event) => setForm((current) => ({ ...current, feePerStudent: event.target.value }))}
                    placeholder="2500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class-duration-value">Duration</Label>
                  <Input
                    id="class-duration-value"
                    type="number"
                    min="1"
                    value={form.durationValue}
                    onChange={(event) => setForm((current) => ({ ...current, durationValue: event.target.value }))}
                    placeholder="12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class-duration-unit">Duration Unit</Label>
                  <select
                    id="class-duration-unit"
                    value={form.durationUnit}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        durationUnit: event.target.value as "months" | "years",
                      }))
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class-capacity">Student Capacity</Label>
                  <Input
                    id="class-capacity"
                    type="number"
                    min="1"
                    value={form.studentCapacity}
                    onChange={(event) => setForm((current) => ({ ...current, studentCapacity: event.target.value }))}
                    placeholder="40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="class-subjects">Simple Subjects (Optional)</Label>
                <Textarea
                  id="class-subjects"
                  value={form.subjectsText}
                  onChange={(event) => setForm((current) => ({ ...current, subjectsText: event.target.value }))}
                  placeholder={`Add one subject per line\nMathematics\nScience\nEnglish`}
                />
                <p className="text-xs text-muted-foreground italic">Note: For detailed exams and results, use the Semester section below.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <div className="space-y-0.5">
                        <Label className="text-base font-semibold">Semesters & Curriculum</Label>
                        <p className="text-xs text-muted-foreground text-balance">Define structured semesters with specific subject codes and total marks.</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addSemester}>
                        <Plus className="mr-1 h-4 w-4" /> Add Semester
                    </Button>
                </div>

                <div className="grid gap-6">
                    {form.semesters.map((semester) => (
                        <div key={semester.id} className="relative space-y-4 rounded-2xl border border-border/60 bg-muted/5 p-5 transition-colors hover:bg-muted/10">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-primary/80">Semester {semester.semesterNumber}</h4>
                                <div className="flex gap-2">
                                    <Button type="button" variant="ghost" size="sm" onClick={() => addSubjectToSemester(semester.id)} className="h-8 text-xs">
                                        <Plus className="mr-1 h-3 w-3" /> Add Subject
                                    </Button>
                                    {form.semesters.length > 1 && (
                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeSemester(semester.id)} className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive">
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {semester.subjects.map((subject) => (
                                    <div key={subject.id} className="grid grid-cols-12 gap-3 items-center">
                                        <div className="col-span-5 space-y-1">
                                            <Input 
                                                placeholder="Subject Name" 
                                                value={subject.name}
                                                onChange={(e) => updateSubjectInSemester(semester.id, subject.id, "name", e.target.value)}
                                                className="h-9 text-sm"
                                            />
                                        </div>
                                        <div className="col-span-3 space-y-1">
                                            <Input 
                                                placeholder="Code" 
                                                value={subject.code}
                                                onChange={(e) => updateSubjectInSemester(semester.id, subject.id, "code", e.target.value)}
                                                className="h-9 text-sm uppercase"
                                            />
                                        </div>
                                        <div className="col-span-3 space-y-1">
                                            <Input 
                                                type="number"
                                                placeholder="Marks" 
                                                value={subject.examTotalMarks}
                                                onChange={(e) => updateSubjectInSemester(semester.id, subject.id, "examTotalMarks", Number(e.target.value))}
                                                className="h-9 text-sm"
                                            />
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            {semester.subjects.length > 1 && (
                                                <Button 
                                                    type="button" 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => removeSubjectFromSemester(semester.id, subject.id)}
                                                    className="size-8 text-muted-foreground hover:text-destructive"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
              </div>


              <div className="space-y-3">
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <Label>Timetable</Label>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Open the timetable popup to plan daily lectures, edit them later, and assign them to this class.
                      </p>
                    </div>
                    <Button type="button" variant="outline" onClick={() => onTimetableDialogOpenChange(true)}>
                      <CalendarDays className="mr-2 size-4" />
                      {form.timetable.length ? "Edit Timetable" : "Create Timetable"}
                    </Button>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-border/60 bg-background p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Lecture Slots</p>
                      <p className="mt-2 text-lg font-semibold text-foreground">{timetableSummary.totalSlots}</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Active Days</p>
                      <p className="mt-2 text-lg font-semibold text-foreground">{timetableSummary.activeDays}</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Subject Suggestions
                      </p>
                      <p className="mt-2 text-lg font-semibold text-foreground">{subjectSuggestions.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DrawerFooter className="border-t border-border/60 p-6 sm:flex-row sm:justify-end">
              <DrawerClose asChild>
                <Button variant="outline" disabled={submitting}>
                  Cancel
                </Button>
              </DrawerClose>
              <Button onClick={() => void onSubmit()} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving...
                  </>
                ) : editingClassId ? (
                  "Save Changes"
                ) : (
                  "Create Class"
                )}
              </Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      <TimetableEditorDialog
        key={`${timetableDialogOpen ? "open" : "closed"}:${editingClassId ?? "new"}:${form.timetable.length}:${subjectSuggestions.join("|")}`}
        open={timetableDialogOpen}
        onOpenChange={onTimetableDialogOpenChange}
        initialEntries={form.timetable}
        subjectSuggestions={subjectSuggestions}
        onSave={onTimetableSave}
        saving={submitting}
      />
    </>
  );
}
