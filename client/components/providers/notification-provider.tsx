"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, useRef } from "react"
import { notificationApi, Notification, type NotificationUnreadCount } from "@/services/api/client"
import AchievementUnlocked from "@/components/achivement"

interface NotificationContextType {
    notifications: Notification[]
    unreadCount: number
    chatUnreadTotal: number
    chatUnreadByChannel: Record<string, number>
    loading: boolean
    fetchNotifications: () => Promise<void>
    refreshUnreadCounts: () => Promise<void>
    markRead: (id: number) => Promise<void>
    markAllRead: () => Promise<void>
    markChannelRead: (channelId: string) => Promise<void>
    registerIncomingChatNotification: (channelId: string, type: "mention" | "reply") => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

function emptyUnreadState(): NotificationUnreadCount {
    return {
        count: 0,
        total: 0,
        byChannel: {},
    }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [chatUnreadState, setChatUnreadState] = useState<NotificationUnreadCount>(emptyUnreadState)
    const [loading, setLoading] = useState(false)
    const [levelUpToast, setLevelUpToast] = useState<{ title: string, description: string } | null>(null)
    const processedNotifications = useRef<Set<number>>(new Set())

    const refreshUnreadCounts = useCallback(async () => {
        try {
            const unreadResponse = await notificationApi.getUnreadCount()
            if (unreadResponse.success && unreadResponse.data) {
                setChatUnreadState(unreadResponse.data)
            }
        } catch {
            // Keep current state if polling fails.
        }
    }, [])

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true)
            const [notificationsResponse, unreadResponse] = await Promise.all([
                notificationApi.getNotifications(),
                notificationApi.getUnreadCount(),
            ])

            if (notificationsResponse.success && notificationsResponse.data) {
                const newNotifications = notificationsResponse.data.notifications;
                
                // Detect level-up in unread notifications
                const levelUpNotif = newNotifications.find(n => 
                    !n.read && 
                    n.title === "Level Up!" && 
                    !processedNotifications.current.has(n.id)
                );

                if (levelUpNotif) {
                    setLevelUpToast({
                        title: levelUpNotif.title,
                        description: levelUpNotif.message || "You reached a new level!"
                    });
                    processedNotifications.current.add(levelUpNotif.id);
                }

                setNotifications(newNotifications)
                setUnreadCount(notificationsResponse.data.unreadCount)
            }

            if (unreadResponse.success && unreadResponse.data) {
                setChatUnreadState(unreadResponse.data)
            }
        } catch {
            // Silently handle network errors
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void fetchNotifications()

        const interval = window.setInterval(() => {
            void fetchNotifications()
        }, 30000)

        const handleWindowFocus = () => {
            void fetchNotifications()
        }

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                void fetchNotifications()
            }
        }

        window.addEventListener("focus", handleWindowFocus)
        document.addEventListener("visibilitychange", handleVisibilityChange)

        return () => {
            window.clearInterval(interval)
            window.removeEventListener("focus", handleWindowFocus)
            document.removeEventListener("visibilitychange", handleVisibilityChange)
        }
    }, [fetchNotifications])

    const markRead = useCallback(async (id: number) => {
        try {
            const response = await notificationApi.markRead(id)
            if (!response.success) {
                return
            }

            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === id
                        ? { ...notification, read: true, readAt: new Date().toISOString() }
                        : notification
                )
            )
            setUnreadCount((prev) => Math.max(0, prev - 1))
            void refreshUnreadCounts()
        } catch {
            // Silently handle network errors
        }
    }, [refreshUnreadCounts])

    const markAllRead = useCallback(async () => {
        try {
            const response = await notificationApi.markAllRead()
            if (!response.success) {
                return
            }

            setNotifications((prev) =>
                prev.map((notification) => ({
                    ...notification,
                    read: true,
                    readAt: new Date().toISOString(),
                }))
            )
            setUnreadCount(0)
            setChatUnreadState(emptyUnreadState())
        } catch {
            // Silently handle network errors
        }
    }, [])

    const markChannelRead = useCallback(async (channelId: string) => {
        try {
            const response = await notificationApi.markChannelRead(channelId)
            if (!response.success) {
                return
            }

            const removedUnread = chatUnreadState.byChannel[channelId] || 0
            const now = new Date().toISOString()
            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.channelId === channelId && ["mention", "reply"].includes(notification.type)
                        ? { ...notification, read: true, readAt: now }
                        : notification
                )
            )

            setChatUnreadState((prev) => {
                const nextByChannel = { ...prev.byChannel }
                const removed = nextByChannel[channelId] || 0
                delete nextByChannel[channelId]

                return {
                    count: prev.count,
                    total: Math.max(0, prev.total - removed),
                    byChannel: nextByChannel,
                }
            })
            setUnreadCount((prev) => Math.max(0, prev - removedUnread))

            void refreshUnreadCounts()
        } catch {
            // Silently handle network errors
        }
    }, [chatUnreadState.byChannel, refreshUnreadCounts])

    const registerIncomingChatNotification = useCallback((channelId: string, type: "mention" | "reply") => {
        setChatUnreadState((prev) => ({
            count: prev.count,
            total: prev.total + 1,
            byChannel: {
                ...prev.byChannel,
                [channelId]: (prev.byChannel[channelId] || 0) + 1,
            },
        }))

        setUnreadCount((prev) => prev + 1)

        setNotifications((prev) => [
            {
                id: Date.now(),
                userId: "",
                title: type === "mention" ? "You were mentioned" : "Someone replied to you",
                type,
                channelId,
                read: false,
                createdAt: new Date().toISOString(),
            },
            ...prev,
        ])
    }, [])

    const value = useMemo(() => ({
        notifications,
        unreadCount,
        chatUnreadTotal: chatUnreadState.total,
        chatUnreadByChannel: chatUnreadState.byChannel,
        loading,
        fetchNotifications,
        refreshUnreadCounts,
        markRead,
        markAllRead,
        markChannelRead,
        registerIncomingChatNotification,
    }), [
        notifications,
        unreadCount,
        chatUnreadState,
        loading,
        fetchNotifications,
        refreshUnreadCounts,
        markRead,
        markAllRead,
        markChannelRead,
        registerIncomingChatNotification,
    ])

    return (
        <NotificationContext.Provider value={value}>
            {children}
            {levelUpToast && (
                <AchievementUnlocked
                    title={levelUpToast.title}
                    description={levelUpToast.description}
                    onClose={() => setLevelUpToast(null)}
                />
            )}
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationProvider")
    }
    return context
}
