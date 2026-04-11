'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/services/supabase/client'
import {
    chatApi,
    dashboardApi,
    type ChatAttachment,
    type ChatMemberProfile,
    type ChatMessageRecord,
} from '@/services/api/client'
import type { Message } from '@/features/chat/data'

export type ChatMessageDisplay = Message

type ChatRealtimeMessage = {
    id: string
    user_id?: string
    userId?: string
    username?: string
    display_name?: string
    displayName?: string
    avatar?: string
    badge?: string
    badge_color?: string
    badgeColor?: string
    content: string
    created_at?: string
    createdAt?: string
    edited_at?: string | null
    editedAt?: string | null
    updated_at?: string | null
    updatedAt?: string | null
    reply_to?: string | null
    replyTo?: string | null
    mentions?: string[]
    mentioned_user_ids?: string[]
    mentionedUserIds?: string[]
    attachments?: ChatAttachment[]
}

const formatMessage = (msg: ChatMessageRecord | ChatRealtimeMessage): ChatMessageDisplay => {
    const createdAt = (('created_at' in msg ? msg.created_at : undefined) || msg.createdAt) || new Date().toISOString()
    const userId = ('user_id' in msg ? msg.user_id : undefined) || msg.userId
    const displayName = ('display_name' in msg ? msg.display_name : undefined) || msg.displayName
    const rawEditedAt =
        (('edited_at' in msg ? msg.edited_at : undefined) || msg.editedAt) ||
        (('updated_at' in msg ? msg.updated_at : undefined) || msg.updatedAt) ||
        null
    const replyTo = ('reply_to' in msg ? msg.reply_to : undefined) || msg.replyTo
    const badgeColor = ('badge_color' in msg ? msg.badge_color : undefined) || msg.badgeColor
    const mentionedUserIds =
        (('mentioned_user_ids' in msg ? msg.mentioned_user_ids : undefined) || msg.mentionedUserIds) || []
    const date = new Date(createdAt)
    const editedAt =
        rawEditedAt && new Date(rawEditedAt).getTime() - new Date(createdAt).getTime() > 1000
            ? rawEditedAt
            : null

    return {
        id: msg.id,
        user: {
            id: userId || '',
            username: msg.username || '',
            name: displayName || msg.username || '',
            avatar: msg.avatar || '',
            badge: msg.badge,
            badgeColor,
        },
        content: msg.content,
        timestamp: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: date.toLocaleDateString(),
        createdAt: date.toISOString(),
        editedAt,
        replyTo: replyTo ? { messageId: String(replyTo), username: '', content: String(replyTo) } : undefined,
        mentions: msg.mentions || [],
        mentionedUserIds,
        attachments: msg.attachments || [],
        optimistic: false,
    }
}

const sortMessages = (items: ChatMessageDisplay[]) =>
    [...items].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

const upsertMessage = (
    prev: ChatMessageDisplay[],
    nextMessage: ChatMessageDisplay
): ChatMessageDisplay[] => {
    const existingIndex = prev.findIndex((message) => message.id === nextMessage.id)
    const merged =
        existingIndex >= 0
            ? prev.map((message) => (message.id === nextMessage.id ? nextMessage : message))
            : [...prev, nextMessage]

    return sortMessages(merged)
}

const removeMessage = (prev: ChatMessageDisplay[], messageId: string) =>
    prev.filter((message) => message.id !== messageId)

