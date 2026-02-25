"use client"

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface Grade {
    grade: string
}

interface GradeDistributionChartProps {
    grades: Grade[]
}

const GRADE_COLORS: Record<string, string> = {
    'A': '#22c55e',
    'B': '#3b82f6',
    'C': '#f59e0b',
    'D': '#f97316',
    'F': '#ef4444',
}

export default function GradeDistributionChart({ grades }: GradeDistributionChartProps) {
    const distribution = grades.reduce<Record<string, number>>((acc, g) => {
        const key = g.grade?.charAt(0)?.toUpperCase() || 'N/A'
        acc[key] = (acc[key] || 0) + 1
        return acc
    }, {})

    const chartData = Object.entries(distribution).map(([grade, count]) => ({ grade, count }))

    if (chartData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-semibold text-gray-800">Grade Distribution</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-32 text-sm text-gray-400">
                    No grades yet
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-800">Grade Distribution</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="grade" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip
                            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                            labelStyle={{ fontWeight: 600 }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={index} fill={GRADE_COLORS[entry.grade] || '#6b7280'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
