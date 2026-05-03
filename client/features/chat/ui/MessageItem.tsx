"use client"

import React, { useMemo } from "react"
import { Copy, Pencil, Reply, Trash2, Loader2, AtSign, Link } from "lucide-react"
import type { Message } from "@/features/chat/api/data"
import type { ChatAttachment } from "@/services/api/client"
import { ChatImagePreview } from "@/components/chat-image-preview"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"

interface MessageItemProps {
    msg: Message
    currentUserId?: string | null
    currentUsername?: string | null
    onReply: (message: Message) => void
    onCopy: (content: string) => void
    onEdit: (message: Message) => void
    onDelete: (messageId: string) => void
    onOpenProfile: (userId: string) => void
    onMention?: (username: string) => void
    onCopyLink?: (messageId: string) => void
}

export const MessageItem = React.memo(function MessageItem({
    msg,
    currentUserId,
    currentUsername,
    onReply,
    onCopy,
    onEdit,
    onDelete,
    onOpenProfile,
    onMention,
    onCopyLink,
}: MessageItemProps) {
    const isOwnMessage = currentUserId === msg.user.id
    const isMentionedById = Boolean(currentUserId && msg.mentionedUserIds?.includes(currentUserId))
    const isMentionedByUsername = Boolean(
        currentUsername &&
        msg.mentions?.some((mention) => mention.toLowerCase() === currentUsername.toLowerCase())
    )
    const isMentioned = isMentionedById || isMentionedByUsername

    const content = useMemo(() => {
        const mentionSet = new Set((msg.mentions || []).map(m => m.toLowerCase()))
        const urlRegex = /(https?:\/\/[^\s]+)/g
        const mentionRegex = /(@[a-zA-Z0-9_]+)/g
        const combinedRegex = /((?:https?:\/\/[^\s]+)|(?:@[a-zA-Z0-9_]+))/g

        return (
            <>
                {msg.content.split(combinedRegex).map((part, index) => {
                    if (!part) return null

                    // Handle URLs
                    if (part.match(urlRegex)) {
                        return (
                            <a
                                key={index}
                                href={part}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline break-all"
                            >
                                {part}
                            </a>
                        )
                    }

                    // Handle Mentions
                    if (part.match(mentionRegex)) {
                        const username = part.slice(1).toLowerCase()
                        // Highlight if in mentionSet OR if it looks like a valid mention pattern
                        return (
                            <span
                                key={index}
                                className="bg-[#5865f2]/20 text-[#5865f2] rounded px-1 font-medium cursor-pointer hover:bg-[#5865f2]/30 transition-colors"
                                onClick={() => onMention?.(username)}
                            >
                                {part}
                            </span>
                        )
                    }

                    return <React.Fragment key={index}>{part}</React.Fragment>
                })}
            </>
        )
    }, [msg.content, msg.mentions, onMention])

    const containerStyle = isMentioned
        ? "bg-primary/5 border-l-2 border-primary"
        : "hover:bg-muted/50"

    const isTeacher = msg.user.badge?.toLowerCase() === 'teacher' || msg.user.badge?.toLowerCase() === 'mod'
    const authorNameStyle = isTeacher ? "text-red-600 dark:text-red-400" : "text-foreground"

    const attachments = useMemo(() => {
        if (!msg.attachments) return []
        if (Array.isArray(msg.attachments)) return msg.attachments
        try {
            return JSON.parse(msg.attachments as unknown as string)
        } catch {
            return []
        }
    }, [msg.attachments])

    const handleCopyLink = () => {
        if (onCopyLink) {
            onCopyLink(msg.id)
        } else {
            const url = `${window.location.origin}${window.location.pathname}?msgId=${msg.id}`
            navigator.clipboard.writeText(url)
        }
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                <div
                    id={`msg-${msg.id}`}
                    className={`group flex flex-col px-3 py-1 rounded-md transition-colors relative animate-in fade-in duration-300 ${containerStyle} ${msg.optimistic ? "opacity-70" : ""}`}
                >
                    {msg.replyTo && typeof msg.replyTo !== 'string' && (
                        <div className="flex items-center gap-2 mb-0.5 ml-[46px] relative h-6">
                            {/* Curved Line Overlay */}
                            <div className="absolute -left-[20px] top-[14px] w-4 h-[12px] border-l-2 border-t-2 border-[#4e5058] rounded-tl-[6px]" />
                            
                            <Avatar className="w-4 h-4 shrink-0">
                                <AvatarImage src={msg.replyTo.avatar || undefined} className="object-cover" />
                                <AvatarFallback className="bg-brand-purple/20 text-brand-purple text-[8px] font-bold uppercase">
                                    {msg.replyTo.name?.[0] || "?"}
                                </AvatarFallback>
                            </Avatar>
                            
                            <span className="text-[12px] font-bold text-[#b5bac1] hover:underline cursor-pointer flex items-center">
                                @{msg.replyTo.name}
                            </span>
                            
                            <span className="text-[12px] text-[#949ba4] truncate max-w-[400px] hover:text-[#dbdee1] cursor-pointer transition-colors">
                                {msg.replyTo.content}
                            </span>
                        </div>
                    )}

                    <div className="flex items-start gap-3 mt-0.5">
                        <button onClick={() => onOpenProfile(msg.user.id)} className="shrink-0">
                            <Avatar className="w-10 h-10 border border-border/50">
                                <AvatarImage src={msg.user.avatar || undefined} className="object-cover" />
                                <AvatarFallback
                                    name={msg.user.username}
                                    className="bg-brand-purple/10 text-brand-purple text-sm font-bold uppercase"
                                >
                                    {msg.user.name?.[0] || msg.user.username?.[0] || "U"}
                                </AvatarFallback>
                            </Avatar>
                        </button>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-2">
                                <button
                                    onClick={() => onOpenProfile(msg.user.id)}
                                    className={`font-semibold text-sm hover:underline ${authorNameStyle}`}
                                >
                                    {msg.user.name}
                                </button>
                                {msg.user.badge && (
                                    <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                                        {msg.user.badge}
                                    </span>
                                )}
                                <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                                {msg.optimistic && (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Sending
                                    </span>
                                )}
                                {!msg.optimistic && msg.editedAt && <span className="text-[10px] text-gray-400">(edited)</span>}
                            </div>

                            <div className="text-sm text-foreground/90 wrap-break-word">
                                {content}
                            </div>

                            {attachments.length > 0 && (
                                <div className="mt-2 grid gap-2">
                                    {attachments.map((attachment: ChatAttachment, index: number) => (
                                        <ChatImagePreview
                                            key={`${msg.id}-att-${index}`}
                                            attachment={attachment}
                                            variant="message"
                                            className="w-full md:max-w-[50%]"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {!msg.optimistic && (
                        <div className="absolute right-2 -top-3 hidden group-hover:flex items-center bg-card border border-border rounded-md shadow-sm z-10">
                            <button
                                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-l-md"
                                title="Reply"
                                onClick={() => onReply(msg)}
                            >
                                <Reply className="h-3.5 w-3.5" />
                            </button>
                            <button
                                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                title="Copy"
                                onClick={() => onCopy(msg.content)}
                            >
                                <Copy className="h-3.5 w-3.5" />
                            </button>

                            {isOwnMessage && (
                                <>
                                    <button
                                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                        title="Edit"
                                        onClick={() => onEdit(msg)}
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        className="p-1.5 text-destructive hover:bg-destructive/10 transition-colors rounded-r-md"
                                        title="Delete"
                                        onClick={() => onDelete(msg.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </ContextMenuTrigger>

            <ContextMenuContent className="w-56">
                <ContextMenuItem onClick={() => onReply(msg)}>
                    <Reply className="w-4 h-4 mr-2" />
                    Reply
                </ContextMenuItem>
                {onMention && (
                    <ContextMenuItem onClick={() => onMention(msg.user.username)}>
                        <AtSign className="w-4 h-4 mr-2" />
                        Mention User
                    </ContextMenuItem>
                )}
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => onCopy(msg.content)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Message
                </ContextMenuItem>
                <ContextMenuItem onClick={handleCopyLink}>
                    <Link className="w-4 h-4 mr-2" />
                    Copy Message Link
                </ContextMenuItem>
                {isOwnMessage && (
                    <>
                        <ContextMenuSeparator />
                        <ContextMenuItem onClick={() => onEdit(msg)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit Message
                        </ContextMenuItem>
                        <ContextMenuItem
                            variant="destructive"
                            onClick={() => onDelete(msg.id)}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Message
                        </ContextMenuItem>
                    </>
                )}
            </ContextMenuContent>
        </ContextMenu>
    )
})
