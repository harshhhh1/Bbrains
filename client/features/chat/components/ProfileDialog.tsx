"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    VisuallyHidden,
} from "@/components/ui/dialog"
import type { Member } from "@/features/chat/data"
import { Calendar, X } from "lucide-react"

interface ProfileDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    member: Member | null
}

export function ProfileDialog({ open, onOpenChange, member }: ProfileDialogProps) {
    if (!member) return null

    const statusColors: Record<string, string> = {
        "online": "#23a55a",
        "idle": "#f0b232",
        "offline": "#80848e"
    }
    const memberStatus = member.status || "offline"

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="w-full max-w-[340px] overflow-hidden border-none bg-[#111214] p-0 text-[#dbdee1] shadow-[0_24px_64px_rgba(0,0,0,0.35)] rounded-[16px]"
            >
                <DialogTitle>
                    <VisuallyHidden>Profile Details for {member.name}</VisuallyHidden>
                </DialogTitle>

                <div className="relative w-full">
                    {/* Header with SVG Banner Mask */}
                    <div className="relative h-[120px]">
                        <svg className="block w-full h-full" viewBox="0 0 340 120" preserveAspectRatio="none">
                            <mask id="dialog-banner-mask">
                                <rect fill="white" x="0" y="0" width="100%" height="100%" />
                                <circle fill="black" cx="58" cy="112" r="46" />
                            </mask>
                            <foreignObject x="0" y="0" width="100%" height="100%" mask="url(#dialog-banner-mask)">
                                <div
                                    className="h-full w-full"
                                    style={{
                                        background: 'linear-gradient(45deg, #5865F2, #7289da, #4e5d94)',
                                        backgroundColor: '#1c1d22'
                                    }}
                                />
                            </foreignObject>
                        </svg>

                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            aria-label="Close profile dialog"
                            className="absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="relative px-4 pb-4">
                        {/* Avatar with Status Mask */}
                        <div className="absolute -top-12 left-4">
                            <div className="relative inline-block">
                                <svg width="92" height="92" viewBox="0 0 92 92" className="block">
                                    <mask id="dialog-avatar-mask">
                                        <circle fill="white" cx="40" cy="40" r="40" />
                                        <circle fill="black" cx="68" cy="68" r="14" />
                                    </mask>
                                    <foreignObject x="0" y="0" width="80" height="80" mask="url(#dialog-avatar-mask)">
                                        <Avatar className="h-20 w-20 border-0 bg-[#313338]">
                                            <AvatarImage src={member.avatar || undefined} className="object-cover" />
                                            <AvatarFallback className="flex items-center justify-center bg-[#5865F2] text-xl font-bold text-white">
                                                {member.username?.[0] || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </foreignObject>
                                    {/* Status Dot */}
                                    <circle cx="68" cy="68" r="10" fill={statusColors[memberStatus]} stroke="#111214" strokeWidth="4" />
                                </svg>
                            </div>
                        </div>

                        {/* Identity Card Section */}
                        <div className="mt-14 space-y-3 rounded-[8px] bg-[#1e1f22] p-3 shadow-sm">
                            <div>
                                <h1 className="text-xl font-bold leading-tight text-white">
                                    {member.name}
                                </h1>
                                <p className="text-sm font-medium text-[#b5bac1]">@{member.username}</p>
                            </div>

                            <div className="h-[1px] bg-[#2e3035]" />

                            {/* Additional Info Badges */}
                            <div className="flex flex-wrap gap-1">
                                <span className="rounded-[4px] bg-[#2b2d31] px-2 py-1 text-[11px] font-medium text-[#dbdee1]">
                                    {member.pronouns || "Member"}
                                </span>
                                {member.grade && member.grade !== "N/A" && member.grade !== "NA" && (
                                    <span className="rounded-[4px] bg-[#2b2d31] px-2 py-1 text-[11px] font-medium text-[#dbdee1]">
                                        {member.grade}
                                    </span>
                                )}
                            </div>

                            {/* Roles Section */}
                            <div className="space-y-1.5">
                                <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#b5bac1]">Roles</h3>
                                <div className="flex flex-wrap gap-1">
                                    {member.roles.length > 0 ? (
                                        member.roles.map((role) => (
                                            <span
                                                key={role}
                                                className="flex items-center gap-1 rounded-[4px] bg-[#2b2d31] px-2 py-1 text-[11px] font-medium text-[#dbdee1]"
                                                style={{ borderLeft: '2px solid #5865f2' }}
                                            >
                                                <div className="h-2 w-2 rounded-full bg-[#5865f2]" />
                                                {role}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs capitalize text-[#949ba4]">{member.type}</span>
                                    )}
                                </div>
                            </div>

                            <div className="h-[1px] bg-[#2e3035]" />

                            {/* About Me */}
                            <div className="space-y-1">
                                <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#b5bac1]">About Me</h3>
                                <p className="text-sm leading-snug text-[#dbdee1]">
                                    A vibrant member of the Bbrains community.
                                </p>
                            </div>

                            {/* Member Since */}
                            <div className="space-y-1">
                                <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#b5bac1]">Bbrains Member Since</h3>
                                <div className="flex items-center gap-2 text-sm text-[#dbdee1]">
                                    <Calendar className="h-3.5 w-3.5 opacity-60" />
                                    <span>Just Recently</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
