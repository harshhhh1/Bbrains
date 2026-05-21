"use client";

import React from "react";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerDescription, 
  DrawerClose, 
  DrawerFooter 
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users,
  X,
  Loader2,
  Calendar
} from "lucide-react";
import { formatRelativeTime } from "@/lib/date-utils";

interface AcknowledgedUser {
  userId: string;
  userDetails?: {
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };
  createdAt: string;
}

interface AcknowledgeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: AcknowledgedUser[];
  loading: boolean;
}

export function AcknowledgeDrawer({
  open,
  onOpenChange,
  users,
  loading
}: AcknowledgeDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
        <div className="flex h-dvh max-h-dvh flex-col overflow-hidden">
          <DrawerHeader className="border-b border-border/60 p-6 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <DrawerTitle className="text-xl font-black flex items-center gap-2">
                   <Users className="h-5 w-5 text-primary" />
                   Acknowledge Log
                </DrawerTitle>
                <DrawerDescription>
                  List of users who have confirmed receipt of this announcement.
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                <p className="text-sm font-bold tracking-widest uppercase">Syncing List...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border-2 border-dashed border-border/50 bg-muted/20">
                <Users className="h-10 w-10 text-muted-foreground/30 mb-4" />
                <p className="text-sm font-bold text-muted-foreground">No acknowledgments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((ack) => (
                  <div key={ack.userId} className="flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-card/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarImage src={ack.userDetails?.avatar || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                          {ack.userDetails?.firstName?.charAt(0)}
                          {ack.userDetails?.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold">
                          {ack.userDetails?.firstName} {ack.userDetails?.lastName}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <Calendar className="h-2.5 w-2.5" />
                          {formatRelativeTime(ack.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DrawerFooter className="border-t border-border/60 p-6">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full font-bold">Close List</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
