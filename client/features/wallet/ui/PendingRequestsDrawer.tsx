"use client";

import { 
  DrawerClose, 
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { DrawerShell } from "@/components/ui/drawer-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Stack } from "@/components/layout/page-primitives";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, ArrowDownLeft, Check, Loader2 } from "lucide-react";
import { getInitials } from "@/features/wallet/model/utils";
import type { MoneyRequest } from "@/services/api/client";

interface PendingRequestsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requests: MoneyRequest[];
  onReject: (id: string) => void;
  onAccept: (request: MoneyRequest) => void;
  respondingId: string | null;
}

export function PendingRequestsDrawer({
  open,
  onOpenChange,
  requests,
  onReject,
  onAccept,
  respondingId
}: PendingRequestsDrawerProps) {
  return (
    <DrawerShell
      open={open}
      onOpenChange={onOpenChange}
      width="md"
      title={
        <span className="flex items-center gap-2 text-2xl font-black tracking-tight">
          <ArrowDownLeft className="size-6 text-primary" />
          Asset Solicitations
        </span>
      }
      description="Pending requests for B-Coin transfers to other agents."
      footer={
        <DrawerClose asChild>
          <Button variant="ghost" className="h-12 w-full rounded-xl text-[10px] font-black uppercase tracking-widest">
            Dismiss Registry
          </Button>
        </DrawerClose>
      }
      footerClassName="bg-muted/5 p-8"
    >
            {requests.length === 0 ? (
              <EmptyState
                icon={<ArrowDownLeft className="size-16" />}
                title="Registry Clean"
                className="h-full border-none bg-transparent opacity-40"
              />
            ) : (
              <Stack>
                {requests.map((request) => (
                  <div key={request.id} className="bg-card border border-border/60 rounded-3xl p-6 space-y-6 shadow-sm group hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/10">
                        {request.fromUser?.avatarUrl && (
                          <AvatarImage src={request.fromUser.avatarUrl} />
                        )}
                        <AvatarFallback className="text-sm font-black bg-primary/10 text-primary">
                          {getInitials(request.fromUser?.displayName || request.fromUser?.username || "?")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-foreground truncate tracking-tight">
                          {request.fromUser?.displayName || request.fromUser?.username || "Verified Agent"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                           <img src="/bcoin.svg" className="h-4 w-4" alt="" />
                           <span className="font-black text-primary tabular-nums">{request.amount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/30 rounded-2xl p-4 border border-border/40 relative overflow-hidden">
                      <p className="text-sm font-medium text-foreground/80 leading-relaxed italic">&ldquo;{request.reason}&rdquo;</p>
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
                        {respondingId === request.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
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
              </Stack>
            )}
    </DrawerShell>
  );
}
