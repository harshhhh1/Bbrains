"use client"

import { useUser } from "@/hooks/use-user"
import { useHasPermission } from "@/components/providers/permissions-provider"
import { SuggestionsPortal } from "@/features/suggestions/ui/SuggestionsPortal"
import { SuggestionsManager } from "@/features/suggestions/ui/SuggestionsManager"
import { PageContainer } from "@/components/layout/page-primitives"
import { LoadingState } from "@/components/ui/loading-state"

export function SuggestionsClient() {
    const { user, loading: userLoading } = useUser()
    const canManage = useHasPermission("manage_suggestions")

    if (userLoading) {
        return <LoadingState label="Loading suggestions..." className="min-h-100" />
    }

    if (canManage) {
        return (
            <PageContainer>
                <SuggestionsManager />
            </PageContainer>
        )
    }

    return (
        <PageContainer>
            <SuggestionsPortal />
        </PageContainer>
    )
}
