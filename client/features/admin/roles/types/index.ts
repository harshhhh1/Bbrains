export type Role = {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  isDefault: boolean;
  isSystem: boolean;
  position: number;
  permissions: { permission: { key: string; label: string; description: string; category: string }; enabled: boolean }[];
  _count?: { users: number };
};

export type Permission = {
  id: number;
  key: string;
  label: string;
  description: string | null;
  category: string;
};

export type UserWithRoles = {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  roles: string[];
  grade?: string;
};

export function getRoleBadgeColor(role: string): string {
  const roleColors: Record<string, string> = {
    super_admin: "bg-purple-100 text-purple-800 border-purple-200",
    admin: "bg-red-100 text-red-800 border-red-200",
    manager: "bg-orange-100 text-orange-800 border-orange-200",
    editor: "bg-blue-100 text-blue-800 border-blue-200",
    viewer: "bg-gray-100 text-gray-800 border-gray-200",
  }
  const normalizedRole = role.toLowerCase().replace(/\s+/g, "_")
  return roleColors[normalizedRole] || "bg-gray-100 text-gray-800 border-gray-200"
}

export const allPermissions = [
  "upload_materials",
  "assign_roles",
  "view_grades",
  "edit_grades",
  "view_reports",
  "export_reports",
  "manage_roles",
  "view_audit_logs",
  "administrator",
  "create_product",
  "manage_product",
  "manage_user",
  "manage_course",
  "manage_institution",
  "create_event",
  "manage_event",
  "manage_announcement",
  "manage_suggestions",
  "manage_finance"
] as const;

export type AllPermissionsType = typeof allPermissions[number];
