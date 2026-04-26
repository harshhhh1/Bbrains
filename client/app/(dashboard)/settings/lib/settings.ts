import type { ProfileFormState, SettingsUser } from "../types/settings";

export function readUserField(
  user: SettingsUser | null,
  key: "firstName" | "lastName" | "bio" | "phone" | "sex" | "avatar"
) {
  if (!user) return "";
  return String(user.userDetails?.[key] ?? (user as any)[key] ?? "");
}

export function getInitials(user: SettingsUser | null) {
  const username = user?.username || "U";
  return username[0].toUpperCase();
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
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
