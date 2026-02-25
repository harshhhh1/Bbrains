"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeaderboardEntry {
    rank: number
    user?: { username: string }
    score: number
    userId?: string
}

interface LeaderboardPreviewProps {
    entries: LeaderboardEntry[]
    currentUserId?: string
}

const RANK_STYLES = ['text-yellow-500', 'text-gray-400', 'text-amber-600']

export default function LeaderboardPreview({ entries, currentUserId }: LeaderboardPreviewProps) {
    const top5 = entries.slice(0, 5)

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Trophy size={16} className="text-yellow-500" />
                    <CardTitle className="text-sm font-semibold text-gray-800">Leaderboard</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
                {top5.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No leaderboard data</p>
                ) : (
                    <ul className="space-y-2">
                        {top5.map((entry, i) => {
                            const isCurrentUser = currentUserId && entry.userId === currentUserId
                            return (
                                <li
                                    key={entry.rank}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg px-3 py-2',
                                        isCurrentUser ? 'bg-blue-50' : 'hover:bg-gray-50'
                                    )}
                                >
                                    <span className={cn('text-sm font-bold w-5 text-center', RANK_STYLES[i] || 'text-gray-600')}>
                                        {entry.rank}
                                    </span>
                                    <span className={cn('flex-1 text-sm truncate', isCurrentUser ? 'font-semibold text-blue-700' : 'text-gray-700')}>
                                        {entry.user?.username || 'Unknown'}
                                        {isCurrentUser && ' (you)'}
                                    </span>
                                    <span className="text-xs font-medium text-gray-500">{entry.score} XP</span>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </CardContent>
        </Card>
    )
}
