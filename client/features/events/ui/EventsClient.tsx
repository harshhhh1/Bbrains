"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Calendar, 
  Plus, 
} from "lucide-react";
import { eventApi, Event } from "@/services/api/client";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Grid, PageContainer, PageHeader } from "@/components/layout/page-primitives";
import { LoadingState } from "@/components/ui/loading-state";
import { SearchField, Toolbar } from "@/components/ui/toolbar";
import { toast } from "sonner";
import { CreateEventModal } from "@/features/events/ui/CreateEventModal";
import { EventCard } from "@/features/events/ui/EventCard";
import { EventDetailsDialog } from "@/features/events/ui/EventDetailsDialog";
import { useHasPermission } from "@/components/providers/permissions-provider";

export function EventsClient() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const canCreateEvent = useHasPermission("create_event");

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
    <PageContainer padding="spacious" gap="xl">
      <PageHeader
        title="School Events"
        description="Announcements, seminars, and cultural meets."
        titleClassName="text-4xl font-black tracking-tight"
        descriptionClassName="text-lg font-medium"
        actions={canCreateEvent && (
          <Button size="lg" className="rounded-2xl font-bold px-6 shadow-lg shadow-primary/20" onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-5 w-5" />
            Host Event
          </Button>
        )}
      />

      <Toolbar className="rounded-3xl p-4">
          <SearchField
            wrapperClassName="group flex-1"
            iconClassName="left-4 size-5 group-focus-within:text-primary"
            placeholder="Search events..."
            className="rounded-2xl border-border/60 bg-card py-4 pl-12 pr-4 shadow-inner focus-visible:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
      </Toolbar>

      {loading ? (
        <LoadingState label="Syncing Calendar..." className="py-20" iconClassName="size-10" />
      ) : filteredEvents.length > 0 ? (
        <Grid gap="lg" className="sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              onClick={handleEventClick} 
            />
          ))}
        </Grid>
      ) : (
        <EmptyState
          icon={<Calendar className="size-16" />}
          title="No Records Found"
          description={searchQuery ? "No events match your current filters." : "There are currently no events listed in the school calendar."}
          className="rounded-3xl py-20"
        />
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
    </PageContainer>
  );
}
