"use client"

import React, { useState, useRef } from "react"
import Link from "next/link"
import * as LucideIcons from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getSidebarGroups, resolveRole } from "./sidebarData"
import type { Role } from "./sidebarData"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface MobileBottomNavProps {
    user?: {
        id?: string;
        email?: string;
        avatar?: string | null;
        imageUrl?: string;
        firstName?: string;
        lastName?: string;
        fullName?: string;
        username?: string;
        type?: string;
        appRole?: string;
        roles?: string[];
        bio?: string;
        level?: number;
        xp?: number;
        createdAt?: string;
    } | null;
}

export function MobileBottomNav({ user }: MobileBottomNavProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [openMenu, setOpenMenu] = useState<string | null>(null)
    const longPressTimer = useRef<NodeJS.Timeout | null>(null)
    const isLongPress = useRef(false)

    const userRoles = user?.roles || [user?.appRole || user?.type || "student"].filter(Boolean)
    const resolvedRoles = resolveRole(userRoles) as Role[]
    const navItems = getSidebarGroups(resolvedRoles).flatMap(g => g.items)

    const getInitials = () => {
        if (!user) return "U"
        return (user.username || "U")[0].toUpperCase()
    }

    const avatarSrc = user?.avatar || user?.imageUrl || undefined;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[var(--z-bottom-nav)] pb-safe bg-background/80 backdrop-blur-xl border-t border-border shadow-[0_-1px_10px_rgba(0,0,0,0.05)] dark:shadow-none">
            <div className="relative flex h-16 px-2">
                <Link
                    href="/settings"
                    className="flex flex-col items-center justify-center w-16 h-full gap-1 shrink-0 select-none touch-manipulation"
                >
                    <div
                        className={cn(
                            "rounded-full p-[2px] transition-all duration-300",
                            (pathname.startsWith("/settings") || pathname.startsWith("/profile"))
                                ? "border-2 border-primary scale-110 shadow-[0_2px_8px_rgba(var(--primary),0.25)]"
                                : "border-2 border-transparent scale-100"
                        )}
                    >
                        <Avatar className="w-6 h-6 rounded-full border border-background">
                            <AvatarImage src={avatarSrc} className="object-cover" />
                            <AvatarFallback className="bg-primary text-primary-foreground font-black text-[10px] uppercase">
                                {getInitials()}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <span
                        className={cn(
                            "text-[10px] font-black uppercase tracking-tighter transition-all duration-300",
                            (pathname.startsWith("/settings") || pathname.startsWith("/profile"))
                                ? "text-primary opacity-100"
                                : "text-muted-foreground opacity-60"
                        )}
                    >You</span>
                </Link>

                <div className="w-px h-8 bg-border/40 self-center shrink-0" />

                <div className="flex-1 flex items-center overflow-x-auto scrollbar-hide px-2">
                    {navItems.map((item) => {
                        const hasSubItems = item.subItems && item.subItems.length > 0
                        const isActive = pathname === item.url ||
                            (item.url !== "/dashboard" && pathname.startsWith(String(item.url)))
                        const Icon = item.icon || (LucideIcons as any).Circle || (LucideIcons as any).HelpCircle;
                        const url = String(item.url)

                        const startTimer = () => {
                            isLongPress.current = false
                            longPressTimer.current = setTimeout(() => {
                                if (hasSubItems) {
                                    isLongPress.current = true
                                    setOpenMenu(url)
                                    if (window.navigator.vibrate) window.navigator.vibrate(50)
                                }
                            }, 800)
                        }

                        const endTimer = () => {
                            if (longPressTimer.current) {
                                clearTimeout(longPressTimer.current)
                                longPressTimer.current = null
                            }
                            if (!isLongPress.current) {
                                router.push(url)
                            }
                        }

                        const NavButton = (
                            <div
                                suppressHydrationWarning
                                className="flex flex-col items-center justify-center shrink-0 h-full gap-1 select-none touch-manipulation cursor-pointer"
                                style={{ minWidth: 64 }}
                                onPointerDown={startTimer}
                                onPointerUp={endTimer}
                                onPointerLeave={() => longPressTimer.current && clearTimeout(longPressTimer.current)}
                                onContextMenu={(e) => e.preventDefault()}
                            >
                                <div
                                    className={cn(
                                        "rounded-xl flex items-center justify-center relative transition-all duration-300",
                                        isActive 
                                            ? "p-[6px] scale-110 opacity-100 bg-primary/10" 
                                            : "p-[5px] scale-90 opacity-45 bg-transparent"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "w-5 h-5 transition-colors duration-300",
                                            isActive ? "text-primary stroke-[2.5]" : "text-muted-foreground stroke-2"
                                        )}
                                    />
                                    {hasSubItems && (
                                        <div className="absolute -top-1 -right-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
                                        </div>
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        "text-[10px] font-bold truncate px-1 transition-all duration-300",
                                        isActive 
                                            ? "text-primary opacity-100 translate-y-0 max-h-4" 
                                            : "text-muted-foreground opacity-0 translate-y-1 max-h-0"
                                    )}
                                >
                                    {item.title.split('/')[0]}
                                </span>
                            </div>
                        )

                        if (hasSubItems) {
                            return (
                                <DropdownMenu key={url} open={openMenu === url} onOpenChange={(open) => !open && setOpenMenu(null)}>
                                    <DropdownMenuTrigger asChild>
                                        {NavButton}
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="center" side="top" className="w-48 mb-2 rounded-2xl p-2 animate-in slide-in-from-bottom-2">
                                        {item.subItems?.map((sub: any) => {
                                            const SubIcon = sub.icon || (LucideIcons as any).Circle;
                                            return (
                                                <DropdownMenuItem 
                                                    key={sub.url}
                                                    className="rounded-xl focus:bg-primary/10 focus:text-primary gap-2"
                                                    onClick={() => router.push(sub.url)}
                                                >
                                                    <SubIcon className="w-4 h-4" />
                                                    {sub.title}
                                                </DropdownMenuItem>
                                            )
                                        })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )
                        }

                        return <React.Fragment key={url}>{NavButton}</React.Fragment>
                    })}
                </div>
            </div>
        </div>
    )
}
