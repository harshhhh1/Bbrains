"use client"

import React from 'react'
import Image from 'next/image'
import { User as UserIcon } from 'lucide-react'
import { ActiveUser } from '../hooks/useChat'

interface MemberSidebarProps {
    activeUsers: ActiveUser[];
}

export function MemberSidebar({ activeUsers }: MemberSidebarProps) {
    // Group active users by role
    const groupedUsers = activeUsers.reduce((acc, current) => {
        const type = current.type?.toLowerCase() || 'other'
        if (!acc[type]) acc[type] = []
        // prevent duplicates by checking ID or socketId
        if (!acc[type].some(u => u.socketId === current.socketId)) {
            acc[type].push(current)
        }
        return acc
    }, {} as Record<string, ActiveUser[]>)

    const renderAvatar = (u: ActiveUser) => {
        if (u.avatar && (u.avatar.startsWith('http') || u.avatar.startsWith('/'))) {
            return (
                <Image src={u.avatar} alt={u.username} width={32} height={32} className="w-8 h-8 rounded-full object-cover border-2 border-background shadow-sm" />
            )
        }
        return (
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold shadow-sm shrink-0 border-2 border-background pl-[1px]">
                {u.username?.slice(0, 2).toUpperCase() || 'U'}
            </div>
        )
    }

    return (
        <div className="w-64 bg-muted/60 flex flex-col shrink-0 overflow-hidden border-l border-border h-full">
            <div className="p-4 border-b border-border h-[60px] shrink-0 flex items-center bg-background/50 backdrop-blur-sm">
                <h2 className="text-[14px] font-semibold text-foreground flex items-center gap-2">
                    <UserIcon size={16} className="text-muted-foreground" />
                    Active Members
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-6">
                {Object.keys(groupedUsers).length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground mt-4">No users online</div>
                ) : (
                    Object.entries(groupedUsers).map(([role, users]) => (
                        <div key={role} className="space-y-2">
                            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1.5 flex items-center justify-between">
                                <span>{role}</span>
                                <span className="bg-muted-foreground/15 px-1.5 py-0.5 rounded-full">{users.length}</span>
                            </h3>
                            <div className="space-y-0.5">
                                {users.map((u) => (
                                    <div key={u.socketId} className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-background/80 transition-colors cursor-pointer group">
                                        <div className="relative shrink-0">
                                            {renderAvatar(u)}
                                            <div className="absolute -bottom-0.5 -right-0.5 w-[11px] h-[11px] bg-green-500 border-2 border-background rounded-full z-10"></div>
                                        </div>
                                        <span className="text-[13px] font-medium text-foreground truncate group-hover:text-foreground">
                                            {u.username}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
