"use client";

import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { CheckCircle2 } from "lucide-react";

export function TransactionReceiptDrawer({ open, onOpenChange, data }) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-0 data-[vaul-drawer-direction=bottom]:max-h-[75vh] before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-t-[3rem]">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Transaction Receipt</DrawerTitle>
          <DrawerDescription>
            Details of your successful B-Coin transfer
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-10 text-center space-y-10">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="relative w-24 h-24 rounded-[2.5rem] bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-500/20 mx-auto">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-black tracking-tight">
              Settlement Complete
            </h3>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-60">
              System Ledger Updated {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="bg-muted/30 rounded-[2.5rem] p-8 space-y-6 border border-border/50 shadow-inner">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Recipient Identity
              </span>
              <span className="font-mono text-xs font-bold text-foreground bg-card px-3 py-1 rounded-lg border border-border/60">
                {data.recipientId}
              </span>
            </div>

            <div className="flex justify-between items-end border-t border-border/40 pt-6">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                Volume Transferred
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-foreground tabular-nums tracking-tighter">
                  {data.amount}
                </span>
                <span className="text-xs font-black text-primary uppercase tracking-widest">
                  B-Coins
                </span>
              </div>
            </div>

            {data.note && (
              <div className="text-left border-t border-border/40 pt-6">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block mb-2">
                  Optional Note
                </span>
                <p className="text-sm font-medium text-foreground/70 italic">
                  &ldquo;{data.note}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
