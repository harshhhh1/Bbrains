"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Loader2, 
} from "lucide-react";
import { eventApi, Event } from "@/services/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
} from "@/components/ui/card";
import { toast } from "sonner";
import { CreateEventModal } from "./CreateEventModal";
import { EventCard } from "./EventCard";
import { EventDetailsDialog } from "./EventDetailsDialog";
import { useHasPermission } from "@/components/providers/permissions-provider";

export function EventsClient() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const canCreateEvent = useHasPermission("teacher") || useHasPermission("admin");

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await eventApi.getEvents();
      if (response.success && response.data) {
        setEvents(response.data);
      } else {
        toast.error("Failed to load events");
      }
    } catch (error) {
      toast.error("An error occurred while loading events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto w-full max-w-7xl p-6 md:p-12 space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Institutional Events</h1>
          <p className="text-muted-foreground mt-2 text-lg font-medium">
            Campus broadcasts, academic seminars, and cultural meets.
          </p>
        </div>
        {canCreateEvent && (
          <Button size="lg" className="rounded-2xl font-bold px-6 shadow-lg shadow-primary/20" onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-5 w-5" />
            Host Event
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-muted/30 p-4 rounded-3xl border border-border/50">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            placeholder="Search the event registry..."
            className="w-full bg-card border border-border/60 shadow-inner rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl shrink-0">
          <Filter className="h-5 w-5" />
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Syncing Calendar...</p>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              onClick={handleEventClick} 
            />
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-border/40 bg-muted/10 rounded-3xl">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Calendar className="mb-6 h-16 w-16 text-muted-foreground/20" />
            <h3 className="text-2xl font-bold">No Records Found</h3>
            <p className="text-muted-foreground mt-2 max-w-xs">
              {searchQuery ? "No events match your current filter parameters." : "There are currently no events listed in the institution calendar."}
            </p>
          </CardContent>
        </Card>
      )}

      <CreateEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchEvents}
      />

      <EventDetailsDialog
        event={selectedEvent}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(null as any)}
      />
    </div>
  );
}
