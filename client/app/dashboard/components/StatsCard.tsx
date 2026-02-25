"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
    label: string
    value: string | number
    icon: React.ReactNode
    iconBg?: string
    iconColor?: string
    trend?: string
    trendUp?: boolean
    className?: string
}

export default function StatsCard({ label, value, icon, iconBg = 'bg-blue-50', iconColor = 'text-blue-600', trend, trendUp, className }: StatsCardProps) {
    return (
        <Card className={cn('gap-0 py-5', className)}>
            <CardContent className="px-5">
                <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
                        <span className="text-2xl font-bold text-gray-900">{value}</span>
                        {trend && (
                            <span className={cn('text-xs font-medium', trendUp ? 'text-green-600' : 'text-gray-500')}>
                                {trend}
                            </span>
                        )}
                    </div>
                    <div className={cn('p-2.5 rounded-xl', iconBg)}>
                        <div className={cn('w-5 h-5', iconColor)}>{icon}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
