"use client"

import React, { useState, useEffect } from "react"
import { CheckCircle2, Search, XCircle, Clock, Trash2, Eye, ChevronLeft, ChevronRight, X } from "lucide-react"
import { suggestionApi, Suggestion } from "@/services/api/client"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}

const statusConfig: Record<Suggestion["status"], { icon: React.ReactNode; class: string }> = {
    pending: { icon: <Clock className="size-3 mr-1" />, class: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
    reviewed: { icon: <Search className="size-3 mr-1" />, class: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    implemented: { icon: <CheckCircle2 className="size-3 mr-1" />, class: "bg-green-500/10 text-green-500 border-green-500/20" },
    rejected: { icon: <XCircle className="size-3 mr-1" />, class: "bg-red-500/10 text-red-500 border-red-500/20" },
}

export function SuggestionsManager() {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<Suggestion | null>(null)
    const [viewOpen, setViewOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const pageSize = 12

    const fetchSuggestions = async () => {
        setLoading(true)
        try {
            const res = await suggestionApi.getSuggestions()
            if (res.success) {
                setSuggestions(res.data || [])
            } else {
                toast.error(res.message || "Failed to load suggestions")
            }
        } catch (error) {
            toast.error("Failed to load suggestions")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSuggestions()
    }, [])

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            const res = await suggestionApi.updateStatus(id, status)
            if (res.success) {
                toast.success(`Status updated to ${status}`)
                fetchSuggestions()
                if (selected?.id === id) setViewOpen(false)
            } else {
                toast.error(res.message || "Failed to update status")
            }
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    const handleDelete = async (id: number) => {
        try {
            const res = await suggestionApi.deleteSuggestion(id)
            if (res.success) {
                toast.success("Suggestion deleted")
                fetchSuggestions()
            } else {
                toast.error(res.message || "Failed to delete")
            }
        } catch (error) {
            toast.error("Failed to delete")
        }
    }

    const filtered = search.trim()
        ? suggestions.filter((row) =>
            row.title?.toLowerCase().includes(search.toLowerCase()) ||
            row.content?.toLowerCase().includes(search.toLowerCase())
        )
        : suggestions

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

    return (
        <div className="space-y-6">
            <SectionHeader 
                title="User Suggestions" 
                subtitle="Review and manage feedback from students"
            />

            <div className="flex flex-col gap-3">
                <div className="relative max-w-xs">
                    <Input
                        placeholder="Search suggestions..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        className="h-9 text-sm"
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-40 rounded-xl bg-muted/30 animate-pulse" />
                        ))}
                    </div>
                ) : paged.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                        {search ? "No suggestions match your search" : "No suggestions found"}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paged.map((row) => (
                            <div
                                key={row.id}
                                className="group flex flex-col gap-3 p-4 rounded-xl border border-border bg-background hover:bg-muted/30 transition-all hover:border-muted-foreground/20"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                                        <span className="font-semibold text-sm truncate">{row.title}</span>
                                        <span className="text-xs text-muted-foreground line-clamp-2">{row.content}</span>
                                    </div>
                                    <Badge variant="outline" className={cn("text-[10px] uppercase font-black shrink-0 ml-2", statusConfig[row.status]?.class)}>
                                        {statusConfig[row.status]?.icon}
                                        {row.status}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium text-foreground">
                                            {row.user?.userDetails?.firstName} {row.user?.userDetails?.lastName}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground uppercase">@{row.user?.username}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => { setSelected(row); setViewOpen(true); }}
                                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                        >
                                            <Eye className="size-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(row.id)}
                                            className="p-1.5 text-red-500/80 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                        <span>{filtered.length} suggestion{filtered.length !== 1 ? "s" : ""}</span>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                                <ChevronLeft className="size-3.5" />
                            </Button>
                            <span className="px-2">Page {page} of {totalPages}</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                                <ChevronRight className="size-3.5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <Drawer open={viewOpen} onOpenChange={setViewOpen} direction="right">
                <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
                    <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
                        <DrawerHeader className="border-b border-border/60 p-6 text-left">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="text-[10px] uppercase font-bold">
                                            Suggestion #{selected?.id}
                                        </Badge>
                                    </div>
                                    <DrawerTitle className="text-xl font-bold">{selected?.title}</DrawerTitle>
                                    <DrawerDescription className="text-muted-foreground text-xs">
                                        Submitted by {selected?.user?.username} on {selected && formatDate(selected.createdAt)}
                                    </DrawerDescription>
                                </div>
                                <DrawerClose asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </DrawerClose>
                            </div>
                        </DrawerHeader>

                        <div className="flex-1 space-y-6 overflow-y-auto p-6">
                            <div className="p-4 bg-muted/30 rounded-2xl border border-border/50 text-sm whitespace-pre-wrap leading-relaxed">
                                {selected?.content}
                            </div>

                            <div className="flex flex-col gap-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Update Status</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className={cn("text-[10px] font-bold h-9", selected?.status === 'pending' && "bg-yellow-50 border-yellow-200 text-yellow-700")}
                                        onClick={() => selected && handleUpdateStatus(selected.id, 'pending')}
                                    >
                                        Pending
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className={cn("text-[10px] font-bold h-9", selected?.status === 'reviewed' && "bg-blue-50 border-blue-200 text-blue-700")}
                                        onClick={() => selected && handleUpdateStatus(selected.id, 'reviewed')}
                                    >
                                        Reviewed
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className={cn("text-[10px] font-bold h-9", selected?.status === 'implemented' && "bg-green-50 border-green-200 text-green-700")}
                                        onClick={() => selected && handleUpdateStatus(selected.id, 'implemented')}
                                    >
                                        Done
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className={cn("text-[10px] font-bold h-9", selected?.status === 'rejected' && "bg-red-50 border-red-200 text-red-700")}
                                        onClick={() => selected && handleUpdateStatus(selected.id, 'rejected')}
                                    >
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <DrawerFooter className="border-t border-border/60 p-6">
                            <DrawerClose asChild>
                                <Button variant="outline" className="w-full">Close</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    )
}
