"use client"

import Link from "next/link"
import { ArrowUpRight, Megaphone } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { OverviewStats } from "@/features/dashboard/types/admin"

export function AdminAnnouncements({ announcements }: { announcements: OverviewStats["announcements"] }) {
    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-1 pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Announcements</CardTitle>
                        <CardDescription>Latest updates</CardDescription>
                    </div>
                    <Link href="/announcements">
                        <Button variant="ghost" size="sm" className="text-primary">
                            View All <ArrowUpRight className="ml-1 h-3 w-3" />
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {announcements.length > 0 ? (
                    announcements.slice(0, 3).map((announcement) => (
                        <div
                            key={announcement.id}
                            className="rounded-xl border border-border/50 bg-muted/30 p-3 transition hover:bg-muted/50"
                        >
                            <div className="flex items-start gap-2">
                                <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
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
                    <div className="rounded-xl border border-dashed border-border/70 py-8 text-center text-sm text-muted-foreground">
                        No announcements yet
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
