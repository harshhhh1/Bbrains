"use client"

import React, { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Send, X, ImagePlus, Loader2, Hash } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { ChatMentionUser } from "@/services/api/client"
import type { SelectedMention } from "@/features/chat/data"

interface MessageInputProps {
    message: string
    channelName: string
    editingMessageId: string | null
    replyingMessage: { id: string; username: string; name: string; avatar: string; content: string } | null
    pendingAttachments: { file: File; previewUrl: string }[]
    mentionSuggestions: ChatMentionUser[]
    isUploading?: boolean
    uploadError?: string | null
    onChange: (val: string) => void
    onSend: () => void
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
    onCancelEdit: () => void
    onCancelReply: () => void
    onFileSelect: (files: File[]) => void
    onRemoveAttachment: (index: number) => void
    onMentionSelect: (user: ChatMentionUser) => void
    mentionQuery: string | null
    mentionIndex: number
    setMentionIndex: React.Dispatch<React.SetStateAction<number>>
    mentionedUsers: SelectedMention[]
    onRemoveMention: (userId: string) => void
    isMounted?: boolean
}

export function MessageInput({
    message,
    channelName,
    editingMessageId,
    replyingMessage,
    pendingAttachments,
    mentionSuggestions,
    isUploading = false,
    uploadError = null,
    onChange,
    onSend,
    onKeyDown,
    onCancelEdit,
    onCancelReply,
    onFileSelect,
    onRemoveAttachment,
    onMentionSelect,
    mentionQuery,
    mentionIndex,
    setMentionIndex,
    mentionedUsers,
    onRemoveMention,
    isMounted = false
}: MessageInputProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const focusTimer = setTimeout(() => {
            inputRef.current?.focus()
        }, 120)

        return () => clearTimeout(focusTimer)
    }, [])

    const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (mentionQuery !== null && mentionSuggestions.length > 0) {
            if (event.key === "ArrowDown") {
                event.preventDefault()
                setMentionIndex((mentionIndex + 1) % mentionSuggestions.length)
                return
            }

            if (event.key === "ArrowUp") {
                event.preventDefault()
                setMentionIndex((mentionIndex - 1 + mentionSuggestions.length) % mentionSuggestions.length)
                return
            }

            if (event.key === "Enter" || event.key === "Tab") {
                event.preventDefault()
                onMentionSelect(mentionSuggestions[mentionIndex] || mentionSuggestions[0])
                return
            }

            if (event.key === "Escape") {
                event.preventDefault()
            }
        }

        onKeyDown(event)
    }

    return (
        <div className="px-3 pt-3 pb-24 md:pb-3 border-t border-border bg-card mt-auto relative z-40 bottom-0 md:static">
            {uploadError && (
                <div
                    role="alert"
                    className="mb-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
                >
                    {uploadError}
                </div>
            )}

            {replyingMessage && (
                <div className="flex items-center justify-between mb-2 px-2 py-1.5 bg-muted/50 rounded-md text-xs">
                    <span className="text-muted-foreground truncate">
                        Replying to <span className="font-medium text-foreground">{replyingMessage.name}</span>: <span className="italic">“{replyingMessage.content.slice(0, 50)}{replyingMessage.content.length > 50 ? '...' : ''}”</span>
                    </span>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onCancelReply}>
                        <X className="w-3 h-3" />
                    </Button>
                </div>
            )}

            {editingMessageId && !replyingMessage && (
                <div className="flex items-center justify-between mb-2 px-2 py-1.5 bg-brand-purple/10 rounded-md text-xs">
                    <span className="text-brand-purple font-medium">Editing message</span>
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-brand-purple" onClick={onCancelEdit}>
                        <X className="w-3 h-3" />
                    </Button>
                </div>
            )}

            <div className="flex items-end gap-1.5">
                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8 mb-1"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    <ImagePlus className="w-4 h-4" />
                </Button>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(event) => {
                        const files = Array.from(event.target.files || [])
                        if (files.length > 0) onFileSelect(files)
                        event.target.value = ''
                    }}
                />

                <div className="flex-1 flex flex-col gap-2 relative">
                    {pendingAttachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {pendingAttachments.map((attachment, index) => (
                                <div key={index} className="relative group">
                                    {attachment.file.type.startsWith('image/') ? (
                                        <img
                                            src={attachment.previewUrl}
                                            alt="preview"
                                            className="h-16 w-16 object-cover rounded-md border border-border"
                                        />
                                    ) : (
                                        <div className="h-16 w-16 flex items-center justify-center bg-muted rounded-md border border-border">
                                            <Hash className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                    )}
                                    <button
                                        onClick={() => onRemoveAttachment(index)}
                                        className="absolute -top-1.5 -right-1.5 bg-background border border-border rounded-full p-0.5 shadow-sm hover:bg-muted transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {mentionedUsers?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
                            {mentionedUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center gap-1 px-2 py-0.5 bg-[#5865f2]/10 text-[#5865f2] rounded-md text-[11px] font-medium border border-[#5865f2]/20 group"
                                >
                                    <span>@{user.username}</span>
                                    <button
                                        type="button"
                                        onClick={() => onRemoveMention(user.id)}
                                        className="hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex-1 relative flex items-center bg-background border border-input rounded-full transition-all duration-300 focus-within:ring-1 focus-within:ring-ring">
                        {mentionQuery !== null && mentionSuggestions.length > 0 && (
                            <div className="absolute bottom-full left-0 mb-2 w-72 max-w-[calc(100vw-2rem)] bg-popover border border-border rounded-xl shadow-lg overflow-hidden z-50">
                                <div className="max-h-64 overflow-y-auto overflow-x-hidden py-1">
                                    <div className="flex flex-col">
                                        {mentionSuggestions.map((user, index) => (
                                            <button
                                                key={user.id}
                                                className={`flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors ${
                                                    index === mentionIndex ? "bg-accent text-accent-foreground" : "hover:bg-muted/50 text-foreground"
                                                }`}
                                                onMouseDown={(event) => {
                                                    event.preventDefault()
                                                    onMentionSelect(user)
                                                }}
                                                onMouseEnter={() => setMentionIndex(index)}
                                            >
                                                <Avatar className="w-8 h-8 shrink-0">
                                                    <AvatarImage src={user.avatarUrl || undefined} />
                                                    <AvatarFallback className="bg-brand-purple/10 text-brand-purple text-[10px] font-bold">
                                                        {user.displayName.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col items-start overflow-hidden">
                                                    <span className="font-medium truncate w-full text-left">{user.displayName}</span>
                                                    <span className="text-[10px] text-muted-foreground truncate w-full text-left">@{user.username}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <input
                            ref={inputRef}
                            value={message}
                            onChange={(e) => onChange(e.target.value)}
                            onKeyDown={onKeyDown}
                            autoFocus
                            aria-label="Message input"
                            placeholder={`Message #${channelName}`}
                            className="flex-1 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-muted-foreground"
                        />
                    </div>
                </div>

                {(message.trim() || pendingAttachments.length > 0) && (
                    <Button
                        size="icon"
                        onClick={onSend}
                        disabled={isUploading}
                        className="shrink-0 h-8 w-8 mb-1 animate-in fade-in slide-in-from-right-4 duration-300"
                    >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                )}
            </div>
        </div>
    )
}
