"use client"

import React from "react"
import { 
    Bell, Calendar, Trophy, Megaphone, 
    Settings, MessageSquare, GraduationCap, Info,
    ShoppingCart, Wallet
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useNotifications } from "@/components/providers/notification-provider"
import { usePushNotifications } from "@/hooks/usePushNotifications"
import { toast } from "sonner"
import type { Notification } from "@/services/api/client"

export function NotificationsBell() {
    const [mounted, setMounted] = React.useState(false)
    const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
    const { isSupported, isSubscribed, subscribe, unsubscribe, permissionState } = usePushNotifications()
    const router = useRouter()

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="relative group">
                <Bell className="h-5 w-5" />
            </Button>
        )
    }

    const handleMarkRead = async (notification: Notification) => {
        try {
            await markRead(notification.id)
            
            // Navigate based on type
            if (notification.entityUrl) {
                router.push(notification.entityUrl)
            } else if (notification.type === 'attendance') {
                router.push('/dashboard')
            } else if (notification.type === 'announcement') {
                router.push('/announcements')
            } else if (notification.type === 'chat' || notification.type === 'mention' || notification.type === 'reply') {
                router.push('/chat')
            } else if (notification.type === 'market') {
                router.push('/market')
            } else if (notification.type === 'finance') {
                router.push('/wallet')
            }
        } catch (error) {
            console.error("Failed to mark notification as read:", error)
        }
    }

    const handleMarkAllRead = async () => {
        try {
            await markAllRead()
        } catch (error) {
            console.error("Failed to mark all as read:", error)
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'attendance': return <Calendar className="h-4 w-4 text-blue-500" />
            case 'achievement': return <Trophy className="h-4 w-4 text-yellow-500" />
            case 'announcement': return <Megaphone className="h-4 w-4 text-brand-orange" />
            case 'chat': return <MessageSquare className="h-4 w-4 text-green-500" />
            case 'mention': return <MessageSquare className="h-4 w-4 text-brand-orange" />
            case 'reply': return <MessageSquare className="h-4 w-4 text-cyan-500" />
            case 'grade': return <GraduationCap className="h-4 w-4 text-purple-500" />
            case 'market': return <ShoppingCart className="h-4 w-4 text-emerald-500" />
            case 'finance': return <Wallet className="h-4 w-4 text-orange-500" />
            case 'system': return <Settings className="h-4 w-4 text-gray-500" />
            default: return <Info className="h-4 w-4 text-muted-foreground" />
        }
    }

    const handlePushToggle = async () => {
        try {
            if (isSubscribed) {
                await unsubscribe()
                toast.success("Browser notifications disabled")
            } else {
                const didSubscribe = await subscribe()
                if (didSubscribe) {
                    toast.success("Browser notifications enabled")
                }
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update notification permissions")
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group">
                    <Bell className="h-5 w-5 transition-transform group-hover:rotate-12" />
                    {unreadCount > 0 && (
                        <Badge 
                            className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-brand-orange text-[10px] border-2 border-background"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div>
                        <h3 className="font-bold text-sm">Notifications</h3>
                        <p className="text-[11px] text-muted-foreground">
                            {isSupported
                                ? (isSubscribed ? "Browser alerts enabled" : `Browser alerts ${permissionState === "denied" ? "blocked" : "disabled"}`)
                                : "Push not supported on this browser"}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isSupported && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-[10px] uppercase font-bold tracking-wider"
                                onClick={handlePushToggle}
                            >
                                {isSubscribed ? "Disable" : "Enable"}
                            </Button>
                        )}
                        {unreadCount > 0 && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-[10px] uppercase font-bold tracking-wider"
                                onClick={handleMarkAllRead}
                            >
                                Mark all as read
                            </Button>
                        )}
                    </div>
                </div>
                
                <ScrollArea className="h-[350px]">
                    {(!notifications || notifications.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                <Bell className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.map((n) => (
                                <div 
                                    key={n.id}
                                    className={cn(
                                        "p-4 transition-colors cursor-pointer hover:bg-muted/50 flex gap-3",
                                        !n.readAt && "bg-brand-orange/5"
                                    )}
                                    onClick={() => handleMarkRead(n)}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-border bg-background shadow-sm"
                                    )}>
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <p className={cn(
                                                "text-xs font-bold truncate",
                                                !n.readAt ? "text-foreground" : "text-muted-foreground"
                                            )}>
                                                {n.title}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground shrink-0">
                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        {n.message && (
                                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                {n.message}
                                            </p>
                                        )}
                                    </div>
                                    {!n.readAt && (
                                        <div className="w-2 h-2 rounded-full bg-brand-orange mt-1.5 shrink-0" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                
                <div className="p-2 border-t border-border">
                    <Button variant="ghost" className="w-full text-xs font-medium h-8" onClick={() => router.push('/notifications')}>
                        View all activity
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
