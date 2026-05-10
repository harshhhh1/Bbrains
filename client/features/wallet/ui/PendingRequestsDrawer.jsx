"use client";

import React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, ArrowDownLeft, Check, Loader2 } from "lucide-react";
import { getInitials } from "@/features/wallet/model/utils";

export function PendingRequestsDrawer({
  open,
  onOpenChange,
  requests,
  onReject,
  onAccept,
  respondingId,
}) {
  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-lg before:inset-0 before:rounded-none before:border-border before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
        <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
          <DrawerHeader className="border-b border-border/60 p-6 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <DrawerTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                  <ArrowDownLeft className="h-6 w-6 text-primary" />
                  Asset Solicitations
                </DrawerTitle>
                <DrawerDescription className="font-medium">
                  Pending requests for B-Coin transfers to other agents.
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-muted/40 hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-6">
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                <ArrowDownLeft className="w-16 h-16 text-muted-foreground mb-2" />
                <p className="text-xs font-black uppercase tracking-[0.2em]">
                  Registry Clean
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-card border border-border/60 rounded-3xl p-6 space-y-6 shadow-sm group hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/10">
                        {request.fromUser?.avatarUrl && (
                          <AvatarImage src={request.fromUser.avatarUrl} />
                        )}
                        <AvatarFallback className="text-sm font-black bg-primary/10 text-primary">
                          {getInitials(
                            request.fromUser?.displayName ||
                              request.fromUser?.username ||
                              "?",
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-foreground truncate tracking-tight">
                          {request.fromUser?.displayName ||
                            request.fromUser?.username ||
                            "Verified Agent"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <img src="/bcoin.svg" className="h-4 w-4" alt="" />
                          <span className="font-black text-primary tabular-nums">
                            {request.amount}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/30 rounded-2xl p-4 border border-border/40 relative overflow-hidden">
                      <p className="text-sm font-medium text-foreground/80 leading-relaxed italic">
                        &ldquo;{request.reason}&rdquo;
                      </p>
                      <div className="absolute top-0 right-0 p-2 opacity-5">
                        <ArrowDownLeft className="w-12 h-12" />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 h-12 rounded-xl font-bold gap-2 border-rose-500/20 text-rose-600 hover:bg-rose-500/10 hover:border-rose-500/40 transition-all"
                        onClick={() => onReject(request.id)}
                        disabled={respondingId === request.id}
                      >
                        {respondingId === request.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        Reject
                      </Button>
                      <Button
                        className="flex-1 h-12 rounded-xl font-bold gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                        onClick={() => onAccept(request)}
                        disabled={respondingId === request.id}
                      >
                        <Check className="w-4 h-4" />
                        Authorize
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DrawerFooter className="border-t border-border/60 p-8 bg-muted/5">
            <DrawerClose asChild>
              <Button
                variant="ghost"
                className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px]"
              >
                Dismiss Registry
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
