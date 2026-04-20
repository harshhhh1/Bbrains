"use client"

import React, { useState, useEffect } from "react"
import { BigCalendar } from "@/app/(dashboard)/calendar/_components/BigCalendar"
import { EventCalender } from "@/app/(dashboard)/calendar/_components/EventCalender"
import { DashboardContent } from "@/components/dashboard-content"
import { eventApi, Event as ApiEvent } from "@/services/api/client"
import { 
    Drawer, 
    DrawerClose, 
    DrawerContent, 
    DrawerDescription, 
    DrawerFooter, 
    DrawerHeader, 
    DrawerTitle 
} from "@/components/ui/drawer"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Calendar as CalendarIcon, Info, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CalendarPage() {
    const [events, setEvents] = useState<ApiEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedEvent, setSelectedEvent] = useState<ApiEvent | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true)
            try {
                const response = await eventApi.getEvents()
                if (response.success && response.data) {
                    setEvents(response.data)
                }
            } catch (error) {
                console.error("Failed to fetch events:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchEvents()
    }, [])

    const handleSelectEvent = (event: ApiEvent) => {
        setSelectedEvent(event)
        setIsDialogOpen(true)
    }

    const formatEventDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatEventTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <DashboardContent maxWidth="max-w-[1600px]">
            <div className="flex flex-col gap-6 h-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campus Calendar</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">View and manage all academic and campus events</p>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Calendar View */}
                    <div className="lg:col-span-3 h-full">
                        {loading ? (
                            <div className="h-[700px] w-full bg-white dark:bg-gray-950 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    <p className="text-sm text-gray-500">Loading calendar...</p>
                                </div>
                            </div>
                        ) : (
                            <BigCalendar 
                                events={events} 
                                onSelectEvent={handleSelectEvent} 
                            />
                        )}
                    </div>

                    {/* Sidebar: Mini Calendar & Event List */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <EventCalender events={events.slice(0, 5)} />
                    </div>
                </div>
            </div>

            {/* Event Details Drawer */}
            <Drawer open={isDialogOpen} onOpenChange={setIsDialogOpen} direction="right">
                <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
                    <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
                        {selectedEvent && (
                            <>
                                <div className="h-40 bg-gradient-to-br from-brand-orange/20 via-brand-orange/10 to-transparent relative flex-shrink-0">
                                    <div className="absolute top-6 right-6 z-10">
                                        <DrawerClose asChild>
                                            <Button variant="ghost" size="icon" className="rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </DrawerClose>
                                    </div>
                                    <div className="absolute -bottom-4 left-6 p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
                                        <Badge variant="secondary" className="bg-brand-orange/10 text-brand-orange border-none uppercase text-[10px] font-black tracking-widest px-3 py-1">
                                            {selectedEvent.type || "Event"}
                                        </Badge>
                                    </div>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-8 pt-12 space-y-8">
                                    <DrawerHeader className="p-0 text-left">
                                        <DrawerTitle className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">
                                            {selectedEvent.title}
                                        </DrawerTitle>
                                        <DrawerDescription className="mt-4 text-base font-medium text-gray-600 dark:text-gray-400 leading-relaxed bg-muted/20 p-4 rounded-2xl border border-border/50">
                                            {selectedEvent.description || "No description provided for this event."}
                                        </DrawerDescription>
                                    </DrawerHeader>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 shadow-sm">
                                                <CalendarIcon size={22} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Schedule</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {formatEventDate(selectedEvent.startDate)}
                                                </p>
                                                {new Date(selectedEvent.startDate).toDateString() !== new Date(selectedEvent.endDate).toDateString() && (
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                                                        until {formatEventDate(selectedEvent.endDate)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400 shadow-sm">
                                                <Clock size={22} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Time Slot</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {formatEventTime(selectedEvent.startDate)} - {formatEventTime(selectedEvent.endDate)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400 shadow-sm">
                                                <MapPin size={22} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Location</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedEvent.location || "Main Campus"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <DrawerFooter className="p-6 border-t border-border/60 bg-muted/5 flex-shrink-0">
                                    <DrawerClose asChild>
                                        <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs">
                                            Close View
                                        </Button>
                                    </DrawerClose>
                                </DrawerFooter>
                            </>
                        )}
                    </div>
                </DrawerContent>
            </Drawer>
        </DashboardContent>
    )
}
