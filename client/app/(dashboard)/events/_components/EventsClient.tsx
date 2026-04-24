"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Calendar, 
  MapPin, 
  Plus, 
  Search, 
  Filter, 
  Loader2, 
  Clock,
  ExternalLink
} from "lucide-react";
import { eventApi, Event } from "@/services/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreateEventModal } from "./CreateEventModal";
import { useHasPermission } from "@/components/providers/permissions-provider";
import { format } from "date-fns";
import Image from "next/image";
import { resolveApiFileUrl } from "@/lib/file-url";

export function EventsClient() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">
            Manage and view upcoming college events.
          </p>
        </div>
        {canCreateEvent && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden flex flex-col">
              {event.banner && (
                <div className="relative aspect-video w-full">
                  <Image 
                    src={resolveApiFileUrl(event.banner)} 
                    alt={event.title} 
                    fill 
                    className="object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                  {event.type && (
                    <Badge variant="secondary" className="shrink-0">{event.type}</Badge>
                  )}
                </div>
                <CardDescription className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(event.date), "PPP")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {event.description || "No description provided."}
                </p>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-2 border-t pt-4">
                {event.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {format(new Date(event.startDate), "MMM d")} - {format(new Date(event.endDate), "MMM d, yyyy")}
                  </span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed text-center">
          <Calendar className="mb-2 h-10 w-10 text-muted-foreground opacity-20" />
          <h3 className="text-lg font-medium">No events found</h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery ? "Try adjusting your search query." : "There are no events scheduled yet."}
          </p>
        </div>
      )}

      <CreateEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchEvents}
      />
    </div>
  );
}
