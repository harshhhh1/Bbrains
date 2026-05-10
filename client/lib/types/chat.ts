export interface ChatAttachment {
    id?: string
    name?: string
    url: string
    type: string
}

export interface ChatMessageRecord {
    id: string
    userId: string
    username: string
    displayName?: string
    avatar?: string
    content: string
    createdAt: string
    editedAt?: string | null
    updatedAt?: string | null
    badge?: string
    badgeColor?: string
    replyToMessageId?: string | null
    replyTo?: any
    mentions?: string[]
    mentionedUserIds?: string[]
    attachments?: ChatAttachment[]
}

export interface ChatMentionUser {
    id: string
    username: string
    displayName: string
    avatar?: string
    avatarUrl?: string
}

export interface ChatMemberProfile {
    id: string
    userId: string
    username: string
    displayName?: string
    avatar?: string
    pronouns?: string
    grade?: string
    roles?: string[]
    type?: string
    badge?: string
    badgeColor?: string
}