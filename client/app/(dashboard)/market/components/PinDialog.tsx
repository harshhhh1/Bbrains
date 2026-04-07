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
  description,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (pin: string) => void;
  isProcessing: boolean;
  description: string;
}) {
  const [pin, setPin] = useState("");

  const handleSubmit = () => {
    if (pin.length === 6) {
      onConfirm(pin);
      setPin("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setPin(""); }}>
      <DialogContent className="sm:max-w-md rounded-3xl border-white/10 bg-slate-950/95 backdrop-blur-2xl p-8 shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="w-14 h-14 bg-brand-orange/10 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-brand-orange" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-white text-center">Confirm Purchase</DialogTitle>
          <DialogDescription className="text-base font-medium text-white/50 text-center">{description}</DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={pin} onChange={setPin}>
              <InputOTPGroup className="gap-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="h-14 w-11 rounded-xl border-white/10 bg-white/5 text-xl font-black focus:border-brand-orange/50 focus:ring-2 focus:ring-brand-orange/20"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={pin.length < 6 || isProcessing}
            className="w-full h-14 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase tracking-widest shadow-lg shadow-brand-orange/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm & Pay"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
