'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { MainNavbar } from "@/components/layout/main-navbar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"

import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import React from 'react'
import { NotificationProvider } from "@/components/providers/notification-provider"
import { PermissionsProvider } from "@/components/providers/permissions-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { getBaseUrl } from "@/services/api/client"

type LayoutRoleEntry = {
    role?: {
        name?: string | null;
    } | null;
}

type LayoutUserDetails = {
    avatar?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    bio?: string | null;
}

type LayoutUserXP = {
    level?: number;
    xp?: number;
}

type LayoutDBUser = {
    id?: string | null;
    type?: string | null;
    username?: string | null;
    createdAt?: string | null;
    roles?: LayoutRoleEntry[] | null;
    userDetails?: LayoutUserDetails | null;
    xp?: LayoutUserXP | null;
    avatar?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    bio?: string | null;
    college?: {
        name?: string | null;
    } | null;
    wallet?: {
        balance?: number | null;
    } | null;
    isImpersonating?: boolean;
    originalType?: string;
}

async function fetchSidebarAccess(token: string): Promise<Record<string, string[]> | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await fetch(`${baseUrl}/sidebaraccess`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) return null

        const result = await response.json()
        if (result.success && result.data) {
            return result.data
        }
        return null
    } catch {
        return null
    }
}

async function fetchUser(token: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await fetch(`${baseUrl}/user/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
        const result = await response.json()
        return result.success ? result.data : null
    } catch {
        return null
    }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<{
        id: string
        imageUrl: string
        firstName: string
        lastName: string
        bio: string
        fullName: string
        username: string
        type: string
        appRole: string
        roles: string[]
        level: number
        xp: number
        createdAt?: string
        collegeName?: string
        coins: number
        isImpersonating: boolean
        originalType?: string
    } | null>(null)
    const [sidebarAccess, setSidebarAccess] = useState<Record<string, string[]> | null>(null)

    useEffect(() => {
        const token = localStorage.getItem('auth_token')
        if (!token) {
            router.push('/auth/login')
            return
        }

        const init = async () => {
            const [dbUser, sidebarAccessOverride] = await Promise.all([
                fetchUser(token),
                fetchSidebarAccess(token)
            ])

            if (!dbUser) {
                router.push('/auth/login')
                return
            }

            const userXp = dbUser.xp || { level: 1, xp: 0 }
            const roleEntries = Array.isArray(dbUser?.roles) ? (dbUser.roles as LayoutRoleEntry[]) : []
            const roleNames = roleEntries
                .map((entry) => entry.role?.name?.trim().toLowerCase())
                .filter((value): value is string => Boolean(value))
            const dbType = dbUser?.type?.trim().toLowerCase()

            let appRole = dbType || 'student'
            if (roleNames.some((name) => name.includes('bbrains_official'))) {
                appRole = 'bbrains_official'
            } else if (roleNames.some((name) => name.includes('manager'))) {
                appRole = 'manager'
            } else if (roleNames.some((name) => name.includes('superadmin'))) {
                appRole = 'superadmin'
            } else if (roleNames.some((name) => name.includes('admin')) || dbType === 'admin') {
                appRole = 'admin'
            } else if (roleNames.some((name) => name.includes('teacher')) || dbType === 'teacher') {
                appRole = 'teacher'
            }

            const allRoles: string[] = []
            if (dbType && dbType !== 'student') {
                allRoles.push(dbType)
            }
            for (const name of roleNames) {
                if (!allRoles.includes(name)) {
                    allRoles.push(name)
                }
            }
            if (allRoles.length === 0) {
                allRoles.push('student')
            }

            const details = dbUser?.userDetails
            const formattedUser = {
                id: dbUser.id || '',
                imageUrl: details?.avatar || dbUser?.avatar || "",
                firstName: details?.firstName || dbUser.firstName || "",
                lastName: details?.lastName || dbUser.lastName || "",
                bio: details?.bio || dbUser.bio || "",
                fullName: details?.firstName ? `${details.firstName} ${details.lastName || ""}` : (dbUser?.username || ""),
                username: dbUser?.username || "",
                type: dbType || "student",
                appRole,
                roles: allRoles,
                level: userXp.level,
                xp: userXp.xp,
                createdAt: dbUser?.createdAt || undefined,
                collegeName: dbUser?.college?.name,
                coins: dbUser?.wallet?.balance || 0,
                isImpersonating: dbUser?.isImpersonating || false,
                originalType: dbUser?.originalType,
            }

            setUser(formattedUser)
            setSidebarAccess(sidebarAccessOverride)
            setLoading(false)
        }

        init()
    }, [router])

    return (
        <SidebarProvider defaultOpen={true}>
            <NotificationProvider>
                <PermissionsProvider>
                    <TooltipProvider>
                        <div className="flex h-screen w-full overflow-hidden bg-background">
                            <AppSidebar user={user} sidebarAccessOverride={sidebarAccess} />

                            <SidebarInset className="md:ml-2 flex flex-col h-full overflow-hidden min-w-0 w-full">
                                <MainNavbar user={user} />

                                <main className="scrollbar-hide p-4 flex-1 min-h-0 flex flex-col relative overflow-y-auto overflow-x-hidden pb-0 md:pb-0">
                                     {loading || !user ? (
                                         <div className="flex h-full items-center justify-center">
                                             <div className="flex flex-col items-center gap-2">
                                                 <div className="size-8 animate-spin rounded-full border-4 border-brand-purple border-t-transparent"></div>
                                                 <p className="text-sm font-medium text-muted-foreground">Initializing...</p>
                                             </div>
                                         </div>
                                     ) : (
                                         children
                                     )}
                                </main>
                                <MobileBottomNav user={user} />
                            </SidebarInset>
                        </div>
                    </TooltipProvider>
                </PermissionsProvider>
            </NotificationProvider>
        </SidebarProvider>
    )
}