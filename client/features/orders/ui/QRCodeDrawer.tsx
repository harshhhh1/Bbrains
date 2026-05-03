"use client";

import React from "react";
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
import { X, QrCode } from "lucide-react";
import { QRCodeDisplay } from "@/components/qr-code-display";
import type { Order } from "@/services/api/client";

interface QRCodeDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QRCodeDrawer({
  order,
  isOpen,
  onClose,
}: QRCodeDrawerProps) {
  if (!order) return null;

  return (
    <Drawer open={isOpen} onOpenChange={(o) => !o && onClose()} direction="right">
      <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-sm before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
        <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
          <DrawerHeader className="border-b border-border/60 p-6 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                  <QrCode className="h-5 w-5 text-primary" />
                </div>
                <DrawerTitle className="text-xl font-black">Pickup Code</DrawerTitle>
                <DrawerDescription className="text-sm font-medium text-muted-foreground">Present this code to the staff to confirm delivery.</DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
            {order.qrCode && (
              <div className="p-6 bg-white rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-border/20 scale-110">
                <QRCodeDisplay value={order.qrCode} size={200} label="Pickup Code" />
              </div>
            )}
            <div className="text-center space-y-2">
              <p className="text-xs font-black uppercase tracking-widest text-primary">Order Number {order.id.toString().slice(-6).toUpperCase()}</p>
              <p className="text-[10px] text-muted-foreground font-bold max-w-[220px] leading-relaxed">System scan required for digital receipt generation.</p>
            </div>
          </div>

          <DrawerFooter className="border-t border-border/60 p-6">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
