"use client"

import { useUser } from "@/hooks/use-user"
import { AnnouncementsContent } from "@/features/announcements/ui/AnnouncementsContent"
import { PageContainer } from "@/components/layout/page-primitives"
import { LoadingState } from "@/components/ui/loading-state"
import type { Announcement } from "@/services/api/client"

interface AnnouncementsClientProps {
    initialAnnouncements: Announcement[]
}

export function AnnouncementsClient({ initialAnnouncements }: AnnouncementsClientProps) {
    const { user, loading: userLoading } = useUser()

    if (userLoading) {
        return <LoadingState label="Loading announcements..." className="min-h-[400px]" />
    }

    return (
        <PageContainer>
            <AnnouncementsContent 
                initialAnnouncements={initialAnnouncements} 
                currentUser={user as any} 
            />
        </PageContainer>
    )
}
