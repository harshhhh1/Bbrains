"use client"

import Link from "next/link"
import { ArrowUpRight, Megaphone } from "lucide-react"
import { BaseCard } from "@/components/ui/base-card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import type { OverviewStats } from "@/features/dashboard/types/admin"

export function AdminAnnouncements({ announcements }: { announcements: OverviewStats["announcements"] }) {
    return (
        <BaseCard
            title="Announcements"
            description="Latest updates"
            action={
                <Link href="/announcements">
                    <Button variant="ghost" size="sm" className="text-primary">
                        View All <ArrowUpRight className="ml-1 size-3" />
                    </Button>
                </Link>
            }
            contentClassName="space-y-3"
        >
            {announcements.length > 0 ? (
                announcements.slice(0, 3).map((announcement) => (
                    <div
                        key={announcement.id}
                        className="rounded-xl border border-border/50 bg-muted/30 p-3 transition hover:bg-muted/50"
                    >
                        <div className="flex items-start gap-2">
                            <Megaphone className="mt-0.5 size-4 shrink-0 text-primary" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{announcement.title}</p>
                                <p className="mt-1 truncate text-xs text-muted-foreground">
                                    {announcement.content?.replace(/<[^>]*>?/gm, "").slice(0, 80)}...
                                </p>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <EmptyState title="No announcements yet" className="rounded-xl py-8" />
            )}
        </BaseCard>
    )
}
