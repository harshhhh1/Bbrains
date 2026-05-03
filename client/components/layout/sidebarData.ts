import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { sidebarItems as sidebarItemsRaw } from "@/components/layout/sidebarItems";

export type Role =
    | "student"
    | "teacher"
    | "admin"
    | "staff"
    | "manager"
    | "superadmin"
    | "bbrains_official";

export type SidebarItem = {
    title: string;
    url: string | ((role: Role) => string);
    icon: LucideIcon;
    access: Role[];
    subItems?: { title: string; url: string; icon?: LucideIcon }[];
};

export type SidebarGroup = {
    groupLabel?: string;
    items: { title: string; url: string; icon: LucideIcon; subItems?: any[] }[];
};

const ALL_ROLES: Role[] = ["student", "teacher", "admin", "staff", "manager", "superadmin", "bbrains_official"];

// Icon lookup map
const getIcon = (name: string): LucideIcon => {
    return (LucideIcons as any)[name] || LucideIcons.HelpCircle;
};

// Process dynamic URLs (Dashboard)
function getDashboardUrl(): string {
    return "/dashboard";
}

// Convert raw JSON to SidebarItem typed items
const masterSidebarItems: SidebarItem[] = (sidebarItemsRaw as any[]).map(item => ({
    ...item,
    icon: getIcon(item.icon),
    url: item.isDashboard ? getDashboardUrl : item.url,
    subItems: item.subItems?.map((sub: any) => ({
        ...sub,
        icon: sub.icon ? getIcon(sub.icon) : undefined
    }))
}));

export function resolveRole(rawRole?: string | string[] | null): Role | Role[] {
    const allowedSet = new Set(ALL_ROLES);
    if (Array.isArray(rawRole)) {
        const result = rawRole.map((r) => resolveRole(r) as Role).filter(Boolean) as Role[];
        return result.length > 0 ? result : ["student"];
    }
    const normalized = rawRole?.trim().toLowerCase().replace(/[\s-]+/g, "_");
    if (!normalized || !allowedSet.has(normalized as Role)) return "student";
    return normalized as Role;
}

export function getSidebarGroups(role: Role | Role[], sidebarAccessOverride?: Record<string, string[]> | null): SidebarGroup[] {
    const roles = Array.isArray(role) ? role : [role];
    const primaryRole = roles[0] || "student";

    // Define hardcoded admin-only paths that cannot be overridden
    const ADMIN_ONLY_PATHS = ["/users", "/admin/roles", "/admin/config", "/admin/config/sidebar-access"];

    const filteredItems = masterSidebarItems.filter(item => {
        // 1. Check if path is hardcoded admin-only
        const itemUrl = typeof item.url === "string" ? item.url : "";
        if (ADMIN_ONLY_PATHS.some(path => itemUrl === path || itemUrl.startsWith(path))) {
            return roles.includes("admin");
        }

        // 2. Check for override (URL first for uniqueness, then title for backward compatibility/generics)
        const overrideRoles = sidebarAccessOverride?.[itemUrl] || sidebarAccessOverride?.[item.title];
        if (overrideRoles) {
            return overrideRoles.some(r => roles.includes(r as Role));
        }

        // 3. Fallback to default access
        return item.access.some(r => roles.includes(r));
    });

    const processedItems = filteredItems.map(item => ({
        title: item.title,
        url: typeof item.url === "function" ? item.url(primaryRole) : item.url,
        icon: item.icon,
        subItems: item.subItems
    }));

    return [
        {
            groupLabel: "Main Menu",
            items: processedItems
        }
    ];
}
