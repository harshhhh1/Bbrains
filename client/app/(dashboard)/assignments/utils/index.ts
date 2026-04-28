import { Assignment } from "@/services/api/client";
import { getFileUrlBase } from "@/lib/file-url";
import { StudentAssignmentStatus } from "../types";

export function fmtDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function isImageFile(filename: string) {
  const base = getFileUrlBase(filename);
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  return imageExtensions.some((extension) => base.endsWith(extension));
}

export function getImageMimeType(filename: string) {
  const base = getFileUrlBase(filename);
  if (base.endsWith(".png")) return "image/png";
  if (base.endsWith(".gif")) return "image/gif";
  if (base.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

export function getAssignmentStatus(assignment: Assignment): StudentAssignmentStatus {
  const reviewStatus = assignment.submission?.reviewStatus;

  if (reviewStatus === "completed") return "completed";
  if (reviewStatus === "incomplete") return "incomplete";
  if (assignment.submission) return "submitted";

  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
  if (dueDate) {
    dueDate.setHours(23, 59, 59, 999);
    if (dueDate < new Date()) return "overdue";
  }

  return "pending";
}

export function getStatusLabel(status: StudentAssignmentStatus) {
  switch (status) {
    case "completed":
      return "Completed";
    case "submitted":
      return "Awaiting Review";
    case "incomplete":
      return "Needs Resubmission";
    case "overdue":
      return "Overdue";
    default:
      return "Pending";
  }
}

export function getStatusBadgeVariant(status: StudentAssignmentStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "default";
    case "submitted":
      return "outline";
    case "overdue":
      return "destructive";
    default:
      return "secondary";
  }
}

export function canSubmitAssignment(assignment: Assignment) {
  return !assignment.submission || assignment.submission.reviewStatus === "rework";
}
