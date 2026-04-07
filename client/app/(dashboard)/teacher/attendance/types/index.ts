import type { ApiUser } from "@/lib/types/api";

export type AttendanceStatus = "present" | "absent" | "late";

export interface StudentAttendance extends ApiUser {
    currentStatus?: AttendanceStatus;
    currentNotes?: string;
    isUpdating?: boolean;
}
