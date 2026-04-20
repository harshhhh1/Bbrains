import type { ClassTimetableEntry, Course } from "@/services/api/client";
import type { ClassFormState } from "../types/classes";

export const standardOptions = [
  "1st Standard",
  "2nd Standard",
  "3rd Standard",
  "4th Standard",
  "5th Standard",
  "6th Standard",
  "7th Standard",
  "8th Standard",
  "9th Standard",
  "10th Standard",
  "11th Standard",
  "12th Standard",
  "FY BSc",
  "SY BSc",
  "TY BSc",
  "FY BCom",
  "SY BCom",
  "TY BCom",
  "FY BA",
  "SY BA",
  "TY BA",
  "FY BCA",
  "SY BCA",
  "TY BCA",
];

export const emptyForm: ClassFormState = {
  name: "",
  description: "",
  standard: "",
  subjectsText: "",
  feePerStudent: "",
  durationValue: "",
  durationUnit: "months",
  studentCapacity: "",
  timetable: [],
};

export function parseSubjects(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatCurrency(value?: number | string) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function toWeeklySchedule(course: Course | null) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const timetable = course?.timetable || [];

  return days.map((day) => ({
    day,
    classes: timetable
      .filter((entry) => entry.day === day)
      .map((entry) => ({
        time: `${entry.startTime} - ${entry.endTime}`,
        subject: entry.subject,
        room: entry.room || "Room TBA",
      })),
  }));
}

export function summarizeTimetable(timetable: ClassTimetableEntry[]) {
  const activeDays = new Set(timetable.map((entry) => entry.day)).size;
  return {
    totalSlots: timetable.length,
    activeDays,
  };
}
