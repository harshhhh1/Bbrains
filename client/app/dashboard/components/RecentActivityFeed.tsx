"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { cn } from '@/lib/utils'

dayjs.extend(relativeTime)

interface ActivityItem {
    id: string | number
    label: string
    sublabel?: string
    date: string
    dotColor?: string
}

interface RecentActivityFeedProps {
    title: string
    items: ActivityItem[]
    emptyMessage?: string
}

export default function RecentActivityFeed({ title, items, emptyMessage = 'No recent activity' }: RecentActivityFeedProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-800">{title}</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4">
                {items.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">{emptyMessage}</p>
                ) : (
                    <ul className="space-y-3">
                        {items.map((item) => (
                            <li key={item.id} className="flex items-start gap-3">
                                <div className={cn('mt-1.5 w-2 h-2 rounded-full flex-shrink-0', item.dotColor || 'bg-blue-400')} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{item.label}</p>
                                    {item.sublabel && (
                                        <p className="text-xs text-gray-500 truncate">{item.sublabel}</p>
                                    )}
                                </div>
                                <span className="text-xs text-gray-400 flex-shrink-0">{dayjs(item.date).fromNow()}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    )
}
