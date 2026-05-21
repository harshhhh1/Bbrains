import { getInitials as sharedGetInitials, formatCurrency as sharedFormatCurrency } from "@/lib/format-utils";
import type { ProfileFormState, SettingsUser } from "@/features/settings/types/settings";

export function readUserField(
  user: SettingsUser | null,
  key: "firstName" | "lastName" | "displayName" | "bio" | "phone" | "sex" | "avatar"
) {
  if (!user) return "";
  return String(user.userDetails?.[key] ?? (user as any)[key] ?? "");
}

export function getInitials(user: SettingsUser | null) {
  return sharedGetInitials(user?.username);
}

export function formatCurrency(amount: number) {
  return sharedFormatCurrency(amount);
}

export function getRoleLabel(type?: string) {
  if (!type) return "Member";
  return type[0].toUpperCase() + type.slice(1);
}

export function getGradeLabel(user: SettingsUser | null) {
  return user?.classTeacherCourse?.standard || user?.enrollments?.[0]?.course?.standard || "Not assigned";
}

export function profileCompletion(form: ProfileFormState) {
  const values = [form.username, form.firstName, form.lastName, form.bio, form.phone, form.avatar];
  const complete = values.filter((value) => value.trim().length > 0).length;
  return Math.round((complete / values.length) * 100);
}
