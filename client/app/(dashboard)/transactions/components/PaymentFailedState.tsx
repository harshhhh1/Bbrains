"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { XCircle, RefreshCcw, AlertTriangle } from "lucide-react";

interface PaymentFailedStateProps {
  error: string | null;
  onRetry: () => void;
}

export function PaymentFailedState({ error, onRetry }: PaymentFailedStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-8 bg-red-500/5 rounded-[2.5rem] border-2 border-dashed border-red-500/20">
      <div className="relative">
        <div className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
        <XCircle className="relative h-24 w-24 text-red-500" />
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-black tracking-tight text-red-600">Payment Failed</h2>
        <p className="text-muted-foreground font-medium max-w-sm">
          {error || "We couldn't process your payment at this time. Please check your bank account or try a different payment method."}
        </p>
      </div>

      <div className="bg-red-50 border border-red-200 px-6 py-4 rounded-2xl flex items-center gap-3 text-red-700">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <p className="text-xs font-bold text-left">
          If money was deducted from your account, it will be refunded automatically within 5-7 business days.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Button 
          onClick={onRetry}
          className="flex-1 min-h-[4rem] h-16 rounded-2xl font-black uppercase tracking-widest text-sm bg-red-600 hover:bg-red-700 shadow-xl shadow-red-500/20 gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
