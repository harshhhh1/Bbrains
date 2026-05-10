"use client";

import React from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FeePaymentForm({
  feeDetails,
  amount,
  isPaying,
  onAmountChange,
  onPayNow,
}) {
  if (!feeDetails || feeDetails.amount <= 0) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <Label
          htmlFor="amount"
          className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1"
        >
          Amount to Pay (INR)
        </Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">
            ₹
          </span>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            className="pl-8 h-16 rounded-2xl border-2 focus:border-primary focus:ring-0 text-xl font-black bg-muted/10"
            value={amount || ""}
            onChange={(e) => onAmountChange(Number(e.target.value))}
          />
        </div>
        <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 px-1">
          <CheckCircle2 className="size-3 text-emerald-500" />
          Maximum payable: {feeDetails.amount.toLocaleString("en-IN")} INR
        </p>
      </div>

      <Button
        size="lg"
        onClick={onPayNow}
        className="w-full min-h-[4rem] h-16 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20"
        disabled={isPaying || amount <= 0 || amount > feeDetails.amount}
      >
        {isPaying ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          "Pay Now"
        )}
      </Button>
    </div>
  );
}
