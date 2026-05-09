'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getAuthToken } from '@/services/api/base'

type UserContextType = {
    user: any | null
    loading: boolean
    refreshUser: () => Promise<void>
    sidebarAccess: Record<string, string[]> | null
}

const UserContext = createContext<UserContextType | undefined>(undefined)

async function fetchSidebarAccess(token: string): Promise<Record<string, string[]> | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await fetch(`${baseUrl}/sidebaraccess`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })

        if (response.status === 401) {
            localStorage.removeItem('auth_token')
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            return null
        }

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

async function fetchUserDetails(token: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await fetch(`${baseUrl}/user/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
        
        if (response.status === 401) {
            localStorage.removeItem('auth_token')
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            return null
        }

        const result = await response.json()
        return result.success ? result.data : null
    } catch {
        return null
    }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [user, setUser] = useState<any | null>(null)
    const [sidebarAccess, setSidebarAccess] = useState<Record<string, string[]> | null>(null)
    const [loading, setLoading] = useState(true)

    const refreshUser = useCallback(async () => {
        const token = await getAuthToken()
        if (!token) {
            setUser(null)
            setLoading(false)
            if (!pathname.startsWith('/auth')) {
                router.push('/auth/login')
            }
            return
        }

        const [dbUser, access] = await Promise.all([
            fetchUserDetails(token),
            fetchSidebarAccess(token)
        ])

        if (!dbUser) {
            setUser(null)
            setLoading(false)
            if (!pathname.startsWith('/auth')) {
                router.push('/auth/login')
            }
            return
        }

        // Format user object (copied from DashboardLayout logic)
        const userXp = dbUser.xp || { level: 1, xp: 0 }
        const roleEntries = Array.isArray(dbUser?.roles) ? dbUser.roles : []
        const roleNames = roleEntries
            .map((entry: any) => entry.role?.name?.trim().toLowerCase())
            .filter((value: any): value is string => Boolean(value))
        const dbType = dbUser?.type?.trim().toLowerCase()

        let appRole = dbType || 'student'
        if (roleNames.some((name: string) => name.includes('bbrains_official'))) {
            appRole = 'bbrains_official'
        } else if (roleNames.some((name: string) => name.includes('manager'))) {
            appRole = 'manager'
        } else if (roleNames.some((name: string) => name.includes('superadmin'))) {
            appRole = 'superadmin'
        } else if (roleNames.some((name: string) => name.includes('admin')) || dbType === 'admin') {
            appRole = 'admin'
        } else if (roleNames.some((name: string) => name.includes('teacher')) || dbType === 'teacher') {
            appRole = 'teacher'
        }

        const allRoles: string[] = []
        if (dbType && dbType !== 'student') allRoles.push(dbType)
        for (const name of roleNames) {
            if (!allRoles.includes(name)) allRoles.push(name)
        }
        if (allRoles.length === 0) allRoles.push('student')

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
        setSidebarAccess(access)
        setLoading(false)
    }, [router, pathname])

    useEffect(() => {
        refreshUser()
    }, [pathname, refreshUser])

    useEffect(() => {
        const handleUpdate = () => refreshUser()
        window.addEventListener('user-xp-updated', handleUpdate)
        return () => window.removeEventListener('user-xp-updated', handleUpdate)
    }, [refreshUser])

    return (
        <UserContext.Provider value={{ user, loading, refreshUser, sidebarAccess }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}
