"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

export function PinDialog({
  open,
  onOpenChange,
  onConfirm,
  isProcessing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (pin: string) => void;
  isProcessing: boolean;
}) {
  const [pin, setPin] = useState("");

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setPin(""); }}>
      <DialogContent className="sm:max-w-md rounded-[2.5rem] border-white/10 bg-slate-950/95 backdrop-blur-2xl p-8 shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="w-14 h-14 bg-brand-orange/10 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-brand-orange" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-white text-center">Confirm Authorization</DialogTitle>
          <DialogDescription className="text-base font-medium text-white/50 text-center">Enter your 6-digit cryptographic PIN to sign this transaction.</DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={pin} onChange={setPin}>
              <InputOTPGroup className="gap-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} className="h-14 w-11 rounded-xl border-white/10 bg-white/5 text-xl font-black focus:border-brand-orange/50" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onConfirm(pin)} disabled={pin.length < 6 || isProcessing} className="w-full h-14 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase tracking-widest shadow-lg shadow-brand-orange/20 disabled:opacity-50">
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign & Finalize"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
