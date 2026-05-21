"use client"
import React, { useState } from 'react'
import {
    Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
    SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
    SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar"
import { Settings, BarChart3 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getSidebarGroups, resolveRole } from "@/components/layout/sidebarData"
import type { Role } from "@/components/layout/sidebarData"
import { useNotifications } from "@/components/providers/notification-provider"
import { usePermissionsContext } from "@/components/providers/permissions-provider"
import dynamic from "next/dynamic"

const UserProfileCard = dynamic(() => import("@/components/user-profile-card").then(mod => mod.UserProfileCard), {
    ssr: true
})

interface AppSidebarProps {
    user?: {
        id: string;
        email?: string;
        imageUrl?: string;
        firstName?: string;
        lastName?: string;
        fullName?: string;
        username?: string;
        type?: string;
        appRole?: string;
        roles?: string[];
        bio?: string;
        level?: number;
        xp?: number;
        createdAt?: string;
    } | null;
    sidebarAccessOverride?: Record<string, string[]> | null;
}

export function AppSidebar({ user, sidebarAccessOverride }: AppSidebarProps) {
    const pathname = usePathname()
    const { state } = useSidebar()
    const [mounted, setMounted] = useState(false)
    const isCollapsed = state === "collapsed"
    const { chatUnreadTotal, assignmentUnreadTotal, productUnreadTotal } = useNotifications()
    const { hasPermission } = usePermissionsContext()

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const [showProfileCard, setShowProfileCard] = useState(false)

    const userRoles = user?.roles || [user?.type || "student"]
    const resolvedRoles = React.useMemo(() => resolveRole(userRoles) as Role[], [userRoles])
    const groups = React.useMemo(() => getSidebarGroups(resolvedRoles, sidebarAccessOverride, hasPermission), [resolvedRoles, sidebarAccessOverride, hasPermission])

    if (!mounted) {
        return (
            <Sidebar collapsible="icon" className="border-none">
                <SidebarHeader className="bg-sidebar pt-4">
                    <div className="h-2" />
                </SidebarHeader>
                <SidebarContent className="bg-sidebar px-3" />
                <SidebarRail />
            </Sidebar>
        );
    }

    return (
        <Sidebar collapsible="icon" className="border-none">
            <SidebarHeader className="bg-sidebar pt-4">
                <div className="h-2" />
            </SidebarHeader>

            <SidebarContent className={`bg-sidebar ${isCollapsed ? "px-1.5" : "px-3"}`}>
                {groups.map((group, groupIndex) => (
                    <SidebarGroup key={groupIndex}>
                        <SidebarGroupLabel className="px-4 text-[10px] font-bold text-sidebar-foreground/60 uppercase tracking-[0.1em] mb-4 group-data-[collapsible=icon]:hidden">
                            {group.groupLabel ?? "Main Menu"}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className={`${isCollapsed ? "space-y-2" : "space-y-1.5"}`}>
{group.items.map((item) => {
                                    const isBaseActive = pathname === item.url || pathname.startsWith(`${item.url}/`);
                                    const isSubActive = item.subItems?.some(sub => pathname === sub.url || pathname.startsWith(`${sub.url}/`));
                                    const isActive = isBaseActive || isSubActive;
                                    const isChat = item.url === "/chat";
                                    const isAssignments = item.url === "/assignments";
                                    const isProducts = item.url === "/products";

                                    const showDot = (isChat && chatUnreadTotal > 0) || (isAssignments && assignmentUnreadTotal > 0) || (isProducts && productUnreadTotal > 0);
                                    const showBadge = showDot && !isCollapsed;
                                    const badgeCount = isChat ? chatUnreadTotal : isAssignments ? assignmentUnreadTotal : productUnreadTotal;

                                    return (
                                        <React.Fragment key={item.url}>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton asChild tooltip={item.title}>
                                                    <Link
                                                        href={item.url}
                                                        className={`flex items-center gap-3 px-4 py-3 min-h-12 rounded-xl transition-all duration-200
                                                            ${isCollapsed ? "size-11! min-h-0! p-0! gap-0! justify-center mx-auto" : ""}
                                                            ${isActive
                                                                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm font-semibold"
                                                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/10"
                                                            }`}
                                                    >
                                                        <div className="relative">
                                                            <item.icon className={`${isCollapsed ? "h-5.5 w-5.5" : "h-5 w-5"} shrink-0 ${isActive ? "text-white" : ""}`} />
                                                            {showDot && isCollapsed && (
                                                                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800" />
                                                            )}
                                                        </div>
                                                        <span className="text-[13px] group-data-[collapsible=icon]:hidden flex-1">{item.title}</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                                {showBadge && (
                                                    <SidebarMenuBadge className="bg-red-500 text-white border-none text-[10px] font-bold px-1.5 min-w-5 h-5 flex items-center justify-center rounded-full pointer-events-none">
                                                        {badgeCount > 99 ? "99+" : badgeCount}
                                                    </SidebarMenuBadge>
                                                )}
                                            </SidebarMenuItem>

                                            {item.subItems && item.subItems.length > 0 && isActive && (
                                                <div className="group-data-[collapsible=icon]:hidden">
                                                    <SidebarMenu className="mt-1 space-y-1">
                                                        {item.subItems.map((subItem) => {
                                                            const isSubActive = pathname === subItem.url;
                                                            return (
                                                                <SidebarMenuItem key={subItem.url} className="ml-10">
                                                                    <SidebarMenuButton asChild>
                                                                        <Link
                                                                            href={subItem.url}
                                                                            className={`flex items-center gap-3 py-2 transition-colors text-[12px]
                                                                                ${isSubActive
                                                                                    ? "text-ui-light-textPrimary dark:text-ui-dark-textPrimary font-medium"
                                                                                    : "text-ui-light-textSecondary hover:text-ui-light-textPrimary dark:text-ui-dark-textSecondary dark:hover:text-white"
                                                                                }`}
                                                                        >
                                                                            <span>{subItem.title}</span>
                                                                        </Link>
                                                                    </SidebarMenuButton>
                                                                </SidebarMenuItem>
                                                            )
                                                        })}
                                                    </SidebarMenu>
                                                </div>
                                            )}
                                        </React.Fragment>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter className="bg-sidebar px-3 pb-6 pt-4 border-t border-sidebar-border">
                {user && (
                    <div className="flex flex-col gap-4">
                        <Link
                            href="/settings"
                            className={`flex items-center gap-3 rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent/10 transition-colors ${isCollapsed ? "justify-center px-0 py-2.5" : "px-4 py-2.5"}`}
                            title="Settings"
                        >
                            <Settings className="h-5 w-5 shrink-0" />
                            {!isCollapsed && <span className="font-medium text-[13px]">Settings</span>}
                        </Link>

                        <div className={isCollapsed ? "flex justify-center" : "px-2"}>
                            {!isCollapsed && (
                                <h3 className="text-[10px] font-bold text-sidebar-foreground/60 uppercase tracking-[0.1em] mb-4">Account</h3>
                            )}
                            <button
                                onClick={() => setShowProfileCard(!showProfileCard)}
                                className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} w-full ${isCollapsed ? "" : "hover:bg-sidebar-accent/10 rounded-xl p-2 -mx-2"} transition-colors`}
                            >
                                <div className="relative">
                                    <Avatar 
                                        key={user?.imageUrl}
                                        className={`${isCollapsed ? "h-8 w-8" : "h-10 w-10"} rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800 shrink-0 transition-all duration-200`}
                                    >
                                        <AvatarImage src={user?.imageUrl || undefined} alt={user?.fullName || user?.username || "User Avatar"} />
                                        <AvatarFallback name={user?.username} />
                                    </Avatar>
                                    <div className={`absolute -bottom-0.5 -right-0.5 bg-green-500 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800`} />
                                </div>
                                {!isCollapsed && (
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-[13px] font-bold text-sidebar-foreground truncate">
                                            {user?.fullName || user?.username || "Anonymous User"}
                                        </p>
                                        <p className="text-[11px] text-sidebar-foreground/60 truncate mt-0.5">
                                            Online
                                        </p>
                                    </div>
                                )}
                            </button>

                            {showProfileCard && !isCollapsed && (
                                <UserProfileCard
                                    user={user}
                                />
                            )}
                        </div>
                    </div>
                )}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
