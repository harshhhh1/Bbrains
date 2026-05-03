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
import { X, ScanLine } from "lucide-react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { toast } from "sonner";

interface ScanPayDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanSuccess: (walletId: string) => void;
}

export function ScanPayDrawer({
  open,
  onOpenChange,
  onScanSuccess
}: ScanPayDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-0 data-[vaul-drawer-direction=bottom]:max-h-[88vh] before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-t-[2.5rem]">
        <div className="flex flex-col overflow-hidden">
          <DrawerHeader className="border-b border-border/60 p-8 text-center items-center">
            <div className="w-16 h-16 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-4">
              <ScanLine className="h-8 w-8 text-primary" />
            </div>
            <DrawerTitle className="text-3xl font-black tracking-tight">Optical Scanner</DrawerTitle>
            <DrawerDescription className="text-base font-medium max-w-xs mx-auto">
              Scan another agent&apos;s wallet token to initialize an immediate transfer.
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="flex flex-col items-center p-8 space-y-8">
            <div className="relative w-72 h-72 rounded-[3rem] overflow-hidden border-4 border-primary/20 shadow-2xl bg-black group">
              <Scanner
                onScan={(result) => {
                  if (result?.[0]?.rawValue) {
                    try {
                      const data = JSON.parse(result[0].rawValue);
                      if (data.walletId) {
                        onScanSuccess(data.walletId);
                      }
                    } catch {
                      toast.error("Invalid Token Data");
                    }
                  }
                }}
                scanDelay={500}
                allowMultiple={false}
                components={{ finder: true }}
              />
              <div className="absolute inset-0 pointer-events-none border-[20px] border-black/40" />
            </div>
            
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse text-center">
               Align token within viewport
            </p>
          </div>

          <DrawerFooter className="border-t border-border/60 p-8 bg-muted/5">
            <DrawerClose asChild>
              <Button variant="ghost" className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px]">Cancel Scan</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
