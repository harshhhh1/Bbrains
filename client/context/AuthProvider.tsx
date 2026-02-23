"use client"
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

type User = {
    id: string
    username: string
    email: string
    collegeId: number
    avatarUrl: string
    type: string
    // Add other required fields returned by backend
}

type AuthContextType = {
    user: any | null
    sessionData: any | null
    isLoading: boolean
    refetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null)
    const [sessionData, setSessionData] = useState<any | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    const fetchUser = async () => {
        try {
            // The backend uses http-only cookies, so we must include credentials
            const res = await fetch('http://localhost:5000/dashboard', {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            })
            if (!res.ok) throw new Error('Not authenticated')

            const session = await res.json()
            if (session?.success && session?.data) {
                // Save both the full dashboard data and the user object
                setSessionData(session.data)
                setUser(session.data.user || session.data)
            } else {
                throw new Error('Invalid session format')
            }
        } catch (err) {
            setUser(null)
            setSessionData(null)
            // Protect dashboard routes
            if (pathname?.startsWith('/dashboard')) {
                router.push('/login')
            }
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [pathname])

    return (
        <AuthContext.Provider value={{ user, sessionData, isLoading, refetchUser: fetchUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
