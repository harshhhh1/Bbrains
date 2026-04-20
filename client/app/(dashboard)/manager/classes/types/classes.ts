import type { ClassTimetableEntry } from "@/services/api/client";

export type ClassFormState = {
  name: string;
  description: string;
  standard: string;
  subjectsText: string;
  feePerStudent: string;
  durationValue: string;
  durationUnit: "months" | "years";
  studentCapacity: string;
  timetable: ClassTimetableEntry[];
};
