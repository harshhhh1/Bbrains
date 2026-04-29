"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Landmark, Calendar, CreditCard } from "lucide-react";

interface FeeSummaryCardProps {
  student: any;
  feeDetails: {
    amount: number;
    description: string;
    dueDate: string;
  };
  paymentId: string | null;
}

export function FeeSummaryCard({ student, feeDetails, paymentId }: FeeSummaryCardProps) {
  return (
    <Card className="border-border/60 shadow-xl bg-card/50 backdrop-blur-sm rounded-3xl overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border/40 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Landmark className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl font-black tracking-tight">School Fees</CardTitle>
        </div>
        <CardDescription className="font-medium">
          Detailed breakdown of your current academic financial obligations.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Registrar Name</Label>
            <div className="relative">
               <Input
                defaultValue={`${student.userDetails?.firstName} ${student.userDetails?.lastName}`}
                readOnly
                className="bg-muted/20 border-border/40 font-bold h-11 pl-4 rounded-xl"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">System Identifier</Label>
            <Input
              defaultValue={student.id}
              readOnly
              className="bg-muted/20 border-border/40 font-mono text-xs h-11 pl-4 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Fee Classification</Label>
            <div className="flex items-center gap-2 px-4 h-11 bg-muted/20 border border-border/40 rounded-xl">
              <CreditCard className="h-4 w-4 text-primary/60" />
              <span className="text-sm font-bold truncate">{feeDetails.description}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Maturity Date</Label>
            <div className="flex items-center gap-2 px-4 h-11 bg-muted/20 border border-border/40 rounded-xl">
              <Calendar className="h-4 w-4 text-primary/60" />
              <span className="text-sm font-bold">{feeDetails.dueDate}</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border/40">
          <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1 mb-3 block">Total Outstanding Balance</Label>
          <div className="flex items-center gap-4 p-6 bg-primary/5 rounded-2xl border border-primary/20">
            <span className="text-2xl font-black text-primary/40 tracking-tighter italic">INR</span>
            <span className="text-5xl font-black tracking-tight leading-none tabular-nums">
              {feeDetails.amount.toLocaleString("en-IN")}
            </span>
          </div>
          
          {paymentId && (
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Payment Verified</span>
              <span className="font-mono text-xs font-bold text-emerald-700">{paymentId}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
