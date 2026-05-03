"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    VisuallyHidden,
} from "@/components/ui/dialog"
import type { Member } from "@/features/chat/api/data"
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
                    {/* Banner Section */}
                    <div className="relative h-[105px]">
                        <div
                            className="h-full w-full"
                            style={{
                                background: 'linear-gradient(45deg, #5865F2, #7289da, #4e5d94)',
                                backgroundColor: '#1c1d22'
                            }}
                        />

                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            aria-label="Close profile dialog"
                            className="absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Avatar - Overlapping Banner */}
                    <div className="relative -mt-10 px-4">
                        <div className="relative h-20 w-20 rounded-full border-[6px] border-[#111214] bg-[#111214]">
                            <Avatar className="h-full w-full">
                                <AvatarImage src={member.avatar || undefined} className="object-cover" />
                                <AvatarFallback className="flex items-center justify-center bg-[#5865F2] text-xl font-bold text-white">
                                    {member.username?.[0] || "U"}
                                </AvatarFallback>
                            </Avatar>
                            
                            {/* Status Dot */}
                            <div 
                                className="absolute bottom-0 right-0 h-5 w-5 rounded-full border-[3px] border-[#111214]"
                                style={{ backgroundColor: statusColors[memberStatus] }}
                            />
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="px-4 pb-4 pt-3">
                        {/* Identity Card Section */}
                        <div className="space-y-3 rounded-[8px] bg-[#1e1f22] p-3 shadow-sm">
                            <div>
                                <h1 className="text-xl font-bold leading-tight text-white">
                                    {member.name}
                                </h1>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-sm font-medium text-[#b5bac1]">@{member.username}</p>
                                    <span 
                                        className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-black/20"
                                        style={{ color: statusColors[memberStatus] }}
                                    >
                                        {memberStatus}
                                    </span>
                                </div>
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