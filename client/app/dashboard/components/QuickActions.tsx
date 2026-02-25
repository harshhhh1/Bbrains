"use client"

import React from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface QuickAction {
    label: string
    href: string
    icon: React.ReactNode
    color?: string
}

interface QuickActionsProps {
    actions: QuickAction[]
}

export default function QuickActions({ actions }: QuickActionsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-800">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {actions.map((action) => (
                        <Link
                            key={action.label}
                            href={action.href}
                            className={cn(
                                'flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group',
                                action.color
                            )}
                        >
                            <div className="w-8 h-8 flex items-center justify-center text-gray-500 group-hover:text-blue-600 transition-colors">
                                {action.icon}
                            </div>
                            <span className="text-xs font-medium text-gray-600 group-hover:text-blue-700 text-center leading-tight">{action.label}</span>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
