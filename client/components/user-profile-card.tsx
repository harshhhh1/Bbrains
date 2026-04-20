"use client"

import React from 'react'
import Link from "next/link"
import { Pencil } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePermissions } from "@/hooks/use-permissions"

interface UserProfileCardProps {
    user: {
        firstName?: string;
        lastName?: string;
        fullName?: string;
        username?: string;
        imageUrl?: string;
        level?: number;
        xp?: number;
        bio?: string;
        createdAt?: Date | string | null;
    } | null;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
    const { roles } = usePermissions();
    const joinedDate = user?.createdAt ? new Date(user.createdAt) : null
    const hasJoinedDate = Boolean(joinedDate && !Number.isNaN(joinedDate.getTime()))
    const displayName =
        user?.fullName || user?.firstName
            ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
            : "Anonymous User"

    return (
        <div className="absolute bottom-20 left-6 z-50 w-[300px] overflow-hidden rounded-[16px] bg-[#111214] shadow-[0_8px_16px_rgba(0,0,0,0.24)] text-[#dbdee1] font-sans">
            {/* Header with SVG Banner */}
            <div className="relative h-[60px]">
                <div 
                    className="h-full w-full" 
                    style={{ 
                        background: 'linear-gradient(45deg, #5865F2, #eb459e, #fee75c)',
                        backgroundColor: '#1c1d22' 
                    }} 
                />

                {/* Edit Button */}
                <div className="absolute top-3 right-3">
                    <Link
                        href="/settings"
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
                    >
                        <Pencil className="h-4 w-4" />
                    </Link>
                </div>

                {/* Avatar positioned to overlap banner */}
                <div className="absolute -bottom-[40px] left-4">
                    <div className="relative h-[80px] w-[80px] rounded-full border-[6px] border-[#111214] bg-[#111214]">
                        <Avatar className="h-full w-full">
                            <AvatarImage src={user?.imageUrl || undefined} className="object-cover" />
                            <AvatarFallback className="flex items-center justify-center bg-[#5865F2] text-xl font-bold text-white">
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>

            {/* Content Wrapper */}
            <div className="relative px-4 pb-4 pt-[52px]">
                {/* Identity Card Section */}
                <div className="space-y-3 rounded-[8px] bg-[#1e1f22] p-3 shadow-sm">
                    <div>
                        <h1 className="text-xl font-bold leading-tight text-white">
                            {displayName}
                        </h1>
                        <p className="text-sm font-medium text-[#b5bac1]">@{user?.username || "user"}</p>
                    </div>

                    <div className="h-[1px] bg-[#2e3035]" />

                    {/* Roles & Level Section */}
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#b5bac1]">Roles</h3>
                            <div className="flex flex-wrap gap-1">
                                {roles && roles.length > 0 ? (
                                    roles.map((role) => (
                                        <span 
                                            key={role.id} 
                                            className="flex items-center gap-1 rounded-[4px] bg-[#2b2d31] px-2 py-1 text-[11px] font-medium"
                                            style={{ borderLeft: `2px solid ${role.color || '#5865f2'}` }}
                                        >
                                            <div 
                                                className="h-3 w-3 rounded-full" 
                                                style={{ backgroundColor: role.color || '#5865f2' }} 
                                            />
                                            {role.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="rounded-[4px] bg-[#2b2d31] px-2 py-1 text-[11px] font-medium">User</span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="space-y-1">
                                <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#b5bac1]">Level</h3>
                                <p className="text-xs font-bold text-white">Lvl {user?.level || 1}</p>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#b5bac1]">Progress</h3>
                                <p className="text-xs font-bold text-[#5865f2]">{user?.xp || 0} XP</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-[1px] bg-[#2e3035]" />

                    {/* About Me */}
                    <div className="space-y-1">
                        <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#b5bac1]">About Me</h3>
                        <p className="text-sm leading-snug text-[#dbdee1]">
                            {user?.bio || <span className="italic text-[#949ba4]">No bio yet...</span>}
                        </p>
                    </div>

                    {/* Member Since */}
                    <div className="space-y-1">
                        <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#b5bac1]">Bbrains Member Since</h3>
                        <div className="text-sm text-[#dbdee1]">
                            {hasJoinedDate
                                ? joinedDate?.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                                : "Just recently"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer / Status Note */}
            <div className="bg-[#1e1f22]/50 px-4 py-3">
                <input
                    className="w-full bg-transparent text-xs text-[#b5bac1] outline-none placeholder:text-[#949ba4]"
                    placeholder="Click to add a custom status note..."
                    type="text"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        </div>
    )
}