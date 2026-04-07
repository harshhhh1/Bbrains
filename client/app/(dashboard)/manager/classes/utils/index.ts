import { ClassTimetableEntry, Course } from "@/services/api/client";

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
