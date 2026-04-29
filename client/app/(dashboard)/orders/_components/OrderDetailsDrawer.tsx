"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerDescription, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerTitle 
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, QrCode, BookOpen, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order } from "@/services/api/client";

interface OrderDetailsDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onShowQR: () => void;
  statusConfig: Record<string, { label: string; color: string; icon: LucideIcon }>;
}

export function OrderDetailsDrawer({
  order,
  isOpen,
  onClose,
  onShowQR,
  statusConfig,
}: OrderDetailsDrawerProps) {
  if (!order) return null;

  return (
    <Drawer open={isOpen} onOpenChange={(o) => !o && onClose()} direction="right">
      <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
        <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
          <DrawerHeader className="border-b border-border/60 p-6 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <DrawerTitle className="text-2xl font-black tracking-tight">Order #{order.id.toString().slice(-8).toUpperCase()}</DrawerTitle>
                <DrawerDescription className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <span className="bg-muted px-2 py-0.5 rounded text-[10px] font-bold">{new Date(order.orderDate).toLocaleDateString()}</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span>Payment Complete</span>
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-muted/50 hover:bg-muted">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="space-y-4">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-1">Item List</h4>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/60 shadow-sm group">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/40 transition-colors group-hover:border-primary/30">
                        {item.product?.image ? (
                          <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-muted-foreground/20 m-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground text-sm truncate">{item.product?.name || 'Academic Unit'}</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                         <div className="flex items-center gap-1 justify-end">
                            <img src="/bcoin.svg" className="h-3 w-3" alt="" />
                            <span className="font-black text-sm text-foreground">{(Number(item.price) * item.quantity).toLocaleString()}</span>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
            </div>

            <div className="p-6 rounded-3xl bg-muted/30 border border-border/50 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Price</span>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-foreground tabular-nums tracking-tighter">{Number(order.totalAmount).toLocaleString()}</span>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">B-Coins</span>
                </div>
              </div>

              {statusConfig[order.status] && (
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                   <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Fulfillment Status</span>
                   <Badge className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 border", statusConfig[order.status].color)}>
                    {statusConfig[order.status].label}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <DrawerFooter className="border-t border-border/60 p-6 gap-3">
            {order.orderType !== 'digital' && order.status === 'order_placed' && order.qrCode && (
              <Button onClick={onShowQR} className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                <QrCode className="w-5 h-5 mr-3" />
                Show QR Code
              </Button>
            )}

            {order.orderType === 'digital' && (
              <Link href="/library" className="w-full">
                <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                  <BookOpen className="w-5 h-5 mr-3" />
                  Access Library
                </Button>
              </Link>
            )}
            
            <DrawerClose asChild>
              <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-border/60">Close Details</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
