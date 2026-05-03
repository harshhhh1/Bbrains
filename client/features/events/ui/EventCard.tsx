"use client";

import React from "react";
import { 
  Calendar, 
  MapPin, 
  Clock,
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Image from "next/image";
import { resolveApiFileUrl } from "@/lib/file-url";
import type { Event } from "@/services/api/client";

interface EventCardProps {
  event: Event;
  onClick: (event: Event) => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  return (
    <Card 
      className="overflow-hidden flex flex-col cursor-pointer transition-all hover:shadow-lg group border-border/60 hover:border-primary/50"
      onClick={() => onClick(event)}
    >
      {event.banner && (
        <div className="relative aspect-video w-full overflow-hidden">
          <Image 
            src={resolveApiFileUrl(event.banner)} 
            alt={event.title} 
            fill 
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">{event.title}</CardTitle>
          {event.type && (
            <Badge variant="secondary" className="shrink-0 capitalize">{event.type}</Badge>
          )}
        </div>
        <CardDescription className="flex items-center gap-1.5 font-medium">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          {format(new Date(event.date), "PPP")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-3 text-sm text-muted-foreground leading-relaxed">
          {event.description || "No description provided."}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2.5 border-t border-border/40 pt-4 bg-muted/5">
        {event.location && (
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary/70" />
            <span className="truncate">{event.location}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Clock className="h-3.5 w-3.5 text-primary/70" />
          <span>
            {format(new Date(event.startDate), "h:mm a")} - {format(new Date(event.endDate), "h:mm a")}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
