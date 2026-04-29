"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Landmark, Calendar, CreditCard, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeeSummaryCardProps {
  student: any;
  feeDetails: {
    studentId: string;
    studentName: string;
    totalFee: number;
    totalPaid: number;
    amount: number; // remaining
    courseName: string;
    academicYear: string;
    description: string;
    dueDate: string;
  };
  paymentId: string | null;
}

export function FeeSummaryCard({ student, feeDetails, paymentId }: FeeSummaryCardProps) {
  return (
    <Card className="border-border/40 shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border-2">
      <CardHeader className="bg-primary/[0.03] border-b border-border/40 p-6 sm:p-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
              <Landmark className="h-3 w-3" />
              Academic Financials
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-4xl font-black tracking-tighter leading-none">{feeDetails.courseName}</h2>
              <p className="text-muted-foreground font-medium flex items-center gap-2 text-sm sm:text-base">
                <Calendar className="h-4 w-4" />
                Session: <span className="font-bold text-foreground">{feeDetails.academicYear}</span>
              </p>
            </div>
          </div>
          <div className="bg-white/5 border border-border/40 rounded-2xl p-4 min-w-[200px]">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Student UID</Label>
            <p className="font-mono text-sm font-black truncate">{student.id}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 sm:p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Total Course Fee */}
          <div className="space-y-3 p-6 rounded-3xl bg-muted/20 border border-border/40 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Total Course Fee</span>
            </div>
            <div className="space-y-0.5">
              <div className="text-3xl font-black tracking-tight tabular-nums">
                ₹{(feeDetails.totalFee || 0).toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] font-bold text-muted-foreground">Standard Academic Fee</div>
            </div>
          </div>

          {/* Total Amount Paid */}
          <div className="space-y-3 p-6 rounded-3xl bg-emerald-500/[0.03] border border-emerald-500/20 hover:bg-emerald-500/[0.06] transition-colors">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Total Amount Paid</span>
            </div>
            <div className="space-y-0.5">
              <div className="text-3xl font-black tracking-tight tabular-nums text-emerald-600">
                ₹{(feeDetails.totalPaid || 0).toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] font-bold text-emerald-600/60">Cleared via Ledger</div>
            </div>
          </div>

          {/* Remaining Balance */}
          <div className={cn(
            "space-y-3 p-6 rounded-3xl border-2 transition-all duration-300",
            feeDetails.amount > 0 
              ? "bg-red-500/5 border-red-500/20 hover:bg-red-500/10 shadow-lg shadow-red-500/5" 
              : "bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10 shadow-lg shadow-emerald-500/5"
          )}>
            <div className={cn(
              "flex items-center gap-2",
              feeDetails.amount > 0 ? "text-red-600" : "text-emerald-600"
            )}>
              <Clock className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Remaining Balance</span>
            </div>
            <div className="space-y-0.5">
              <div className={cn(
                "text-3xl font-black tracking-tight tabular-nums",
                feeDetails.amount > 0 ? "text-red-600" : "text-emerald-600"
              )}>
                ₹{(feeDetails.amount || 0).toLocaleString("en-IN")}
              </div>
              <div className={cn(
                "text-[10px] font-bold",
                feeDetails.amount > 0 ? "text-red-600/60 italic" : "text-emerald-600/60"
              )}>
                {feeDetails.amount > 0 ? `Due by ${feeDetails.dueDate}` : "All dues cleared"}
              </div>
            </div>
          </div>
        </div>

        {paymentId && (
          <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider block leading-none mb-1">Receipt Verified</span>
                <span className="font-mono text-xs font-bold text-emerald-700">{paymentId}</span>
              </div>
            </div>
            <div className="text-[10px] font-black text-emerald-600/40 uppercase tracking-widest">Digital Signature Active</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

