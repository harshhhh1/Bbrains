"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Landmark, Calendar, CreditCard, Clock, CheckCircle2, ShieldCheck } from "lucide-react";
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
      <CardHeader className="bg-primary/3 border-b border-border/40 p-6 sm:p-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">
                Financial Statement
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-tight text-foreground">{feeDetails.studentName}</h2>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground pt-1">
                <p className="font-bold flex items-center gap-2 text-sm">
                  <Landmark className="h-4 w-4" />
                  {feeDetails.courseName}
                </p>
                <div className="h-1 w-1 rounded-full bg-border hidden sm:block" />
                <p className="font-medium flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  Session: <span className="font-bold text-foreground">{feeDetails.academicYear}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="bg-muted/30 border border-border/40 rounded-3xl p-6 min-w-[180px] shadow-inner">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2 opacity-60">Reference ID</Label>
            <p className="font-mono text-sm font-black text-foreground">{student.id}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 sm:p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Total Course Fee */}
          <div className="space-y-4 p-8 rounded-[2rem] bg-card border border-border/60 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="p-2 bg-muted rounded-xl">
                <CreditCard className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Program Fee</span>
            </div>
            <div className="space-y-0.5">
              <div className="text-4xl font-black tracking-tighter tabular-nums">
                ₹{(feeDetails.totalFee || 0).toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider opacity-60">Annual Tuition</div>
            </div>
          </div>

          {/* Total Amount Paid */}
          <div className="space-y-4 p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/20 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 text-emerald-600">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Already Paid</span>
            </div>
            <div className="space-y-0.5">
              <div className="text-4xl font-black tracking-tighter tabular-nums text-emerald-600">
                ₹{(feeDetails.totalPaid || 0).toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-wider">Confirmed Payments</div>
            </div>
          </div>

          {/* Remaining Balance */}
          <div className={cn(
            "space-y-4 p-8 rounded-[2rem] border-2 transition-all duration-300 hover:shadow-lg",
            feeDetails.amount > 0 
              ? "bg-red-500/[0.02] border-red-500/10 shadow-red-500/5" 
              : "bg-emerald-500/[0.02] border-emerald-500/10 shadow-emerald-500/5"
          )}>
            <div className={cn(
              "flex items-center gap-3",
              feeDetails.amount > 0 ? "text-red-600" : "text-emerald-600"
            )}>
              <div className={cn(
                "p-2 rounded-xl",
                feeDetails.amount > 0 ? "bg-red-500/10" : "bg-emerald-500/10"
              )}>
                <Clock className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Balance Due</span>
            </div>
            <div className="space-y-0.5">
              <div className={cn(
                "text-4xl font-black tracking-tighter tabular-nums",
                feeDetails.amount > 0 ? "text-red-600" : "text-emerald-600"
              )}>
                ₹{(feeDetails.amount || 0).toLocaleString("en-IN")}
              </div>
              <div className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                feeDetails.amount > 0 ? "text-red-600/60" : "text-emerald-600/60"
              )}>
                {feeDetails.amount > 0 ? `Next due: ${feeDetails.dueDate}` : "Perfect — no dues"}
              </div>
            </div>
          </div>
        </div>

        {paymentId && (
          <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-600 shadow-sm">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest block mb-1 opacity-70">Payment Confirmed</span>
                <span className="font-mono text-sm font-black text-emerald-700">{paymentId}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/10">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.2em]">Secure Transaction</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

