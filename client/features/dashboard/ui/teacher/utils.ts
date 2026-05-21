import { formatCurrency as sharedFormatCurrency } from "@/lib/format-utils";
import type { AttendanceRecord, AttendanceData } from "@/services/api/client";

export function formatCurrency(amount: number) {
  return sharedFormatCurrency(amount);
}

export function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function normalizeAttendance(records: AttendanceRecord[]): AttendanceData {
  const normalizedRecords = records.map((record) => ({
    ...record,
    status: String(record.status).toLowerCase() as AttendanceRecord["status"],
  }));

  const total = normalizedRecords.length;
  const present = normalizedRecords.filter((record) => record.status === "present").length;
  const absent = normalizedRecords.filter((record) => record.status === "absent").length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  return {
    total,
    present,
    absent,
    percentage,
    records: normalizedRecords,
  };
}

export function getRequestErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null) {
    const maybeResponse = "response" in error ? (error as any).response : null;
    if (typeof maybeResponse === "object" && maybeResponse !== null && "data" in maybeResponse) {
      const data = maybeResponse.data as any;
      if (data && typeof data.message === "string") return data.message;
    }
    if ("message" in error && typeof (error as any).message === "string" && (error as any).message.trim()) return (error as any).message;
  }
  return fallback;
}
