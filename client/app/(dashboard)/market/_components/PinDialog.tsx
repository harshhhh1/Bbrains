"use client";

import React, { useState } from "react";
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { CheckCircle2, Loader2, X } from "lucide-react";

interface PinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (pin: string) => void;
  isProcessing: boolean;
  description?: string;
  title?: string;
}

export function PinDialog({
  open,
  onOpenChange,
  onConfirm,
  isProcessing,
  description = "Enter your 6-digit PIN to authorize this transaction.",
  title = "Confirm Authorization"
}: PinDialogProps) {
  const [pin, setPin] = useState("");

  const handleSubmit = () => {
    if (pin.length === 6) {
      onConfirm(pin);
      setPin("");
    }
  };

  return (
    <Drawer open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setPin(""); }} direction="right">
      <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md before:inset-0 before:rounded-none before:border-border before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
        <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
          <DrawerHeader className="border-b border-border/60 p-6 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <DrawerTitle className="text-xl font-black">{title}</DrawerTitle>
                <DrawerDescription className="text-sm font-medium text-muted-foreground">{description}</DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 p-6 flex flex-col items-center justify-center">
            <div className="py-6">
              <InputOTP maxLength={6} value={pin} onChange={setPin}>
                <InputOTPGroup className="gap-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="h-14 w-11 rounded-xl border-border bg-muted/20 text-xl font-black focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <DrawerFooter className="border-t border-border/60 p-6">
            <Button
              onClick={handleSubmit}
              disabled={pin.length < 6 || isProcessing}
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize & Pay"}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
