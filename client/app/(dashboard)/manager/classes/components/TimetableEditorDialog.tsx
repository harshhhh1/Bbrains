"use client";

import { useMemo, useState } from "react";
import { Coffee, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { ClassTimetableEntry } from "@/services/api/client";

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const createEmptyEntry = (day = "Monday", subject = ""): ClassTimetableEntry => ({
  day,
  subject,
  startTime: "09:00",
  endTime: "10:00",
  room: "",
});

type TimetableEditorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEntries: ClassTimetableEntry[];
  subjectSuggestions: string[];
  onSave: (entries: ClassTimetableEntry[]) => void;
  saving?: boolean;
};

export function TimetableEditorDialog({
  open,
  onOpenChange,
  initialEntries,
  subjectSuggestions,
  onSave,
  saving = false,
}: TimetableEditorDialogProps) {
  const [draftEntries, setDraftEntries] = useState<ClassTimetableEntry[]>(
    () => (initialEntries.length ? initialEntries : [createEmptyEntry()])
  );

  const entriesByDay = useMemo(
    () =>
      weekDays.map((day) => ({
        day,
        entries: draftEntries
          .map((entry, index) => ({ entry, index }))
          .filter(({ entry }) => entry.day === day),
      })),
    [draftEntries]
  );

  function updateEntry(index: number, key: keyof ClassTimetableEntry, value: string) {
    setDraftEntries((current) =>
      current.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [key]: value } : entry
      )
    );
  }

  function addEntry(day: string) {
    setDraftEntries((current) => [...current, createEmptyEntry(day)]);
  }

  function addBreak(day: string) {
    setDraftEntries((current) => [...current, createEmptyEntry(day, "Break")]);
  }

  function removeEntry(index: number) {
    setDraftEntries((current) =>
      current.length === 1 ? current : current.filter((_, entryIndex) => entryIndex !== index)
    );
  }

  function handleSave() {
    const trimmedEntries = draftEntries.map((entry) => ({
      ...entry,
      subject: entry.subject.trim(),
      room: entry.room?.trim() || "",
    }));

    const incompleteEntry = trimmedEntries.find(
      (entry) => !entry.day || !entry.subject || !entry.startTime || !entry.endTime
    );

    if (incompleteEntry) {
      toast.error("Complete each lecture row before saving the timetable");
      return;
    }

    const invalidTiming = trimmedEntries.find((entry) => entry.endTime <= entry.startTime);
    if (invalidTiming) {
      toast.error("Each lecture must end after it starts");
      return;
    }

    onSave(trimmedEntries);
    onOpenChange(false);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-5xl before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem] z-[110]">
        <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
          <DrawerHeader className="border-b border-border/60 p-6 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <DrawerTitle>Class Timetable</DrawerTitle>
                <DrawerDescription>
                  Build the daily lecture plan for this class. Subject suggestions come from the class subjects.
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
            {subjectSuggestions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                Add subjects in the class form first if you want quick subject suggestions in the timetable.
              </div>
            ) : null}

            <datalist id="manager-class-subject-suggestions">
              {subjectSuggestions.map((subject) => (
                <option key={subject} value={subject} />
              ))}
            </datalist>

            <div className="grid gap-6">
              {entriesByDay.map(({ day, entries }) => (
                <Card key={day} className="border-border/60 shadow-none bg-muted/5">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                      <CardTitle className="text-base">{day}</CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Schedule for {day}.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => addBreak(day)} className="border-orange-200 bg-orange-50/30 text-orange-700 hover:bg-orange-50">
                        <Coffee className="mr-1 size-3.5" />
                        Break
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => addEntry(day)}>
                        <Plus className="mr-1 size-3.5" />
                        Lecture
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {entries.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No lectures scheduled.</p>
                    ) : (
                      entries.map(({ entry, index }) => (
                        <div
                          key={`${day}-${index}`}
                          className={`grid gap-3 rounded-xl border p-3 md:grid-cols-[1.5fr_1fr_1fr_1.2fr_auto] ${entry.subject.toLowerCase() === "break" ? "bg-orange-50/20 border-orange-100" : "bg-background border-border/60 shadow-sm"}`}
                        >
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Subject</Label>
                            <Input
                              list="manager-class-subject-suggestions"
                              value={entry.subject}
                              onChange={(event) => updateEntry(index, "subject", event.target.value)}
                              placeholder="Mathematics"
                              className={entry.subject.toLowerCase() === "break" ? "border-orange-200" : ""}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Start</Label>
                            <Input
                              type="time"
                              value={entry.startTime}
                              onChange={(event) => updateEntry(index, "startTime", event.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">End</Label>
                            <Input
                              type="time"
                              value={entry.endTime}
                              onChange={(event) => updateEntry(index, "endTime", event.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Room</Label>
                            <Input
                              value={entry.room || ""}
                              onChange={(event) => updateEntry(index, "room", event.target.value)}
                              placeholder="Room / Lab"
                              disabled={entry.subject.toLowerCase() === "break"}
                            />
                          </div>
                          <div className="flex items-end pb-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeEntry(index)}
                              disabled={draftEntries.length === 1}
                              className={entry.subject.toLowerCase() === "break" ? "text-orange-600 hover:bg-orange-100" : "text-muted-foreground hover:text-destructive"}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <DrawerFooter className="border-t border-border/60 p-6 sm:flex-row sm:justify-end">
            <DrawerClose asChild>
              <Button type="button" variant="outline" disabled={saving}>
                Cancel
              </Button>
            </DrawerClose>
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Assign Timetable"
              )}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
