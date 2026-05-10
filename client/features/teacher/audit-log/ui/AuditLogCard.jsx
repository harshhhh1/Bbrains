"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

function getInitials(username) {
  if (!username) return "?";
  return username.slice(0, 2).toUpperCase();
}

function fmtDate(value) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatChange(change) {
  if (!change) return null;
  const before = change.before;
  const after = change.after;
  if (!before && !after) return null;
  return { before, after };
}

const categoryColors = {
  AUTH: "bg-blue-500/15 text-blue-600 border-blue-500/20",
  ACADEMIC: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
  MARKET: "bg-orange-500/15 text-orange-600 border-orange-500/20",
  FINANCE: "bg-amber-500/15 text-amber-600 border-amber-500/20",
  USER: "bg-purple-500/15 text-purple-600 border-purple-500/20",
  SYSTEM: "bg-slate-500/15 text-slate-600 border-slate-500/20",
};

export function AuditLogCard({ log }) {
  const change = formatChange(log.change);

  return (
    <Card className="border-border/60 hover:border-primary/30 transition-colors group overflow-hidden bg-card/50">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-border shadow-sm">
                <AvatarImage
                  src={log.user?.avatar ?? undefined}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-black">
                  {getInitials(log.user?.username ?? log.userId ?? "S")}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <p className="font-bold text-sm text-foreground leading-none">
                  {log.user?.username ?? log.userId ?? "System Operator"}
                </p>
                <Badge
                  className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-2 py-0 border",
                    categoryColors[log.category],
                  )}
                >
                  {log.category}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter text-muted-foreground bg-muted/40 px-2 py-1 rounded-lg">
              <Clock className="size-3 text-primary/50" />
              {fmtDate(log.createdAt)}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="font-black text-foreground uppercase tracking-tight text-xs">
              {log.action}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-40 tracking-widest">
              on
            </span>
            <span className="font-bold text-foreground/80">{log.entity}</span>
            {log.entityId && (
              <>
                <span className="text-muted-foreground/30">#</span>
                <span className="text-muted-foreground font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border/50">
                  {log.entityId}
                </span>
              </>
            )}
          </div>

          {change && (
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3 text-[11px] bg-muted/30 rounded-2xl p-4 border border-border/40">
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase text-muted-foreground/50 tracking-widest mb-1.5 ml-1">
                  Previous State
                </p>
                <div className="bg-card/50 p-3 rounded-xl border border-border/40 font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all max-h-32 shadow-inner">
                  {change.before ? JSON.stringify(change.before, null, 2) : "—"}
                </div>
              </div>

              <div className="flex justify-center sm:pt-4">
                <ArrowRight className="size-4 text-primary/40" />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase text-primary/50 tracking-widest mb-1.5 ml-1">
                  New State
                </p>
                <div className="bg-primary/[0.02] p-3 rounded-xl border border-primary/20 font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all max-h-32 shadow-inner">
                  {change.after ? JSON.stringify(change.after, null, 2) : "—"}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
