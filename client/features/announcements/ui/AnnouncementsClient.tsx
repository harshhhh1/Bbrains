"use client"

import React from "react"
import { useUser } from "@/hooks/use-user"
import { useHasPermission } from "@/components/providers/permissions-provider"
import { AnnouncementsContent } from "@/features/announcements/ui/AnnouncementsContent"
import { DashboardContent } from "@/components/dashboard-content"
import { Loader2 } from "lucide-react"
import type { Announcement } from "@/services/api/client"

interface AnnouncementsClientProps {
    initialAnnouncements: Announcement[]
}

export function AnnouncementsClient({ initialAnnouncements }: AnnouncementsClientProps) {
    const { user, loading: userLoading } = useUser()

    if (userLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <DashboardContent>
            <AnnouncementsContent 
                initialAnnouncements={initialAnnouncements} 
                currentUser={user as any} 
            />
        </DashboardContent>
    )
}
