"use client"

import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface XPProgressChartProps {
    xp: number
    level: number
}

export default function XPProgressChart({ xp, level }: XPProgressChartProps) {
    const xpPerLevel = 100
    const currentLevelXp = xp % xpPerLevel
    const nextLevelXp = xpPerLevel
    const progressPct = Math.min(100, Math.round((currentLevelXp / nextLevelXp) * 100))

    const chartData = Array.from({ length: 7 }, (_, i) => ({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        xp: Math.max(0, xp - (6 - i) * 15),
    }))

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-gray-800">XP Progress</CardTitle>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">Level {level}</span>
                        <div className="w-24 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                        <span className="text-xs text-gray-500">{progressPct}%</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                            labelStyle={{ fontWeight: 600 }}
                        />
                        <Area type="monotone" dataKey="xp" stroke="#3b82f6" strokeWidth={2} fill="url(#xpGrad)" dot={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
