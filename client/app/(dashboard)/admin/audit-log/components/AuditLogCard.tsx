import React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, ArrowRight } from "lucide-react"
import type { ApiAuditLog } from "../types"
import { categoryColors } from "../types"
import { getInitials, fmtDate, formatChange } from "../utils"

interface AuditLogCardProps {
    log: ApiAuditLog
}

export function AuditLogCard({ log }: AuditLogCardProps) {
    const change = formatChange(log.change)
    
    return (
        <Card className="border-border/60">
            <CardContent className="p-4">
                <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={log.user?.avatar ?? undefined} className="object-cover" />
                                <AvatarFallback className="bg-brand-purple/10 text-brand-purple text-sm font-semibold">
                                    {getInitials(log.user?.username ?? log.userId ?? "S")}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium text-foreground">
                                    {log.user?.username ?? log.userId ?? "System"}
                                </p>
                                <Badge className={`text-[10px] font-semibold ${categoryColors[log.category] ?? ""}`}>
                                    {log.category}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                            <Clock className="size-3.5" />
                            {fmtDate(log.createdAt)}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-foreground">{log.action}</span>
                        <span className="text-muted-foreground">on</span>
                        <span className="font-medium text-foreground">{log.entity}</span>
                        {log.entityId && (
                            <>
                                <span className="text-muted-foreground">#</span>
                                <span className="text-muted-foreground font-mono text-xs">{log.entityId}</span>
                            </>
                        )}
                    </div>

                    {change && (
                        <div className="flex items-start gap-2 text-xs bg-muted/50 rounded-lg p-2.5">
                            <div className="flex-1 min-w-0">
                                <p className="text-muted-foreground mb-1">Old Value</p>
                                <pre className="text-xs text-foreground truncate font-mono whitespace-pre-wrap break-all">
                                    {change.before ? JSON.stringify(change.before, null, 2) : "—"}
                                </pre>
                            </div>
                            <ArrowRight className="size-4 text-muted-foreground shrink-0 mt-4" />
                            <div className="flex-1 min-w-0">
                                <p className="text-muted-foreground mb-1">New Value</p>
                                <pre className="text-xs text-foreground truncate font-mono whitespace-pre-wrap break-all">
                                    {change.after ? JSON.stringify(change.after, null, 2) : "—"}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
