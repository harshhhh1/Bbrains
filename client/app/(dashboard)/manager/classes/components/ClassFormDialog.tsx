"use client";

import React from "react";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TimetableEditorDialog } from "../_components/TimetableEditorDialog";
import { ClassFormState, standardOptions } from "../types";
import { summarizeTimetable } from "../utils";

interface ClassFormDialogProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  timetableDialogOpen: boolean;
  setTimetableDialogOpen: (open: boolean) => void;
  form: ClassFormState;
  setForm: React.Dispatch<React.SetStateAction<ClassFormState>>;
  editingClassId: number | string | null;
  handleSave: () => void;
  submitting: boolean;
  handleTimetableSave: (newTimetable: any[]) => void;
}

export function ClassFormDialog({
  dialogOpen,
  setDialogOpen,
  timetableDialogOpen,
  setTimetableDialogOpen,
  form,
  setForm,
  editingClassId,
  handleSave,
  submitting,
  handleTimetableSave,
}: ClassFormDialogProps) {
  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          setTimetableDialogOpen(false);
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{editingClassId ? "Edit class" : "Create class"}</DialogTitle>
          <DialogDescription>
            Define the standard, subject list, fee model, duration, class size, and a timetable for this class.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
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
              placeholder="Optional description"
              rows={2}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="class-subjects">Subjects (one per line or comma-separated)</Label>
              <Textarea
                id="class-subjects"
                value={form.subjectsText}
                onChange={(event) => setForm((current) => ({ ...current, subjectsText: event.target.value }))}
                placeholder="Math\nScience\nEnglish"
                rows={4}
              />
            </div>
            <div className="space-y-4 rounded-xl border p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Timetable</h4>
                  <p className="text-sm text-muted-foreground">
                    {form.timetable.length === 0
                      ? "No classes scheduled yet"
                      : `${summarizeTimetable(form.timetable).totalSlots} class slots across ${summarizeTimetable(form.timetable).activeDays} days`}
                  </p>
                </div>
                <TimetableEditorDialog
                  open={timetableDialogOpen}
                  onOpenChange={setTimetableDialogOpen}
                  timetable={form.timetable}
                  onSave={handleTimetableSave}
                  trigger={
                    <Button variant="outline" size="sm">
                      <BookOpen className="mr-2 h-4 w-4" />
                      {form.timetable.length > 0 ? "Edit Timetable" : "Add Timetable"}
                    </Button>
                  }
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="class-fee">Fee per student (INR)</Label>
              <Input
                id="class-fee"
                type="number"
                min="0"
                step="100"
                value={form.feePerStudent}
                onChange={(event) => setForm((current) => ({ ...current, feePerStudent: event.target.value }))}
                placeholder="Optional fee structure"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class-capacity">Student Capacity</Label>
              <Input
                id="class-capacity"
                type="number"
                min="1"
                value={form.studentCapacity}
                onChange={(event) => setForm((current) => ({ ...current, studentCapacity: event.target.value }))}
                placeholder="Optional max limit"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="class-duration">Duration Length</Label>
              <Input
                id="class-duration"
                type="number"
                min="1"
                value={form.durationValue}
                onChange={(event) => setForm((current) => ({ ...current, durationValue: event.target.value }))}
                placeholder="Optional course duration"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class-duration-unit">Unit</Label>
              <select
                id="class-duration-unit"
                value={form.durationUnit}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    durationUnit: event.target.value as "months" | "years",
                  }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={submitting}>
            {submitting ? "Saving..." : editingClassId ? "Update class" : "Create class"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