export function useChatMessages() {
    const [messages, setMessages] = useState<ChatMessageDisplay[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [isConnected, setIsConnected] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string>('')
    const [currentUserProfile, setCurrentUserProfile] = useState<ChatMemberProfile | null>(null)
    const [chatRoomId, setChatRoomId] = useState<string>('default')
    const [searchResults, setSearchResults] = useState<ChatMessageDisplay[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [lastIncomingMessage, setLastIncomingMessage] = useState<ChatMessageDisplay | null>(null)
    const fetchInFlightRef = useRef(false)

    const fetchMessages = useCallback(async () => {
        if (fetchInFlightRef.current) return

        try {
            fetchInFlightRef.current = true
            setLoading(true)

            const [userResp, profileResp] = await Promise.all([
                dashboardApi.getUser(),
                chatApi.getMyProfile(),
            ])

            let resolvedChatRoomId = 'default'

            if (userResp.success && userResp.data) {
                setCurrentUserId(userResp.data.id)
                const collegeId = userResp.data.college?.id
                if (collegeId) {
                    resolvedChatRoomId = `global_${collegeId}`
                    setChatRoomId(resolvedChatRoomId)
                }
            }

            if (profileResp.success && profileResp.data) {
                setCurrentUserProfile(profileResp.data)
            }

            const response = await chatApi.getMessages(resolvedChatRoomId, 50)
            if (response.success && response.data) {
                const formatted = sortMessages(response.data.map(formatMessage))
                setMessages(formatted)
                setHasMore(formatted.length === 50)
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error)
        } finally {
            fetchInFlightRef.current = false
            setLoading(false)
        }
    }, [])

    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore || messages.length === 0) return

        try {
            setLoadingMore(true)
            const oldestMessage = messages[0]
            const response = await chatApi.getMessages(chatRoomId, 50, oldestMessage.createdAt)

            if (response.success && response.data) {
                const formatted = response.data.map(formatMessage)
                if (formatted.length > 0) {
                    setMessages((prev) => {
                        let next = [...prev]
                        for (const message of formatted) {
                            next = upsertMessage(next, message)
                        }
                        return next
                    })
                }
                setHasMore(formatted.length === 50)
            }
        } catch (error) {
            console.error('Failed to load older messages:', error)
        } finally {
            setLoadingMore(false)
        }
    }, [chatRoomId, hasMore, loadingMore, messages])

    const searchMessages = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([])
            setIsSearching(false)
            return
        }

        try {
            setIsSearching(true)
            const response = await chatApi.searchMessages(query, 50, chatRoomId)
            if (response.success && response.data) {
                setSearchResults(response.data.map(formatMessage))
            }
        } catch (error) {
            console.error('Failed to search messages:', error)
        } finally {
            setIsSearching(false)
        }
    }, [chatRoomId])

    const ensureMessageVisible = useCallback(async (messageId: string, createdAt?: string) => {
        if (messages.some((message) => message.id === messageId)) {
            return true
        }

        let before = messages[0]?.createdAt
        while (before) {
            const response = await chatApi.getMessages(chatRoomId, 50, before)
            if (!response.success || !response.data || response.data.length === 0) {
                break
            }

            const formatted = response.data.map(formatMessage)
            setMessages((prev) => {
                let next = [...prev]
                for (const message of formatted) {
                    next = upsertMessage(next, message)
                }
                return next
            })

            if (formatted.some((message) => message.id === messageId)) {
                return true
            }

            const nextBefore = formatted[0]?.createdAt
            if (!nextBefore || nextBefore === before) {
                break
            }

            if (createdAt && new Date(nextBefore).getTime() <= new Date(createdAt).getTime()) {
                before = nextBefore
                continue
            }

            before = nextBefore
        }

        return false
    }, [chatRoomId, messages])

    const sendMessage = async (
        content: string,
        attachments: ChatAttachment[] = [],
        mentions: string[] = [],
        replyToId?: string,
        mentionedUserIds: string[] = []
    ) => {
        const optimisticId = `optimistic:${crypto.randomUUID()}`
        const profile = currentUserProfile

        const optimisticMessage: ChatMessageDisplay = {
            id: optimisticId,
            user: {
                id: currentUserId,
                username: profile?.username || '',
                name: profile?.displayName || profile?.username || 'You',
                avatar: profile?.avatar || '',
                badge: profile?.type === 'admin' ? 'ADMIN' : ['teacher', 'staff'].includes(profile?.type || '') ? 'MOD' : undefined,
                badgeColor: profile?.type === 'admin' ? 'bg-red-500' : ['teacher', 'staff'].includes(profile?.type || '') ? 'bg-blue-500' : undefined,
            },
            content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString(),
            createdAt: new Date().toISOString(),
            replyTo: replyToId ? { messageId: replyToId, username: '', content: '' } : undefined,
            mentions,
            mentionedUserIds,
            attachments,
            optimistic: true,
        }

        try {
            setMessages((prev) => upsertMessage(prev, optimisticMessage))

            const response = await chatApi.sendMessage(content, attachments, mentions, replyToId, mentionedUserIds)
            if (!response.success || !response.data) {
                throw new Error(response.message || response.error || 'Failed to send message')
            }

            const confirmedMessage = formatMessage(response.data)
            setMessages((prev) => {
                const withoutOptimistic = removeMessage(prev, optimisticId)
                return upsertMessage(withoutOptimistic, confirmedMessage)
            })

            return response
        } catch (error) {
            setMessages((prev) => removeMessage(prev, optimisticId))
            console.error('Failed to send message:', error)
            throw error
        }
    }

    const deleteMessage = async (messageId: string) => {
        try {
            const response = await chatApi.deleteMessage(messageId)
            if (response.success) {
                setMessages((prev) => prev.filter((message) => message.id !== messageId))
            }
            return response
        } catch (error) {
            console.error('Failed to delete message:', error)
            throw error
        }
    }

    const editMessage = async (
        messageId: string,
        content: string,
        mentions: string[] = [],
        mentionedUserIds: string[] = []
    ) => {
        try {
            const response = await chatApi.editMessage(messageId, content, mentions, mentionedUserIds)
            if (response.success && response.data) {
                const updated = formatMessage(response.data)
                setMessages((prev) => upsertMessage(prev, updated))
            }
            return response
        } catch (error) {
            console.error('Failed to edit message:', error)
            throw error
        }
    }

    useEffect(() => {
        void fetchMessages()
    }, [fetchMessages])

    useEffect(() => {
        if (!chatRoomId) return

        const channel = supabase
            .channel(`chat_room_${chatRoomId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `chat_id=eq.${chatRoomId}`
                },
                (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new: ChatRealtimeMessage; old: { id: string } }) => {
                    if (payload.eventType === 'INSERT') {
                        const inserted = formatMessage(payload.new)
                        setMessages((prev) => {
                            const optimisticMatch = prev.find(
                                (message) =>
                                    message.optimistic &&
                                    message.user.id === inserted.user.id &&
                                    message.content === inserted.content &&
                                    JSON.stringify(message.attachments || []) === JSON.stringify(inserted.attachments || [])
                            )

                            if (optimisticMatch) {
                                const withoutOptimistic = removeMessage(prev, optimisticMatch.id)
                                return upsertMessage(withoutOptimistic, inserted)
                            }

                            return upsertMessage(prev, inserted)
                        })
                        setLastIncomingMessage(inserted)
                    } else if (payload.eventType === 'UPDATE') {
                        const updated = formatMessage(payload.new)
                        setMessages((prev) => upsertMessage(prev, updated))
                    } else if (payload.eventType === 'DELETE') {
                        setMessages((prev) => prev.filter((message) => message.id !== payload.old.id))
                    }
                }
            )
            .subscribe((status: string) => {
                setIsConnected(status === 'SUBSCRIBED')
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [chatRoomId])

    return {
        messages,
        loading,
        loadingMore,
        hasMore,
        isConnected,
        currentUserId,
        currentUserProfile,
        chatRoomId,
        lastIncomingMessage,
        sendMessage,
        deleteMessage,
        editMessage,
        refresh: fetchMessages,
        loadMore,
        searchMessages,
        ensureMessageVisible,
        searchResults,
        isSearching,
    }
}
