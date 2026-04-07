import { AttendanceData, AttendanceRecord, SubjectChapterProgress } from "@/services/api/client";
import { CourseStudentEnrollment } from "../types";

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function normalizeAttendance(records: AttendanceRecord[]): AttendanceData {
  const normalizedRecords = records.map((record) => ({
    ...record,
    user: record.user || {
      id: "unknown",
      username: "unknown",
      userDetails: { firstName: "Unknown", lastName: "Student" },
    },
  }));

  const totalSessions = Math.max(1, new Set(normalizedRecords.map((r) => r.date)).size);
  const presentCount = normalizedRecords.filter((r) => r.status === "present").length;
  const totalRecords = Math.max(1, normalizedRecords.length);

  return {
    records: normalizedRecords as any,
    summary: {
      totalStudents: new Set(normalizedRecords.map((r) => r.user.id)).size,
      totalSessions,
      averageAttendance: (presentCount / totalRecords) * 100,
    },
  };
}

export function searchStudents(
  students: CourseStudentEnrollment[],
  search: string
): CourseStudentEnrollment[] {
  if (!search) return students;
  const q = search.toLowerCase();
  return students.filter(
    (s) =>
      s.user.username.toLowerCase().includes(q) ||
      s.user.userDetails?.firstName?.toLowerCase().includes(q) ||
      s.user.userDetails?.lastName?.toLowerCase().includes(q)
  );
}
