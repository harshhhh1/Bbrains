"use client";

import { useState } from "react";
import { 
  Trash2,
  ThumbsUp,
  Share2,
  Loader2,
  Users
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import type { Announcement, User as ProfileUser } from "@/services/api/client";

interface AnnouncementItemProps {
  announcement: Announcement;
  currentUser: ProfileUser | null;
  highlightedId: string | null;
  onDelete: (id: string | number) => void;
  onAcknowledge: (id: string | number) => void;
  onViewAcknowledged: (id: string | number) => void;
  acknowledging: boolean;
}

export function AnnouncementItem({
  announcement,
  currentUser,
  highlightedId,
  onDelete,
  onAcknowledge,
  onViewAcknowledged,
  acknowledging
}: AnnouncementItemProps) {
  const isAuthor = announcement.userId === currentUser?.id;
  const isAdmin = currentUser?.type === "admin" || currentUser?.type === "superadmin";
  const canDelete = isAuthor || isAdmin;
  const isHighlighted = String(highlightedId) === String(announcement.id);
  
  const hasAcknowledged = (announcement as any).acknowledgedBy?.some(
    (ack: any) => ack.userId === currentUser?.id
  );

  return (
    <div
      id={`announcement-${announcement.id}`}
      className={`p-6 rounded-2xl border transition-all duration-500 ${
        isHighlighted 
          ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
          : 'border-border/50 bg-card/50 hover:bg-card hover:border-border'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src={announcement.user?.userDetails?.avatar || ""} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {announcement.user?.userDetails?.firstName?.charAt(0)}
              {announcement.user?.userDetails?.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm">
                {announcement.user?.userDetails?.firstName} {announcement.user?.userDetails?.lastName}
              </h4>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary tracking-wider">
                {announcement.user?.type}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        
        {canDelete && (
          <button
            onClick={() => onDelete(announcement.id)}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <h3 className="text-lg font-bold text-foreground leading-tight tracking-tight">
          {announcement.title}
        </h3>
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
          {announcement.description}
        </p>
        
        {announcement.image && (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border shadow-inner">
            <Image 
              src={announcement.image} 
              alt="Announcement image" 
              fill 
              className="object-cover" 
            />
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAcknowledge(announcement.id)}
            disabled={hasAcknowledged || acknowledging}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              hasAcknowledged
                ? 'bg-emerald-500/10 text-emerald-600 cursor-default'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            } disabled:opacity-50`}
          >
            {acknowledging ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ThumbsUp className={`h-3.5 w-3.5 ${hasAcknowledged ? 'fill-current' : ''}`} />
            )}
            {hasAcknowledged ? "Acknowledged" : "Acknowledge"}
          </button>
          
          <button
            onClick={() => onViewAcknowledged(announcement.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted transition-all"
          >
            <Users className="h-3.5 w-3.5" />
            {(announcement as any).acknowledgedBy?.length || 0}
          </button>
        </div>

        <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
