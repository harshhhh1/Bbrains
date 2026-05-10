"use client";

import React from "react";
import { Calendar, MapPin, Clock, X, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Image from "next/image";
import { resolveApiFileUrl } from "@/lib/file-url";
import { toast } from "sonner";

export function EventDetailsDialog({ event, isOpen, onClose }) {
  if (!event) return null;

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(`${url}?id=${event.id}`);
    toast.success("Event link copied to clipboard");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className="relative h-64 w-full">
          {event.banner ? (
            <Image
              src={resolveApiFileUrl(event.banner)}
              alt={event.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Calendar className="h-20 w-20 text-primary/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-all z-10"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary hover:bg-primary text-white border-none px-3 py-0.5 capitalize font-bold tracking-wider text-[10px]">
                {event.type || "General Event"}
              </Badge>
              <span className="text-xs font-medium opacity-80 flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                {format(new Date(event.date), "MMMM d, yyyy")}
              </span>
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight leading-tight">
              {event.title}
            </DialogTitle>
          </div>
        </div>

        <div className="p-8 space-y-8 bg-card">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Time Frame
                </p>
                <p className="text-sm font-bold">
                  {format(new Date(event.startDate), "h:mm a")} -{" "}
                  {format(new Date(event.endDate), "h:mm a")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Location
                </p>
                <p className="text-sm font-bold truncate">
                  {event.location || "Main Campus"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              About the Event
            </h4>
            <DialogDescription className="text-base text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {event.description ||
                "Join us for this institution-wide event. Stay tuned for more details and announcements regarding the schedule and speakers."}
            </DialogDescription>
          </div>

          <div className="pt-6 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                {event.title.charAt(0)}
              </div>
              <span className="text-xs font-bold text-muted-foreground">
                Hosted by Bbrains Institution
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl font-bold gap-2"
              onClick={handleShare}
            >
              <Share2 className="h-3.5 w-3.5" />
              Share Event
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
