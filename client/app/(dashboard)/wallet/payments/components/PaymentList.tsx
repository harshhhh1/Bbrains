"use client";

import React from "react";
import { Wallet, ShoppingBag, Eye } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Payment } from "../types";
import { formatDate, getStatusColor } from "../utils";

interface PaymentListProps {
  filteredPayments: Payment[];
  setSelectedPayment: (payment: Payment) => void;
}

export function PaymentList({ filteredPayments, setSelectedPayment }: PaymentListProps) {
  if (filteredPayments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-muted p-4 rounded-full mb-4">
          <Wallet className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">No payments found</h3>
        <p className="text-muted-foreground">Adjust your filters or search query</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/60">
      {filteredPayments.map((payment) => (
        <div
          key={payment.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/50 transition-colors gap-4"
        >
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10 border bg-background shrink-0">
              <AvatarFallback className={payment.type === "wallet" ? "bg-brand-blue/10 text-brand-blue" : "bg-brand-orange/10 text-brand-orange"}>
                {payment.type === "wallet" ? <Wallet className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="font-semibold text-foreground leading-none">{payment.description}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-mono text-xs bg-muted px-1.5 rounded">{payment.id}</span>
                <span>•</span>
                <span>{formatDate(payment.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 pl-14 sm:pl-0">
            <p className={`font-bold ${payment.amount > 0 ? "text-brand-mint" : "text-foreground"}`}>
              {payment.amount > 0 ? "+" : ""}{payment.amount} B-Coins
            </p>
            <div className="flex items-center gap-3">
              <Badge className={`text-xs font-bold ${getStatusColor(payment.status)}`}>
                {payment.status}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedPayment(payment)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Eye className="w-4 h-4" />
                <span className="sr-only">View Details</span>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
