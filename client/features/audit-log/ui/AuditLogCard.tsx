import React, { useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, ChevronDown, Info, Shield, User, Settings, Database, GraduationCap, ShoppingCart, Landmark } from "lucide-react"
import type { ApiAuditLog, LogCategory } from "@/features/audit-log/types"
import { categoryColors } from "@/features/audit-log/types"
import { getInitials, fmtDate, formatChange } from "@/features/audit-log/model"
import { cn } from "@/lib/utils"

interface AuditLogCardProps {
    log: ApiAuditLog
}

const CategoryIcon = ({ category, className }: { category: LogCategory; className?: string }) => {
    switch (category) {
        case "AUTH": return <Shield className={className} />
        case "ACADEMIC": return <GraduationCap className={className} />
        case "MARKET": return <ShoppingCart className={className} />
        case "FINANCE": return <Landmark className={className} />
        case "USER": return <User className={className} />
        case "SYSTEM": return <Settings className={className} />
        default: return <Info className={className} />
    }
}

export function AuditLogCard({ log }: AuditLogCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const change = formatChange(log.change)
    const hasChange = !!change
    const hasReason = !!log.reason
    const hasDetails = hasChange || hasReason

    return (
        <div className="group border-b border-border/40 last:border-0">
            <div 
                className={cn(
                    "flex items-center gap-4 py-3 px-4 transition-colors",
                    hasDetails ? "cursor-pointer hover:bg-muted/30" : "hover:bg-muted/10"
                )}
                onClick={() => hasDetails && setIsExpanded(!isExpanded)}
            >
                {/* Action Icon */}
                <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    categoryColors[log.category]?.split(" ")[0] || "bg-muted"
                )}>
                    <CategoryIcon 
                        category={log.category as LogCategory} 
                        className={cn("size-4", categoryColors[log.category]?.split(" ")[1] || "text-muted-foreground")} 
                    />
                </div>

                {/* User Avatar */}
                <Avatar className="h-10 w-10 shrink-0 border-2 border-background shadow-sm">
                    <AvatarImage src={log.user?.avatar ?? undefined} className="object-cover" />
                    <AvatarFallback className="bg-brand-purple/10 text-brand-purple text-xs font-bold uppercase">
                        {getInitials(log.user?.username ?? log.userId ?? "S")}
                    </AvatarFallback>
                </Avatar>

                {/* Log Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-sm">
                            {log.user?.username ?? log.userId ?? "System"}
                        </span>
                        <span className="text-muted-foreground text-sm">
                            {log.action}
                        </span>
                        <span className="font-medium text-foreground text-sm">
                            {log.entity}
                        </span>
                        {log.entityId && (
                            <span className="text-muted-foreground font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">
                                #{log.entityId.slice(-6)}
                            </span>
                        )}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 font-medium flex items-center gap-2 flex-wrap">
                        {fmtDate(log.createdAt)}
                        <Badge variant="outline" className={cn("px-1.5 py-0 h-4 text-[9px] font-bold tracking-tight", categoryColors[log.category])}>
                            {log.category}
                        </Badge>
                        {log.user?.college?.name && (
                            <Badge variant="outline" className="px-1.5 py-0 h-4 text-[9px] font-bold bg-brand-purple/5 border-brand-purple/20 text-brand-purple tracking-tight">
                                {log.user.college.name}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Expand Indicator */}
                {hasDetails && (
                    <div className="shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
                        {isExpanded ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
                    </div>
                )}
            </div>

            {/* Collapsible Details */}
            {hasDetails && isExpanded && (
                <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="ml-12 pl-4 border-l-2 border-muted space-y-3">
                        {hasReason && (
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Reason</p>
                                <div className="bg-muted/40 rounded-md p-2.5">
                                    <p className="text-sm text-foreground">{log.reason}</p>
                                </div>
                            </div>
                        )}
                        {hasChange && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                                        {change.before != null ? "Before" : "Details"}
                                    </p>
                                    <div className="bg-muted/40 rounded-md p-2.5 overflow-hidden">
                                        <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-all leading-relaxed">
                                            {change.before != null ? JSON.stringify(change.before, null, 2) : change.after != null ? JSON.stringify(change.after, null, 2) : "—"}
                                        </pre>
                                    </div>
                                </div>
                                {change.before != null && (
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">After</p>
                                        <div className="bg-brand-purple/5 rounded-md p-2.5 overflow-hidden border border-brand-purple/10">
                                            <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-all leading-relaxed">
                                                {change.after != null ? JSON.stringify(change.after, null, 2) : "—"}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
