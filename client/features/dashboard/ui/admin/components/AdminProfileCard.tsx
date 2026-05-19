"use client"

import Link from "next/link"
import { ArrowUpRight, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { OverviewStats } from "@/features/dashboard/types/admin"
import { getFullName, formatCurrency, formatDate, InfoRow } from "./utils"

export function AdminProfileCard({ admin, finance }: { admin: OverviewStats["admin"], finance: OverviewStats["finance"] }) {
    const fullName = getFullName(admin.displayName, admin.firstName, admin.lastName, admin.username || "Administrator")

    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-1 pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Admin Profile</CardTitle>
                        <CardDescription>Manage your account</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        Edit Profile <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}
