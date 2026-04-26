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
import { X, QrCode as QrIcon, Share2, Copy } from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import type { WalletData } from "@/services/api/client";

interface ReceiveMoneyDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallet: WalletData | null;
}

export function ReceiveMoneyDrawer({
  open,
  onOpenChange,
  wallet
}: ReceiveMoneyDrawerProps) {
  if (!wallet) return null;

  const qrValue = JSON.stringify({ 
    walletId: wallet.id, 
    name: wallet.user?.username || 'User' 
  });

  const copyId = () => {
    navigator.clipboard.writeText(wallet.id);
    toast.success("Wallet ID copied to terminal");
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-0 data-[vaul-drawer-direction=bottom]:max-h-[85vh] before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-t-[2.5rem]">
        <div className="flex flex-col overflow-hidden">
          <DrawerHeader className="border-b border-border/60 p-8 text-center items-center">
            <div className="w-16 h-16 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-4">
              <QrIcon className="h-8 w-8 text-primary" />
            </div>
            <DrawerTitle className="text-3xl font-black tracking-tight">Receive Assets</DrawerTitle>
            <DrawerDescription className="text-base font-medium max-w-xs mx-auto">
              Present this token to another agent to initialize an incoming transfer.
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="flex flex-col items-center py-10 px-8 space-y-10">
            <div className="p-8 bg-white rounded-[3rem] shadow-2xl shadow-primary/5 border-4 border-primary/5 relative group">
              <QRCode
                value={qrValue}
                size={220}
                level="H"
                className="transition-transform duration-500 group-hover:scale-95"
              />
              <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] -z-10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="w-full max-w-sm space-y-4">
               <div className="flex flex-col items-center gap-1.5 p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Unique System Identifier</span>
                  <span className="font-mono text-sm font-bold tracking-tighter text-foreground">{wallet.id}</span>
               </div>
               
               <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold gap-2" onClick={copyId}>
                    <Copy className="h-4 w-4" /> Copy ID
                  </Button>
                  <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold gap-2">
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
               </div>
            </div>
          </div>

          <DrawerFooter className="border-t border-border/60 p-8 bg-muted/5">
            <DrawerClose asChild>
              <Button variant="ghost" className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px]">Dismiss Token</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
