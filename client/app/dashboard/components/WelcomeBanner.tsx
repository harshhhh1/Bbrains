"use client"

import React from 'react'
import dayjs from 'dayjs'

interface WelcomeBannerProps {
    name: string
    role: string
    avatarUrl?: string | null
}

export default function WelcomeBanner({ name, role, avatarUrl }: WelcomeBannerProps) {
    const hour = dayjs().hour()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

    const getInitials = (n: string) => n.slice(0, 2).toUpperCase()

    return (
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-5 text-white flex items-center justify-between">
            <div className="flex flex-col gap-1">
                <span className="text-blue-100 text-sm font-medium">{greeting}!</span>
                <h2 className="text-xl font-bold">{name}</h2>
                <span className="text-blue-200 text-xs capitalize">{role}</span>
            </div>
            <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
                {avatarUrl ? (
                    <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <span>{getInitials(name)}</span>
                )}
            </div>
        </div>
    )
}
