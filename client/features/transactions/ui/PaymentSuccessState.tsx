"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, RefreshCcw } from "lucide-react";
import { downloadReceipt } from "@/features/transactions/model/utils";

interface PaymentSuccessStateProps {
  paymentId: string | null;
  transaction: any;
  student: any;
  onReset: () => void;
}

export function PaymentSuccessState({ paymentId, transaction, student, onReset }: PaymentSuccessStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-8 bg-emerald-500/5 rounded-[2.5rem] border-2 border-dashed border-emerald-500/20">
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <CheckCircle2 className="relative h-24 w-24 text-emerald-500" />
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-black tracking-tight">Transaction Successful</h2>
        <p className="text-muted-foreground font-medium max-w-sm">
          Your institutional fees have been processed and the digital ledger has been updated.
        </p>
      </div>

      {paymentId && (
        <div className="bg-white/5 border border-emerald-500/30 px-6 py-3 rounded-2xl">
          <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-1">Receipt ID</p>
          <p className="font-mono text-sm font-bold">{paymentId}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Button 
          variant="outline" 
          onClick={onReset}
          className="flex-1 min-h-[4rem] h-16 rounded-2xl font-bold text-base gap-2 border-emerald-500/20 hover:bg-emerald-500/10"
        >
          <RefreshCcw className="h-4 w-4" />
          Another Payment
        </Button>
        {transaction && (
          <Button 
            onClick={() => downloadReceipt(transaction, student)}
            className="flex-1 min-h-[4rem] h-16 rounded-2xl font-bold text-base gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20"
          >
            <Download className="h-4 w-4" />
            Save Receipt
          </Button>
        )}
      </div>
    </div>
  );
}
