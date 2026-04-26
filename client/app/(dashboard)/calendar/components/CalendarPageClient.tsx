"use client"

import React, { useState, useEffect } from "react"
import { BigCalendar } from "@/app/(dashboard)/calendar/_components/BigCalendar"
import { EventCalender } from "@/app/(dashboard)/calendar/_components/EventCalender"
import { EventDetailsDrawer } from "@/app/(dashboard)/calendar/_components/EventDetailsDrawer"
import { DashboardContent } from "@/components/dashboard-content"
import { eventApi, Event as ApiEvent } from "@/services/api/client"

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

    return (
        <DashboardContent maxWidth="max-w-[1600px]">
            <div className="flex flex-col gap-6 h-full">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campus Calendar</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">View and manage all academic and campus events</p>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 h-full">
                        {loading ? (
                            <div className="h-[700px] w-full bg-white dark:bg-gray-950 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    <p className="text-sm text-gray-500">Loading calendar...</p>
                                </div>
                            </div>
                        ) : (
                            <BigCalendar events={events} onSelectEvent={handleSelectEvent} />
                        )}
                    </div>
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <EventCalender events={events.slice(0, 5)} />
                    </div>
                </div>
            </div>

            <EventDetailsDrawer 
                open={isDialogOpen} 
                onOpenChange={setIsDialogOpen} 
                event={selectedEvent} 
            />
        </DashboardContent>
    )
}
