"use client"

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog'
import { Megaphone, Plus, Trash2, Calendar } from 'lucide-react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

interface Announcement {
    id: number
    title: string
    content: string
    createdAt: string
    createdBy?: string
}

export default function AnnouncementsPage() {
    const { user, isLoading: authLoading } = useAuth()
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const canManage = user?.type === 'teacher' || user?.type === 'admin'

    const load = async () => {
        try {
            const data = await getAnnouncements()
            setAnnouncements(Array.isArray(data) ? data : [])
        } catch {
            setAnnouncements([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!authLoading) load()
    }, [authLoading])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        if (!title.trim() || !content.trim()) {
            setError('Title and content are required')
            return
        }
        try {
            setSubmitting(true)
            await createAnnouncement({ title: title.trim(), content: content.trim() })
            setTitle('')
            setContent('')
            setOpen(false)
            await load()
        } catch (err: any) {
            setError(err.message || 'Failed to create announcement')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await deleteAnnouncement(id)
            setAnnouncements((prev) => prev.filter((a) => a.id !== id))
        } catch {
            // ignore
        }
    }

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Megaphone size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Announcements</h1>
                        <p className="text-sm text-gray-500">Stay updated with the latest news</p>
                    </div>
                </div>

                {canManage && (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-2">
                                <Plus size={16} />
                                New
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Announcement</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4 mt-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Announcement title"
                                        maxLength={255}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Content</label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Announcement content..."
                                        rows={4}
                                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none resize-none"
                                    />
                                </div>
                                {error && (
                                    <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                                )}
                                <DialogFooter showCloseButton>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting ? 'Creating...' : 'Create'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-xl" />
                    ))}
                </div>
            ) : announcements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                    <Megaphone size={40} strokeWidth={1.5} />
                    <p className="text-sm">No announcements yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements.map((a) => (
                        <Card key={a.id} className="gap-0 py-0 overflow-hidden">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <h3 className="font-semibold text-gray-900 text-sm leading-snug">{a.title}</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">{a.content}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <Calendar size={12} />
                                            <span>{dayjs(a.createdAt).fromNow()}</span>
                                            {a.createdBy && <span>· by {a.createdBy}</span>}
                                        </div>
                                    </div>
                                    {canManage && (
                                        <button
                                            onClick={() => handleDelete(a.id)}
                                            className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
