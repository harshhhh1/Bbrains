"use client"

import { Trophy, Medal, Crown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { LeaderboardEntry } from "@/lib/types/api"

interface LeaderboardEntryRowProps {
  entry: LeaderboardEntry
  isCurrentUser: boolean
  sortBy: "xp" | "points"
}

export function LeaderboardEntryRow({ entry, isCurrentUser, sortBy }: LeaderboardEntryRowProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />
    return <span className="text-lg font-bold text-muted-foreground">{rank}</span>
  }

  const initials = entry.displayName?.[0] || `${entry.firstName?.[0] || ""}${entry.lastName?.[0] || ""}`.toUpperCase() || entry.username[0].toUpperCase()
  const displayName = entry.displayName || (entry.firstName && entry.lastName 
    ? `${entry.firstName} ${entry.lastName}` 
    : entry.username)

  const value = sortBy === "xp" ? entry.totalXp : entry.totalPoints
  const valueLabel = sortBy === "xp" ? "XP" : "Points"

  return (
    <div
      className={`flex items-center gap-4 rounded-lg border p-4 transition-all duration-300 animate-in fade-in slide-in-from-left-2 ${
        isCurrentUser 
          ? "border-primary bg-primary/5 dark:bg-primary/10" 
          : "bg-card hover:bg-muted/50"
      }`}
    >
      <div className="flex w-12 flex-shrink-0 items-center justify-center">
        {getRankIcon(entry.rank)}
      </div>

      <Avatar className="h-12 w-12">
        <AvatarImage src={entry.avatar} alt={displayName} />
        <AvatarFallback className="bg-muted">{initials}</AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-semibold">
          {displayName}
          {isCurrentUser && (
            <span className="ml-2 text-xs text-muted-foreground">(You)</span>
          )}
        </span>
        <span className="truncate text-sm text-muted-foreground">@{entry.username}</span>
      </div>

      <div className="flex flex-col items-end text-right">
        <span className="text-xl font-bold text-primary">{value.toLocaleString()}</span>
        <span className="text-xs text-muted-foreground">{valueLabel}</span>
      </div>
    </div>
  )
}

interface TopThreeProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
  sortBy: "xp" | "points"
}

export function TopThreePodium({ entries, sortBy, currentUserId }: TopThreeProps) {
  const topThree = entries.slice(0, 3)
  
  if (topThree.length < 3) return null

  const ranks = [
    { entry: topThree[1], color: "bg-gray-400", label: "2nd" },
    { entry: topThree[0], color: "bg-yellow-500", label: "1st" },
    { entry: topThree[2], color: "bg-amber-600", label: "3rd" }
  ]

  return (
    <div className="mb-8 flex justify-center gap-2 px-4">
      {ranks.map((item, idx) => {
        const e = item.entry
        const initials = e.displayName?.[0] || `${e.firstName?.[0] || ""}${e.lastName?.[0] || ""}`.toUpperCase() || e.username[0].toUpperCase()
        const displayName = e.displayName || (e.firstName && e.lastName 
          ? `${e.firstName} ${e.lastName}` 
          : e.username)
        const value = sortBy === "xp" ? e.totalXp : e.totalPoints
        
        return (
          <div
            key={e.userId}
            className={`flex flex-col items-center animate-in fade-in zoom-in duration-300 ${idx === 1 ? "-mt-4" : ""}`}
          >
            <div className="mb-2">
              <Avatar className={`h-16 w-16 border-4 ${item.color} bg-background`}>
                <AvatarImage src={e.avatar} alt={displayName} />
                <AvatarFallback className="bg-muted">{initials}</AvatarFallback>
              </Avatar>
            </div>
            
            <span className="max-w-20 truncate text-sm font-medium">
              {displayName}
            </span>
            <span className="text-xs text-muted-foreground">@{e.username}</span>
            <span className="mt-1 font-bold">{value.toLocaleString()} {sortBy === "xp" ? "XP" : "Pts"}</span>
            
            <div className={`mt-2 flex w-full items-center justify-center rounded-t-lg ${item.color} py-2`}>
              <Trophy className="mr-1 h-4 w-4 text-white" />
              <span className="font-bold text-white">#{item.label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}