"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { BaseCard } from "@/components/ui/base-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { OverviewStats } from "@/features/dashboard/types/admin"
import { getFullName, formatCurrency, formatDate, InfoRow } from "./utils"

export function AdminProfileCard({ admin, finance }: { admin: OverviewStats["admin"], finance: OverviewStats["finance"] }) {
    const fullName = getFullName(admin.displayName, admin.firstName, admin.lastName, admin.username || "Administrator")

    return (
        <BaseCard
            title="Admin Profile"
            description="Manage your account"
            contentClassName="space-y-4"
        >
            <div className="flex items-start gap-4 rounded-[1.25rem] border border-border/60 bg-muted/20 p-4">
                <Avatar className="size-14 border border-border">
                    <AvatarImage src={admin.avatar || undefined} />
                    <AvatarFallback className="text-base font-bold">
                        {fullName.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("") || "AD"}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-foreground">{fullName}</p>
                    <p className="text-sm text-muted-foreground">@{admin.username}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">{admin.type}</Badge>
                        {admin.roles.map((role) => (
                            <Badge key={role} variant="outline" className="text-xs">{role}</Badge>
                        ))}
                    </div>
                </div>
            </div>
            <div className="rounded-[1.25rem] border border-border/60 px-4 py-1">
                <InfoRow label="Email" value={admin.email} />
                <InfoRow label="Wallet" value={formatCurrency(admin.walletBalance, finance.currency)} />
                <InfoRow label="Joined" value={formatDate(admin.createdAt)} />
            </div>
            <Link href="/settings">
                <Button variant="outline" className="w-full">
                    Edit Profile <ArrowUpRight className="ml-2 size-4" />
                </Button>
            </Link>
        </BaseCard>
    )
}
