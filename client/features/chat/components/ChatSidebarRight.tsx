import React, { useEffect, useState } from "react"
import { supabase } from "@/services/supabase/client"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Member } from "@/features/chat/data"

interface ChatSidebarRightProps {
  members: Member[]
  currentUserId: string
  onSelectUser?: (user: Member) => void
}

export function ChatSidebarRight({ members, currentUserId, onSelectUser }: ChatSidebarRightProps) {
  const onlineMembers = members.filter(m => m.status === 'online')
  const offlineMembers = members.filter(m => m.status !== 'online')

  const onlineByRole = onlineMembers.reduce((acc, m) => {
    const roleName = m.role?.toLowerCase() === 'moderator' ? 'Teacher' : m.role
    if (!acc[roleName]) acc[roleName] = []
    acc[roleName].push(m)
    return acc
  }, {} as Record<string, Member[]>)

  const offlineByRole = offlineMembers.reduce((acc, m) => {
    const roleName = m.role?.toLowerCase() === 'moderator' ? 'Teacher' : m.role
    if (!acc[roleName]) acc[roleName] = []
    acc[roleName].push(m)
    return acc
  }, {} as Record<string, Member[]>)

  return (
    <aside className="hidden md:flex flex-col w-60 border-l border-border bg-card shrink-0">
      <div className="p-4 border-b border-border text-sm shrink-0">
        <h3 className="font-semibold text-foreground">Members</h3>
      </div>
      <ScrollArea className="flex-1 p-4">
        {Object.entries(onlineByRole).map(([role, roleMembers]) => (
          <div key={`online-${role}`} className="mb-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {role} — Online ({roleMembers.length})
            </h4>
            <div className="space-y-1">
              {roleMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => onSelectUser?.(member)}
                  className="w-full text-left flex items-center gap-3 p-1.5 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors group"
                >
                  <div className="relative shrink-0">
                    <Avatar className="w-8 h-8">
                       <AvatarImage src={member.avatar} />
                       <AvatarFallback name={member.username} className="bg-primary/10 text-primary text-xs">{member.username?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full"></div>
                  </div>
                  <span className="font-medium text-sm text-foreground truncate">
                    {member.name} {member.id === currentUserId && "(You)"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {Object.entries(offlineByRole).map(([role, roleMembers]) => (
          <div key={`offline-${role}`} className="mb-4 mt-6">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {role} — Offline ({roleMembers.length})
            </h4>
            <div className="space-y-1">
              {roleMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => onSelectUser?.(member)}
                  className="w-full text-left flex items-center gap-3 p-1.5 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors group opacity-60 hover:opacity-100"
                >
                  <div className="relative shrink-0">
                    <Avatar className="w-8 h-8">
                       <AvatarImage src={member.avatar} />
                       <AvatarFallback name={member.username} className="bg-primary/10 text-primary text-xs">{member.username?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-gray-400 border-2 border-background rounded-full"></div>
                  </div>
                  <span className="font-medium text-sm text-foreground truncate">{member.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>
    </aside>
  )
}
